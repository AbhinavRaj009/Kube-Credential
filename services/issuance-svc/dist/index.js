import express from "express";
import helmet from "helmet";
import cors from "cors";
import crypto from "crypto";
import db from "./db.js";
import { z } from "zod";
import fetch from "node-fetch";
const app = express();
app.use(helmet());
app.use(express.json({ limit: "256kb" }));
app.use(cors({ origin: "*" })); // tighten in prod if needed
const HOSTNAME = process.env.HOSTNAME ?? "worker-local";
const REPLICATE_URL = process.env.REPLICATE_URL; // e.g. http://localhost:3001
const CredentialSchema = z.record(z.any());
function toStableId(obj) {
    const json = JSON.stringify(obj);
    return crypto.createHash("sha256").update(json).digest("hex");
}
async function replicateToVerification(payload) {
    try {
        if (!REPLICATE_URL)
            return;
        await fetch(`${REPLICATE_URL}/replicate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    }
    catch (e) {
        console.error("replication failed:", e.message);
    }
}
app.get("/healthz", (_req, res) => {
    res.json({ ok: true, service: "issuance" });
});
app.post("/issue", async (req, res) => {
    const parsed = CredentialSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid credential" });
    }
    const credential = parsed.data;
    const credentialId = toStableId(credential);
    const getStmt = db.prepare("SELECT credential_id, issued_at, worker_id FROM issued_credentials WHERE credential_id = ?");
    const existing = getStmt.get(credentialId);
    if (existing) {
        // replicate even on duplicate (idempotent on verification side)
        await replicateToVerification({
            credentialId,
            issuedAt: existing.issued_at,
            workerId: existing.worker_id,
        });
        const resp = { status: "already_issued", credentialId };
        return res.json(resp);
    }
    const issuedAt = new Date().toISOString();
    const workerId = HOSTNAME;
    const insertStmt = db.prepare("INSERT INTO issued_credentials (credential_id, payload_json, issued_at, worker_id) VALUES (?, ?, ?, ?)");
    insertStmt.run(credentialId, JSON.stringify(credential), issuedAt, workerId);
    const resp = { status: "issued", credentialId, issuedAt, workerId };
    // replicate on fresh issue
    await replicateToVerification({ credentialId, issuedAt, workerId });
    return res.json({ ...resp, message: `credential issued by ${workerId}` });
});
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
    console.log(`issuance-svc on :${port}`);
});
