import express from "express";
import { z } from "zod";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";

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

export function createApplicationsRouter(applicationStore) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        ok: false,
        message: "Для отправки заявки необходимо войти.",
      });
    }

    if (session.user.role !== "parent") {
      return res.status(403).json({
        ok: false,
        message: "Отправлять заявки могут только родители.",
      });
    }

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

    const id = applicationStore.create(parsed.data, session.user.id);

    return res.status(201).json({
      ok: true,
      message: "Заявка отправлена. Мы получили ваши данные и свяжемся с вами.",
      id,
    });
  });

  router.get("/", async (req, res) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        ok: false,
        message: "Для просмотра заявок необходимо войти.",
      });
    }

    const role = session.user.role;
    let applications;

    if (role === "staff") {
      applications = applicationStore.listAll();
    } else if (role === "parent") {
      applications = applicationStore.listByOwner(session.user.id);
    } else {
      return res.status(403).json({
        ok: false,
        message: "Для просмотра заявок нет подходящей роли.",
      });
    }

    return res.json({
      ok: true,
      role,
      applications,
    });
  });

  return router;
}
