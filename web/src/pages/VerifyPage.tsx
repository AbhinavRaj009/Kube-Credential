import { useState } from "react";
import { verifyCredential } from "../lib/api";

export default function VerifyPage() {
  const [jsonText, setJsonText] = useState('{"name":"Alice","id":"123"}');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const payload = JSON.parse(jsonText);
      const data = await verifyCredential(payload);
      setResult(data);
    } catch {
      setError("Invalid JSON or network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Verify Credential</h1>
      <form onSubmit={onSubmit}>
        <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} rows={8} style={{ width: "100%" }} />
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button disabled={busy} type="submit">{busy ? "Verifying..." : "Verify"}</button>
        </div>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {result && (
        <pre style={{ background: "#111", color: "#0f0", padding: 12, marginTop: 12 }}>
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
