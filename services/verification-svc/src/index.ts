import express from "express";
import helmet from "helmet";
import cors from "cors";
import crypto from "crypto";
import db from "./db.js";
import { z } from "zod";

const app = express();
app.use(helmet());
app.use(express.json({ limit: "256kb" }));
app.use(cors({ origin: "*" }));

const HOSTNAME = process.env.HOSTNAME ?? "worker-local";
const CredentialSchema = z.record(z.any());
const toId = (o: unknown) => crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

app.get("/healthz", (_req, res) => res.json({ ok: true, service: "verification" }));

// receives replication from issuance (idempotent)
app.post("/replicate", (req, res) => {
  const body = req.body as { credentialId?: string; issuedAt?: string; workerId?: string };
  if (!body?.credentialId || !body?.issuedAt || !body?.workerId) {
    return res.status(400).json({ error: "Invalid replicate payload" });
  }
  try {
    db.prepare("INSERT OR IGNORE INTO issued_credentials (credential_id, issued_at, worker_id) VALUES (?, ?, ?)")
      .run(body.credentialId, body.issuedAt, body.workerId);
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "failed to replicate" });
  }
});

app.post("/verify", (req, res) => {
  const parsed = CredentialSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid credential" });

  const id = toId(parsed.data);

  const stmt = db.prepare(
    "SELECT credential_id, issued_at, worker_id FROM issued_credentials WHERE credential_id = ?"
  );

  // 👇 Add this explicit type so TS knows the shape
  type Row = { credential_id: string; issued_at: string; worker_id: string } | undefined;
  const row = stmt.get(id) as Row;

  if (!row) {
    return res.json({ isValid: false, credentialId: id, workerId: HOSTNAME });
  }
  return res.json({
    isValid: true,
    credentialId: row.credential_id,
    issuedAt: row.issued_at,
    workerId: row.worker_id,
  });
});


const port = process.env.PORT ?? 3001;
app.listen(port, () => console.log(`verification-svc on :${port}`));
