import { z } from "zod";
import { Role } from "../../generated/prisma/enums";

export const registerSchema = z.object({
  email: z.email("Correo con formato inválido").toLowerCase(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(Role, {
    message: "Rol inválido: debe ser RECEPCIONISTA, MEDICO o GERENCIA",
  }),
  medicId: z.number().int().positive().optional(),
});

export const loginSchema = z.object({
  email: z.email("Correo con formato inválido").toLowerCase(),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
