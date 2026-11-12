import { z } from "zod";
import { AppointmentStatus } from "../../generated/prisma/enums";
import { isoDate } from "./commonSchema";

export const createMedicSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  email: z.email("Correo con formato inválido").toLowerCase(),
  specialtyId: z.number().int().positive(),
});

// GET /medics?specialty=Cardiología  o  ?specialtyId=1
export const listMedicsQuerySchema = z.object({
  specialty: z.string().trim().min(1).optional(),
  specialtyId: z.coerce.number().int().positive().optional(),
});

// GET /medics/:id/appointments?from=2026-11-01&to=2026-11-30&status=PROGRAMADA
export const agendaQuerySchema = z
  .object({
    from: isoDate.optional(),
    to: isoDate.optional(),
    status: z.enum(AppointmentStatus).optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "'from' debe ser menor o igual que 'to'",
    path: ["from"],
  });
