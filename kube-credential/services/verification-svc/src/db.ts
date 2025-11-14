import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.resolve(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "verify.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS issued_credentials (
    credential_id TEXT PRIMARY KEY,
    issued_at      TEXT NOT NULL,
    worker_id      TEXT NOT NULL
  );
`);

export default db;
