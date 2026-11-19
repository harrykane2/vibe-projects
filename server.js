import "dotenv/config";

import express from "express";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { createApplicationsRouter } from "./api/applications.js";
import { mountStaticPresentation } from "./presentation/static.js";
import { createApplicationStore } from "./storage/applications.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const databasePath = process.env.DATABASE_PATH || "./data/ryadom.sqlite";
const applicationStore = createApplicationStore(databasePath);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
mountStaticPresentation(app);
app.use("/api/applications", createApplicationsRouter(applicationStore));

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
