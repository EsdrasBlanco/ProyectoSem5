import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { createAppointmentSchema, updateStatusSchema } from "../schemas/appointmentSchema";
import { idParamSchema } from "../schemas/commonSchema";
import { HttpError } from "../utils/httpError";

// GET /api/appointments
export async function getAppointments(_req: Request, res: Response) {
  const appointments = await prisma.appointment.findMany({
    orderBy: { date: "asc" },
    include: {
      medic: { select: { id: true, name: true } },
      patient: { select: { id: true, name: true } },
    },
  });
  res.status(200).json({ data: appointments });
}

// GET /api/appointments/:id
export async function getAppointmentById(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      medic: { include: { specialty: true } },
      patient: true,
    },
  });
  if (!appointment) throw new HttpError(404, "Cita no encontrada");
  res.status(200).json({ data: appointment });
}

// POST /api/appointments
// Regla: no se puede agendar en el pasado (validado en el schema de Zod).
// Si el médico ya tiene una cita en esa fecha/hora -> 409 (unique medicId+date).
// Si medicId o patientId no existen -> 400 (FK, P2003).
export async function createAppointment(req: Request, res: Response) {
  const data = createAppointmentSchema.parse(req.body);
  const newAppointment = await prisma.appointment.create({
    data, // status nace como PROGRAMADA (default en el schema)
    include: {
      medic: { select: { id: true, name: true } },
      patient: { select: { id: true, name: true } },
    },
  });
  res.status(201).json({ data: newAppointment });
}

// PATCH /api/appointments/:id/status   body: { "status": "COMPLETADA" | "CANCELADA" }
export async function updateAppointmentStatus(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const { status } = updateStatusSchema.parse(req.body);

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) throw new HttpError(404, "Cita no encontrada");

  if (appointment.status !== "PROGRAMADA") {
    throw new HttpError(
      409,
      `La cita ya está ${appointment.status}; solo se pueden actualizar citas PROGRAMADAS`,
    );
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
  });
  res.status(200).json({ data: updated });
}
