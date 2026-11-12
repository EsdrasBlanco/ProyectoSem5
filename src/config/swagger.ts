export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "API Clínica Salud Integral",
    version: "1.0.0",
    description:
      "API RESTful para los módulos de Recepción, Consultorio y Gerencia de la Clínica Salud Integral.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor local de desarrollo",
    },
  ],
  tags: [
    { name: "Salud", description: "Estado del servidor" },
    { name: "Especialidades", description: "Catálogo de especialidades médicas" },
    { name: "Médicos", description: "Directorio de especialistas y agenda médica" },
    { name: "Pacientes", description: "Alta de pacientes y consulta de expedientes" },
    { name: "Citas", description: "Programación y gestión de estado de citas" },
    { name: "Reportes (Gerencia)", description: "Rentabilidad por área y corte operativo diario" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Salud"],
        summary: "Verifica que el servidor esté activo",
        responses: {
          "200": {
            description: "Servidor funcionando",
            content: {
              "application/json": {
                example: { status: "ok" },
              },
            },
          },
        },
      },
    },
    "/api/specialties": {
      get: {
        tags: ["Especialidades"],
        summary: "Listar todas las especialidades médicas",
        responses: {
          "200": { description: "Lista de especialidades con conteo de médicos" },
        },
      },
      post: {
        tags: ["Especialidades"],
        summary: "Crear una nueva especialidad",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Neurología" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Especialidad creada" },
          "400": { description: "Datos inválidos" },
          "409": { description: "Especialidad duplicada" },
        },
      },
    },
    "/api/medics": {
      get: {
        tags: ["Médicos"],
        summary: "Listar médicos y filtrar por especialidad",
        parameters: [
          {
            name: "specialty",
            in: "query",
            description: "Filtro por nombre de especialidad (búsqueda parcial, insensible a mayúsculas)",
            schema: { type: "string", example: "cardio" },
          },
          {
            name: "specialtyId",
            in: "query",
            description: "Filtro por ID numérico de especialidad",
            schema: { type: "integer", example: 2 },
          },
        ],
        responses: {
          "200": { description: "Lista de médicos" },
        },
      },
      post: {
        tags: ["Médicos"],
        summary: "Dar de alta un nuevo médico",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "specialtyId"],
                properties: {
                  name: { type: "string", example: "Dr. Luis Gómez" },
                  email: { type: "string", format: "email", example: "luis.gomez@saludintegral.mx" },
                  specialtyId: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Médico registrado" },
          "400": { description: "Datos inválidos o especialidad inexistente" },
          "409": { description: "Correo ya registrado" },
        },
      },
    },
    "/api/medics/{id}/appointments": {
      get: {
        tags: ["Médicos"],
        summary: "Agenda del médico filtrada por rango de fechas",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del médico",
            schema: { type: "integer", example: 1 },
          },
          {
            name: "from",
            in: "query",
            description: "Fecha inicial (YYYY-MM-DD, inclusiva)",
            schema: { type: "string", format: "date", example: "2026-11-01" },
          },
          {
            name: "to",
            in: "query",
            description: "Fecha final (YYYY-MM-DD, inclusiva)",
            schema: { type: "string", format: "date", example: "2026-12-31" },
          },
          {
            name: "status",
            in: "query",
            description: "Filtrar por estado de la cita",
            schema: {
              type: "string",
              enum: ["PROGRAMADA", "COMPLETADA", "CANCELADA"],
            },
          },
        ],
        responses: {
          "200": { description: "Datos del médico y sus citas en el rango" },
          "400": { description: "Parámetros inválidos" },
          "404": { description: "Médico no encontrado" },
        },
      },
    },
    "/api/patients": {
      get: {
        tags: ["Pacientes"],
        summary: "Listar todos los pacientes",
        responses: {
          "200": { description: "Lista de pacientes" },
        },
      },
      post: {
        tags: ["Pacientes"],
        summary: "Registrar paciente nuevo (valida correo y fecha de nacimiento no futura)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "birthDate"],
                properties: {
                  name: { type: "string", example: "Sofía Ramírez" },
                  email: { type: "string", format: "email", example: "sofia@mail.com" },
                  birthDate: { type: "string", format: "date", example: "1998-07-21" },
                  phone: { type: "string", example: "5512345678" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Paciente creado" },
          "400": { description: "Correo inválido o fecha de nacimiento en el futuro" },
          "409": { description: "Correo duplicado" },
        },
      },
    },
    "/api/patients/{id}": {
      get: {
        tags: ["Pacientes"],
        summary: "Consultar expediente del paciente (datos personales + historial de citas)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del paciente",
            schema: { type: "integer", example: 1 },
          },
        ],
        responses: {
          "200": { description: "Expediente completo del paciente" },
          "404": { description: "Paciente no encontrado" },
        },
      },
    },
    "/api/appointments": {
      get: {
        tags: ["Citas"],
        summary: "Listar todas las citas",
        responses: {
          "200": { description: "Lista de citas" },
        },
      },
      post: {
        tags: ["Citas"],
        summary: "Agendar cita nueva (nace PROGRAMADA y bloquea fechas en el pasado)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["date", "reason", "medicId", "patientId"],
                properties: {
                  date: {
                    type: "string",
                    format: "date-time",
                    example: "2026-12-01T10:30:00Z",
                  },
                  reason: { type: "string", example: "Consulta general" },
                  notes: { type: "string", example: "Primera visita" },
                  medicId: { type: "integer", example: 1 },
                  patientId: { type: "integer", example: 1 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Cita agendada con estado PROGRAMADA" },
          "400": { description: "Fecha en el pasado o médico/paciente inexistente" },
          "409": { description: "Cruce de horario: el médico ya tiene cita en esa fecha/hora" },
        },
      },
    },
    "/api/appointments/{id}": {
      get: {
        tags: ["Citas"],
        summary: "Obtener detalle de una cita por ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
          },
        ],
        responses: {
          "200": { description: "Detalle de la cita" },
          "404": { description: "Cita no encontrada" },
        },
      },
    },
    "/api/appointments/{id}/status": {
      patch: {
        tags: ["Citas"],
        summary: "Actualizar estado de una cita (PROGRAMADA -> COMPLETADA o CANCELADA)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["COMPLETADA", "CANCELADA"],
                    example: "COMPLETADA",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Estado actualizado" },
          "400": { description: "Estado inválido" },
          "404": { description: "Cita no encontrada" },
          "409": { description: "La cita ya había sido completada o cancelada" },
        },
      },
    },
    "/api/reports/appointments-by-specialty": {
      get: {
        tags: ["Reportes (Gerencia)"],
        summary: "Rentabilidad por área: volumen total de citas agrupado por especialidad",
        parameters: [
          {
            name: "from",
            in: "query",
            description: "Fecha inicial opcional (YYYY-MM-DD)",
            schema: { type: "string", format: "date" },
          },
          {
            name: "to",
            in: "query",
            description: "Fecha final opcional (YYYY-MM-DD)",
            schema: { type: "string", format: "date" },
          },
        ],
        responses: {
          "200": { description: "Total de citas por especialidad" },
        },
      },
    },
    "/api/reports/daily": {
      get: {
        tags: ["Reportes (Gerencia)"],
        summary: "Corte operativo diario: citas completadas y canceladas en una fecha",
        parameters: [
          {
            name: "date",
            in: "query",
            required: true,
            description: "Fecha del reporte (YYYY-MM-DD)",
            schema: { type: "string", format: "date", example: "2026-12-01" },
          },
        ],
        responses: {
          "200": { description: "Conteo de citas completadas y canceladas" },
          "400": { description: "Formato de fecha inválido" },
        },
      },
    },
  },
};
