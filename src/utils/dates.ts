// Utilidades para rangos de fechas a partir de "YYYY-MM-DD".
// Se trabaja en UTC para ser consistentes con cómo Prisma guarda DateTime.

export function startOfDay(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

// Inicio del día siguiente (límite superior exclusivo: date < nextDay)
export function startOfNextDay(isoDate: string): Date {
  const d = startOfDay(isoDate);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}
