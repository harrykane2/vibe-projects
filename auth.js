import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { betterAuth } from "better-auth";

const databasePath = path.resolve(process.env.DATABASE_PATH || "./data/ryadom.sqlite");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const auth = betterAuth({
  database: new Database(databasePath),
  baseURL: process.env.BETTER_AUTH_URL || "http://127.0.0.1:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "parent",
        input: false,
      },
    },
  },
});
