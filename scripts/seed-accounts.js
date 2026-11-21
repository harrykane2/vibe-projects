import "dotenv/config";

import Database from "better-sqlite3";
import { auth } from "../auth.js";

const accounts = [
  {
    name: "Учебный родитель",
    email: "parent@ryadom.local",
    password: "Uchebny-roditel",
    role: "parent",
  },
  {
    name: "Учебный сотрудник",
    email: "team@ryadom.local",
    password: "Uchebny-sotrudnik",
    role: "staff",
  },
];

const databasePath = process.env.DATABASE_PATH || "./data/ryadom.sqlite";
const db = new Database(databasePath);

for (const account of accounts) {
  const existing = db.prepare("SELECT id FROM user WHERE email = ?").get(account.email);

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        name: account.name,
        email: account.email,
        password: account.password,
      },
    });
  }

  db.prepare("UPDATE user SET role = ? WHERE email = ?").run(account.role, account.email);
  console.log(`Готова учётная запись ${account.email} (${account.role})`);
}

db.close();
