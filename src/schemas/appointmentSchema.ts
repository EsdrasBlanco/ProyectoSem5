import { z } from "zod";
import { AppointmentStatus } from "../../generated/prisma/enums";

export const createAppointmentSchema = z.object({
  // Acepta ISO 8601, ej. "2026-11-20T10:30:00-06:00"
  date: z.coerce
    .date({ message: "Fecha de la cita inválida" })
    .refine((d) => d > new Date(), "No se puede agendar una cita en una fecha que ya pasó"),
  reason: z.string().trim().min(1, "El motivo de la cita es obligatorio"),
  notes: z.string().trim().optional(),
  medicId: z.number().int().positive(),
  patientId: z.number().int().positive(),
});

// Solo se permite cerrar una cita como COMPLETADA o CANCELADA
export const updateStatusSchema = z.object({
  status: z.enum([AppointmentStatus.COMPLETADA, AppointmentStatus.CANCELADA]),
});
