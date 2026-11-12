// Pruebas de integración de la API: pnpm test
// Levantan la app en un puerto aleatorio y usan la base de datos de DATABASE_URL.
// Crean sus propios datos con correos únicos, así que se pueden correr varias veces.
import "dotenv/config";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import app from "../src/app";
import { prisma } from "../src/config/prisma";

let server: Server;
let base: string;

const uid = Date.now();
const created = { specialtyId: 0, medicId: 0, patientId: 0, appointmentIds: [] as number[] };

// Fecha futura única (dentro de ~1 año) para no chocar con citas de otras corridas
const futureDate = new Date(Date.now() + 365 * 24 * 3600 * 1000 + (uid % 100000) * 60000);
futureDate.setUTCSeconds(0, 0);
const futureDay = futureDate.toISOString().slice(0, 10);

async function call(method: string, path: string, body?: unknown) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: (await res.json()) as any };
}

before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  base = `http://localhost:${(server.address() as AddressInfo).port}/api`;
});

after(async () => {
  // Limpieza de los datos creados por las pruebas
  await prisma.appointment.deleteMany({ where: { id: { in: created.appointmentIds } } });
  if (created.medicId) await prisma.medic.delete({ where: { id: created.medicId } });
  if (created.patientId) await prisma.patient.delete({ where: { id: created.patientId } });
  if (created.specialtyId) await prisma.specialty.delete({ where: { id: created.specialtyId } });
  await prisma.$disconnect();
  server.close();
});

test("crea especialidad y médico", async () => {
  const s = await call("POST", "/specialties", { name: `Test-Especialidad-${uid}` });
  assert.equal(s.status, 201);
  created.specialtyId = s.body.data.id;

  const m = await call("POST", "/medics", {
    name: "Dr. Test",
    email: `medic.${uid}@test.com`,
    specialtyId: created.specialtyId,
  });
  assert.equal(m.status, 201);
  created.medicId = m.body.data.id;
});

test("filtra médicos por especialidad", async () => {
  const r = await call("GET", `/medics?specialty=Test-Especialidad-${uid}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.data.length, 1);
  assert.equal(r.body.data[0].id, created.medicId);
});

test("rechaza paciente con correo inválido y fecha de nacimiento futura", async () => {
  const r = await call("POST", "/patients", { name: "X", email: "malo", birthDate: "2099-01-01" });
  assert.equal(r.status, 400);
  const fields = r.body.details.map((d: any) => d.field);
  assert.ok(fields.includes("email"));
  assert.ok(fields.includes("birthDate"));
});

test("crea paciente y rechaza correo duplicado", async () => {
  const data = { name: "Paciente Test", email: `patient.${uid}@test.com`, birthDate: "1990-01-01" };
  const r = await call("POST", "/patients", data);
  assert.equal(r.status, 201);
  created.patientId = r.body.data.id;

  const dup = await call("POST", "/patients", data);
  assert.equal(dup.status, 409);
});

test("bloquea citas en el pasado", async () => {
  const r = await call("POST", "/appointments", {
    date: "2020-01-01T10:00:00Z",
    reason: "Pasado",
    medicId: created.medicId,
    patientId: created.patientId,
  });
  assert.equal(r.status, 400);
});

test("agenda cita (nace PROGRAMADA) y bloquea cruce de horario", async () => {
  const data = {
    date: futureDate.toISOString(),
    reason: "Chequeo",
    medicId: created.medicId,
    patientId: created.patientId,
  };
  const r = await call("POST", "/appointments", data);
  assert.equal(r.status, 201);
  assert.equal(r.body.data.status, "PROGRAMADA");
  created.appointmentIds.push(r.body.data.id);

  const clash = await call("POST", "/appointments", data);
  assert.equal(clash.status, 409);
});

test("rechaza cita con médico inexistente", async () => {
  const r = await call("POST", "/appointments", {
    date: futureDate.toISOString(),
    reason: "FK",
    medicId: 999999,
    patientId: created.patientId,
  });
  assert.equal(r.status, 400);
});

test("agenda del médico por rango de fechas", async () => {
  const inRange = await call("GET", `/medics/${created.medicId}/appointments?from=${futureDay}&to=${futureDay}`);
  assert.equal(inRange.status, 200);
  assert.equal(inRange.body.data.appointments.length, 1);

  const outOfRange = await call("GET", `/medics/${created.medicId}/appointments?from=2000-01-01&to=2000-01-02`);
  assert.equal(outOfRange.body.data.appointments.length, 0);
});

test("actualiza estado solo desde PROGRAMADA", async () => {
  const id = created.appointmentIds[0];
  const ok = await call("PATCH", `/appointments/${id}/status`, { status: "COMPLETADA" });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.data.status, "COMPLETADA");

  const again = await call("PATCH", `/appointments/${id}/status`, { status: "CANCELADA" });
  assert.equal(again.status, 409);

  const invalid = await call("PATCH", `/appointments/${id}/status`, { status: "PROGRAMADA" });
  assert.equal(invalid.status, 400);
});

test("expediente del paciente incluye su historial", async () => {
  const r = await call("GET", `/patients/${created.patientId}`);
  assert.equal(r.status, 200);
  assert.equal(r.body.data.appointments.length, 1);
});

test("reporte de citas por especialidad", async () => {
  const r = await call("GET", "/reports/appointments-by-specialty");
  assert.equal(r.status, 200);
  const row = r.body.data.bySpecialty.find((x: any) => x.specialtyId === created.specialtyId);
  assert.equal(row.totalAppointments, 1);
});

test("corte operativo diario", async () => {
  const r = await call("GET", `/reports/daily?date=${futureDay}`);
  assert.equal(r.status, 200);
  assert.ok(r.body.data.completed >= 1);

  const bad = await call("GET", "/reports/daily?date=hoy");
  assert.equal(bad.status, 400);
});
