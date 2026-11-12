# API Clínica Salud Integral

API RESTful para recepción, consultorio y gerencia de la Clínica "Salud Integral".

**Stack:** TypeScript · Express 5 · Prisma ORM 7 · PostgreSQL · Zod

## Puesta en marcha

```bash
pnpm install
# .env -> DATABASE_URL="postgresql://USER:PASS@localhost:5432/clinica-salud-integral"  y  PORT=3000
pnpm prisma:migrate      # aplica migraciones
pnpm prisma:generate     # genera el cliente en generated/prisma
pnpm db:seed             # datos de prueba (especialidades, médicos, pacientes)
pnpm dev                 # http://localhost:3000
```

Otros scripts: `pnpm typecheck`, `pnpm start`.

## Modelo de datos

```mermaid
erDiagram
  User ||--o| Medic : "es"
  Specialty ||--o{ Medic : "agrupa"
  Medic ||--o{ Appointment : "atiende"
  Patient ||--o{ Appointment : "tiene"

  User { int id string email string password Role role }
  Specialty { int id string name }
  Medic { int id string name string email int specialtyId int userId }
  Patient { int id string name string email date birthDate string phone }
  Appointment { int id datetime date string reason string notes AppointmentStatus status int medicId int patientId }
```

- `Role`: `RECEPCIONISTA | MEDICO | GERENCIA`
- `AppointmentStatus`: `PROGRAMADA` (default) `| COMPLETADA | CANCELADA`
- `@@unique([medicId, date])` evita el cruce de horarios de un médico.

## Endpoints (`/api`)

| Módulo | Método y ruta | Descripción | Rol (JWT) |
|---|---|---|---|
| Recepción | `GET /patients` | Lista de pacientes | RECEPCIONISTA |
| | `GET /patients/:id` | Expediente + historial de citas | RECEPCIONISTA |
| | `POST /patients` | Alta (valida correo y fecha de nacimiento no futura) | RECEPCIONISTA |
| | `GET /medics?specialty=&specialtyId=` | Directorio filtrable por especialidad | RECEPCIONISTA |
| | `GET /specialties` | Catálogo de especialidades | — |
| Consultorio | `POST /appointments` | Agenda cita (no en el pasado) | RECEPCIONISTA |
| | `GET /appointments`, `GET /appointments/:id` | Consulta de citas | — |
| | `GET /medics/:id/appointments?from=&to=&status=` | Agenda del médico por rango | MEDICO |
| | `PATCH /appointments/:id/status` | `PROGRAMADA → COMPLETADA / CANCELADA` | MEDICO |
| Gerencia | `GET /reports/appointments-by-specialty?from=&to=` | Volumen de citas por especialidad (`$queryRaw`) | GERENCIA |
| | `GET /reports/daily?date=` | Completadas vs canceladas del día (`groupBy`) | GERENCIA |
| Admin | `POST /medics`, `POST /specialties` | Altas de catálogo | GERENCIA |

Fechas de filtros en formato `YYYY-MM-DD` (UTC). Ver ejemplos en [`requests.http`](./requests.http).

## Respuestas de error

| Código | Cuándo |
|---|---|
| 400 | Validación de Zod (`details` por campo) o referencia a médico/paciente inexistente |
| 404 | Recurso o ruta no encontrada |
| 409 | Correo duplicado, médico ocupado a esa hora o cita ya cerrada |
| 500 | Error inesperado |

## Estructura

```
src/
  config/prisma.ts        cliente Prisma con adapter-pg
  controllers/            lógica de cada recurso
  routes/                 definición de endpoints
  schemas/                validaciones Zod
  middlewares/            manejo central de errores (aquí irá el kit JWT)
  utils/                  HttpError, rangos de fechas
prisma/
  schema.prisma, migrations/, seed.ts
```
