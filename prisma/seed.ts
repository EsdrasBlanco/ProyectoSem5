// Datos de prueba: pnpm db:seed
import bcrypt from "bcryptjs";
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

  // Usuarios de prueba para JWT (contraseña: 123456)
  const passwordHash = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "recepcion@saludintegral.mx" },
    update: { password: passwordHash, role: "RECEPCIONISTA" },
    create: {
      email: "recepcion@saludintegral.mx",
      password: passwordHash,
      role: "RECEPCIONISTA",
    },
  });

  await prisma.user.upsert({
    where: { email: "gerencia@saludintegral.mx" },
    update: { password: passwordHash, role: "GERENCIA" },
    create: {
      email: "gerencia@saludintegral.mx",
      password: passwordHash,
      role: "GERENCIA",
    },
  });

  // Usuarios para cada médico vinculados a su registro en la tabla medics
  for (const m of medics) {
    const medicRecord = await prisma.medic.findUnique({ where: { email: m.email } });
    if (medicRecord) {
      const medicoUser = await prisma.user.upsert({
        where: { email: m.email },
        update: { password: passwordHash, role: "MEDICO" },
        create: {
          email: m.email,
          password: passwordHash,
          role: "MEDICO",
        },
      });
      await prisma.medic.update({
        where: { id: medicRecord.id },
        data: { userId: medicoUser.id },
      });
    }
  }

  console.log("Seed completado (incluyendo usuarios de prueba para RECEPCIONISTA, MEDICO y GERENCIA)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
