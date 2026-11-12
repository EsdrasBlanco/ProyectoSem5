import { z } from "zod";

export const createSpecialtySchema = z.object({
  name: z.string().trim().min(1, "El nombre de la especialidad es obligatorio"),
});
