const ISSUANCE_URL = import.meta.env.VITE_ISSUANCE_URL ?? "http://localhost:3000";
const VERIFICATION_URL = import.meta.env.VITE_VERIFICATION_URL ?? "http://localhost:3001";

export async function issueCredential(payload: unknown) {
  const res = await fetch(`${ISSUANCE_URL}/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function verifyCredential(payload: unknown) {
  const res = await fetch(`${VERIFICATION_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
