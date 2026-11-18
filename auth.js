import "dotenv/config";

import Database from "better-sqlite3";
import { betterAuth } from "better-auth";

const databasePath = process.env.DATABASE_PATH || "./data/ryadom.sqlite";

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
        input: true,
      },
    },
  },
});
