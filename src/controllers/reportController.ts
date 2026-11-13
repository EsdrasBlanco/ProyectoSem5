import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { Prisma } from "../../generated/prisma/client";
import { bySpecialtyQuerySchema, dailyReportQuerySchema } from "../schemas/reportSchema";
import { startOfDay, startOfNextDay } from "../utils/dates";

type SpecialtyVolumeRow = {
  specialtyId: number;
  specialty: string;
  totalAppointments: number;
};

// GET /api/reports/appointments-by-specialty?from=YYYY-MM-DD&to=YYYY-MM-DD
// groupBy de Prisma no puede agrupar por un campo de otra tabla (specialty está
// en medics -> specialties), por eso se usa $queryRaw parametrizado.
export async function appointmentsBySpecialty(req: Request, res: Response) {
  const { from, to } = bySpecialtyQuerySchema.parse(req.query);

  // Los valores se envían como parámetros ($1, $2...), nunca concatenados: sin SQL injection
  const fromFilter = from ? Prisma.sql`AND a."date" >= ${startOfDay(from)}` : Prisma.empty;
  const toFilter = to ? Prisma.sql`AND a."date" < ${startOfNextDay(to)}` : Prisma.empty;

  const rows = await prisma.$queryRaw<SpecialtyVolumeRow[]>`
    SELECT s.id              AS "specialtyId",
           s.name            AS "specialty",
           COUNT(a.id)::int  AS "totalAppointments"
    FROM specialties s
    INNER JOIN medics m       ON m."specialtyId" = s.id
    INNER JOIN appointments a ON a."medicId" = m.id ${fromFilter} ${toFilter}
    GROUP BY s.id, s.name
    ORDER BY "totalAppointments" DESC, s.name ASC
  `;

  const total = rows.reduce((acc, r) => acc + r.totalAppointments, 0);
  res.status(200).json({ data: { from: from ?? null, to: to ?? null, total, bySpecialty: rows } });
}

// GET /api/reports/daily?date=YYYY-MM-DD
// Corte operativo: cuántas citas de ese día se completaron y cuántas se cancelaron.
export async function dailyReport(req: Request, res: Response) {
  const { date } = dailyReportQuerySchema.parse(req.query);

  const grouped = await prisma.appointment.groupBy({
    by: ["status"],
    where: {
      date: { gte: startOfDay(date), lt: startOfNextDay(date) },
      status: { in: ["COMPLETADA", "CANCELADA"] },
    },
    _count: { _all: true },
  });

  const countOf = (status: string) =>
    grouped.find((g) => g.status === status)?._count._all ?? 0;

  res.status(200).json({
    data: {
      date,
      completed: countOf("COMPLETADA"),
      cancelled: countOf("CANCELADA"),
    },
  });
}
