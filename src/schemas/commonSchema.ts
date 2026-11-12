import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Fecha en formato YYYY-MM-DD
export const isoDate = z.iso.date({ message: "Usa el formato YYYY-MM-DD" });
