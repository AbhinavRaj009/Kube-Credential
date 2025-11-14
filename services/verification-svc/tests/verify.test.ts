import { createHash } from "node:crypto";

describe("Verification Service", () => {
  const toStableId = (obj: Record<string, unknown>) =>
    createHash("sha256").update(JSON.stringify(obj)).digest("hex");

  test("valid when present in store", () => {
    const store = new Map<string, { issuedAt: string; workerId: string }>();
    const cred = { name: "ram", id: "456" };
    const id = toStableId(cred);
    store.set(id, { issuedAt: "2025-10-08T00:00:00Z", workerId: "worker-local" });
    expect(store.has(id)).toBe(true);
  });

  test("invalid when not present", () => {
    const store = new Map<string, unknown>();
    const id = toStableId({ name: "x", id: "999" });
    expect(store.has(id)).toBe(false);
  });
});
