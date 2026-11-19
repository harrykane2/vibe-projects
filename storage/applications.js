import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const applicationColumns = `
  id, child_age, location, preferred_time, contact_method, owner_id, created_at
`;

export function createApplicationStore(databasePath) {
  const resolvedDatabasePath = path.resolve(databasePath);
  fs.mkdirSync(path.dirname(resolvedDatabasePath), { recursive: true });

  const db = new DatabaseSync(resolvedDatabasePath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_age INTEGER NOT NULL,
      location TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      contact_method TEXT NOT NULL,
      owner_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = db.prepare("PRAGMA table_info(applications)").all();
  if (!columns.some((column) => column.name === "owner_id")) {
    db.exec("ALTER TABLE applications ADD COLUMN owner_id TEXT");
  }

  return {
    create(application, ownerId) {
      const result = db.prepare(`
        INSERT INTO applications (child_age, location, preferred_time, contact_method, owner_id)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        application.childAge,
        application.location,
        application.preferredTime,
        application.contactMethod,
        ownerId,
      );

      return Number(result.lastInsertRowid);
    },

    listAll() {
      return db.prepare(`
        SELECT ${applicationColumns}
        FROM applications
        ORDER BY id DESC
      `).all();
    },

    listByOwner(ownerId) {
      return db.prepare(`
        SELECT ${applicationColumns}
        FROM applications
        WHERE owner_id = ?
        ORDER BY id DESC
      `).all(ownerId);
    },
  };
}
