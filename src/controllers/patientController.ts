import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { createPatientSchema } from "../schemas/patientSchema";
import { idParamSchema } from "../schemas/commonSchema";
import { HttpError } from "../utils/httpError";

// GET /api/patients
export async function getPatients(_req: Request, res: Response) {
  const patients = await prisma.patient.findMany({
    orderBy: { id: "asc" },
  });
  res.status(200).json({ data: patients });
}

// GET /api/patients/:id  -> expediente: datos personales + historial de citas
export async function getPatientRecord(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { date: "desc" },
        include: {
          medic: {
            select: { id: true, name: true, specialty: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!patient) throw new HttpError(404, "Paciente no encontrado");
  res.status(200).json({ data: patient });
}

// POST /api/patients
export async function createPatient(req: Request, res: Response) {
  const data = createPatientSchema.parse(req.body);
  const newPatient = await prisma.patient.create({ data });
  res.status(201).json({ data: newPatient });
}