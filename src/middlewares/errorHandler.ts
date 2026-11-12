import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import { HttpError } from "../utils/httpError";

// Express 5 envía automáticamente aquí los errores de controladores async,
// así que los controladores no necesitan try/catch.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 400: datos inválidos (Zod)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: err.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  // Errores lanzados a propósito desde los controladores
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Errores conocidos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // unique constraint
        return res.status(409).json({
          error: "Registro duplicado",
          fields: err.meta?.target ?? null,
        });
      case "P2003": // foreign key
        return res
          .status(400)
          .json({ error: "Referencia inválida: el registro relacionado no existe" });
      case "P2025": // record not found
        return res.status(404).json({ error: "Registro no encontrado" });
    }
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
};

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};
