import { z } from "zod";

export const createPatientSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.email("Correo con formato inválido").toLowerCase(),
  birthDate: z.coerce
    .date({ message: "Fecha de nacimiento inválida" })
    .refine((d) => d <= new Date(), "La fecha de nacimiento no puede estar en el futuro")
    .refine((d) => d.getUTCFullYear() >= 1900, "La fecha de nacimiento no es realista"),
  phone: z.string().trim().min(7).max(20).optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
