export type Credential = Record<string, unknown>;

export type IssueResponse =
  | { status: "already_issued"; credentialId: string }
  | { status: "issued"; credentialId: string; workerId: string; issuedAt: string };
