// Datos de prueba: pnpm db:seed
import { prisma } from "../src/config/prisma";

async function main() {
  const specialtyNames = ["Medicina General", "Cardiología", "Pediatría", "Dermatología"];
  for (const name of specialtyNames) {
    await prisma.specialty.upsert({ where: { name }, update: {}, create: { name } });
  }
  const specialties = await prisma.specialty.findMany();
  const byName = (n: string) => specialties.find((s) => s.name === n)!.id;

  const medics = [
    { name: "Dra. Laura Méndez", email: "laura.mendez@saludintegral.mx", specialtyId: byName("Cardiología") },
    { name: "Dr. Carlos Ruiz", email: "carlos.ruiz@saludintegral.mx", specialtyId: byName("Pediatría") },
    { name: "Dra. Ana Torres", email: "ana.torres@saludintegral.mx", specialtyId: byName("Medicina General") },
  ];
  for (const m of medics) {
    await prisma.medic.upsert({ where: { email: m.email }, update: {}, create: m });
  }

  const patients = [
    { name: "Juan Pérez", email: "juan.perez@mail.com", birthDate: new Date("1990-05-14") },
    { name: "María López", email: "maria.lopez@mail.com", birthDate: new Date("2015-09-02") },
  ];
  for (const p of patients) {
    await prisma.patient.upsert({ where: { email: p.email }, update: {}, create: p });
  }

  console.log("Seed completado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
