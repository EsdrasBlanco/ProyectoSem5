import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import type { Prisma } from "../../generated/prisma/client";
import { agendaQuerySchema, createMedicSchema, listMedicsQuerySchema } from "../schemas/medicSchema";
import { idParamSchema } from "../schemas/commonSchema";
import { HttpError } from "../utils/httpError";
import { startOfDay, startOfNextDay } from "../utils/dates";

// GET /api/medics?specialty=cardio  |  ?specialtyId=1
export async function getMedics(req: Request, res: Response) {
  const { specialty, specialtyId } = listMedicsQuerySchema.parse(req.query);

  const where: Prisma.MedicWhereInput = {};
  if (specialtyId) where.specialtyId = specialtyId;
  if (specialty) where.specialty = { name: { contains: specialty, mode: "insensitive" } };

  const medics = await prisma.medic.findMany({
    where,
    orderBy: { name: "asc" },
    include: { specialty: true },
  });
  res.status(200).json({ data: medics });
}

// POST /api/medics
export async function createMedic(req: Request, res: Response) {
  const data = createMedicSchema.parse(req.body);
  const newMedic = await prisma.medic.create({
    data,
    include: { specialty: true },
  });
  res.status(201).json({ data: newMedic });
}

// GET /api/medics/:id/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD&status=PROGRAMADA
// Agenda del médico filtrada por rango de fechas (ambos extremos inclusivos)
export async function getMedicAgenda(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const { from, to, status } = agendaQuerySchema.parse(req.query);

  const medic = await prisma.medic.findUnique({
    where: { id },
    include: { specialty: true },
  });
  if (!medic) throw new HttpError(404, "Médico no encontrado");

  const appointments = await prisma.appointment.findMany({
    where: {
      medicId: id,
      ...(status && { status }),
      date: {
        ...(from && { gte: startOfDay(from) }),
        ...(to && { lt: startOfNextDay(to) }),
      },
    },
    orderBy: { date: "asc" },
    include: {
      patient: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  res.status(200).json({ data: { medic, appointments } });
}


// GET /api/medics/:id/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD&status=PROGRAMADA
// Agenda del médico filtrada por rango de fechas (ambos extremos inclusivos)
export async function getMedicAgenda(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const { from, to, status } = agendaQuerySchema.parse(req.query);

  const medic = await prisma.medic.findUnique({
    where: { id },
    include: { specialty: true },
  });
  if (!medic) throw new HttpError(404, "Médico no encontrado");

  const appointments = await prisma.appointment.findMany({
    where: {
      medicId: id,
      ...(status && { status }),
      date: {
        ...(from && { gte: startOfDay(from) }),
        ...(to && { lt: startOfNextDay(to) }),
      },
    },
    orderBy: { date: "asc" },
    include: {
      patient: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  res.status(200).json({ data: { medic, appointments } });
}