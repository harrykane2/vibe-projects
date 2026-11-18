import "dotenv/config";

import Database from "better-sqlite3";
import { auth } from "../auth.js";

const accounts = [
  {
    name: "Учебный родитель",
    email: "uchebny-roditel@example.com",
    password: "Rodytel-2026!",
    role: "parent",
  },
  {
    name: "Учебный сотрудник",
    email: "uchebny-sotrudnik@example.com",
    password: "Sotrudnik-2026!",
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
        role: account.role,
      },
    });
  }

  db.prepare("UPDATE user SET role = ? WHERE email = ?").run(account.role, account.email);
  console.log(`Готова учётная запись ${account.email} (${account.role})`);
}

db.close();
