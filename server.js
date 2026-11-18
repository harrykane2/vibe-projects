import "dotenv/config";

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import express from "express";
import { z } from "zod";

const app = express();
const port = Number(process.env.PORT || 3000);
const databasePath = process.env.DATABASE_PATH || "./data/ryadom.sqlite";

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
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const applicationSchema = z.object({
  childAge: z.preprocess(
    (value) => value === "" || value === null || value === undefined ? undefined : value,
    z.coerce.number({
      error: "Укажите возраст ребёнка.",
    }).int("Возраст должен быть целым числом.")
      .min(4, "Возраст ребёнка должен быть от 4 до 12 лет.")
      .max(12, "Возраст ребёнка должен быть от 4 до 12 лет."),
  ),
  location: z.string()
    .trim()
    .min(2, "Укажите район или школу.")
    .max(200, "Название района или школы должно быть не длиннее 200 символов."),
  preferredTime: z.string()
    .trim()
    .min(2, "Укажите удобное время.")
    .max(200, "Удобное время должно быть не длиннее 200 символов."),
  contactMethod: z.string()
    .trim()
    .min(2, "Укажите способ связи.")
    .max(300, "Способ связи должен быть не длиннее 300 символов."),
});

app.use(express.json());
app.use(express.static(path.resolve("public")));

app.post("/api/applications", (req, res) => {
  const parsed = applicationSchema.safeParse(req.body);

  if (!parsed.success) {
    const fieldErrors = {};

    for (const issue of parsed.error.issues) {
      const fieldName = issue.path[0];
      if (typeof fieldName === "string" && !fieldErrors[fieldName]) {
        fieldErrors[fieldName] = issue.message;
      }
    }

    return res.status(400).json({
      ok: false,
      message: "Проверьте данные заявки.",
      fieldErrors,
    });
  }

  const insert = db.prepare(`
    INSERT INTO applications (child_age, location, preferred_time, contact_method)
    VALUES (?, ?, ?, ?)
  `);

  const result = insert.run(
    parsed.data.childAge,
    parsed.data.location,
    parsed.data.preferredTime,
    parsed.data.contactMethod,
  );

  return res.status(201).json({
    ok: true,
    message: "Заявка отправлена. Мы получили ваши данные и свяжемся с вами.",
    id: Number(result.lastInsertRowid),
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({
      ok: false,
      message: "Проверьте данные заявки.",
      errors: ["Некорректный формат данных."],
    });
  }

  console.error(error);
  return res.status(500).json({
    ok: false,
    message: "Не удалось отправить заявку. Попробуйте ещё раз.",
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Лендинг доступен по адресу http://127.0.0.1:${port}`);
});
