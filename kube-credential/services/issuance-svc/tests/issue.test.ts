import { createHash } from "node:crypto";

describe("Issuance Service", () => {
  const toStableId = (obj: Record<string, unknown>) =>
    createHash("sha256").update(JSON.stringify(obj)).digest("hex");

  test("same JSON → same credentialId", () => {
    const p = { name: "ram", id: "123" };
    expect(toStableId(p)).toBe(toStableId(p));
  });

  test("different JSON → different credentialId", () => {
    const a = { name: "ram", id: "123" };
    const b = { name: "ram", id: "456" };
    expect(toStableId(a)).not.toBe(toStableId(b));
  });
});
