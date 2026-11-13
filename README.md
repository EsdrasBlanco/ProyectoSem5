# API Clínica Salud Integral

API RESTful para recepción, consultorio y gerencia de la Clínica "Salud Integral".

**Stack:** TypeScript · Express 5 · Prisma ORM 7 · PostgreSQL · Zod · JWT (`jsonwebtoken` + `bcryptjs`)

## Puesta en marcha

```bash
pnpm install
# .env -> DATABASE_URL="postgresql://USER:PASS@localhost:5432/clinica-salud-integral", JWT_SECRET="..." y PORT=3000
pnpm prisma:migrate      # aplica migraciones
pnpm prisma:generate     # genera el cliente en generated/prisma
pnpm db:seed             # datos de prueba (especialidades, médicos, pacientes y usuarios JWT)
pnpm dev                 # http://localhost:3000
```

Otros scripts: `pnpm typecheck`, `pnpm test`, `pnpm start`.

## Usuarios de prueba (creados con `pnpm db:seed`)

Contraseña para todos: `123456`

| Rol | Correo | Vínculo |
|---|---|---|
| `RECEPCIONISTA` | `recepcion@saludintegral.mx` | — |
| `MEDICO` | `laura.mendez@saludintegral.mx` | Dra. Laura Méndez (Cardiología) |
| `MEDICO` | `carlos.ruiz@saludintegral.mx` | Dr. Carlos Ruiz (Pediatría) |
| `MEDICO` | `ana.torres@saludintegral.mx` | Dra. Ana Torres (Medicina General) |
| `GERENCIA` | `gerencia@saludintegral.mx` | — |

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

| Módulo | Método y ruta | Descripción | Roles permitidos (JWT) |
|---|---|---|---|
| Auth | `POST /auth/register` | Registro de usuario con rol | Público |
| | `POST /auth/login` | Inicio de sesión (devuelve token JWT) | Público |
| | `GET /auth/me` | Perfil del usuario autenticado | Cualquier rol autenticado |
| Recepción | `GET /patients` | Lista de pacientes | `RECEPCIONISTA`, `MEDICO`, `GERENCIA` |
| | `GET /patients/:id` | Expediente + historial de citas | `RECEPCIONISTA`, `MEDICO`, `GERENCIA` |
| | `POST /patients` | Alta (valida correo y fecha de nacimiento no futura) | `RECEPCIONISTA`, `GERENCIA` |
| | `GET /medics?specialty=&specialtyId=` | Directorio filtrable por especialidad | `RECEPCIONISTA`, `MEDICO`, `GERENCIA` |
| | `GET /specialties` | Catálogo de especialidades | Público |
| Consultorio | `POST /appointments` | Agenda cita (no en el pasado) | `RECEPCIONISTA`, `GERENCIA` |
| | `GET /appointments`, `GET /appointments/:id` | Consulta de citas | `RECEPCIONISTA`, `MEDICO`, `GERENCIA` |
| | `GET /medics/:id/appointments?from=&to=&status=` | Agenda del médico por rango (el médico solo ve la suya) | `MEDICO`, `GERENCIA` |
| | `PATCH /appointments/:id/status` | `PROGRAMADA → COMPLETADA / CANCELADA` | `MEDICO`, `GERENCIA` |
| Gerencia | `GET /reports/appointments-by-specialty?from=&to=` | Volumen de citas por especialidad (`$queryRaw`) | `GERENCIA` |
| | `GET /reports/daily?date=` | Completadas vs canceladas del día (`groupBy`) | `GERENCIA` |
| Admin | `POST /medics`, `POST /specialties` | Altas de catálogo | `GERENCIA` |

Fechas de filtros en formato `YYYY-MM-DD` (UTC). Ver ejemplos en [`requests.http`](./requests.http).

## Respuestas de error

| Código | Cuándo |
|---|---|
| 400 | Validación de Zod (`details` por campo) o referencia a médico/paciente inexistente |
| 401 | Token JWT ausente, inválido o expirado, o credenciales incorrectas |
| 403 | El rol del usuario autenticado no tiene permiso para el recurso |
| 404 | Recurso o ruta no encontrada |
| 409 | Correo duplicado, médico ocupado a esa hora o cita ya cerrada |
| 500 | Error inesperado |
