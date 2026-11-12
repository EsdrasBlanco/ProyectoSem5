import { z } from "zod";
import { isoDate } from "./commonSchema";

// GET /reports/appointments-by-specialty?from=&to=  (rango opcional)
export const bySpecialtyQuerySchema = z
  .object({
    from: isoDate.optional(),
    to: isoDate.optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "'from' debe ser menor o igual que 'to'",
    path: ["from"],
  });

// GET /reports/daily?date=2026-11-11
export const dailyReportQuerySchema = z.object({
  date: isoDate,
});
