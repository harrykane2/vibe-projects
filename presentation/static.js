import express from "express";
import { fileURLToPath } from "node:url";

const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));

export function mountStaticPresentation(app) {
  app.use(express.static(publicDirectory));
}
