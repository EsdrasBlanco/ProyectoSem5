import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { createSpecialtySchema } from "../schemas/specialtySchema";

// GET /api/specialties
export async function getSpecialties(_req: Request, res: Response) {
  const specialties = await prisma.specialty.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { medics: true } } },
  });
  res.status(200).json({ data: specialties });
}

// POST /api/specialties
export async function createSpecialty(req: Request, res: Response) {
  const data = createSpecialtySchema.parse(req.body);
  const specialty = await prisma.specialty.create({ data });
  res.status(201).json({ data: specialty });
}
