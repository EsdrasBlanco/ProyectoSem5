import express from "express";
import type { Application } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./config/swagger";
import authRouter from "./routes/authRoute";
import patientRouter from "./routes/patientRoute";
import medicRouter from "./routes/medicRoute";
import appointmentRouter from "./routes/appointmentRoute";
import specialtyRouter from "./routes/specialtyRoute";
import reportRouter from "./routes/reportRoute";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

// La app se exporta sin hacer listen() para poder usarla en las pruebas
const app: Application = express();

app.use(cors());
app.use(express.json());

// Convierte los campos que son solo fecha (@db.Date) a "YYYY-MM-DD" en el JSON,
// porque Date de JS siempre se serializa con "T00:00:00.000Z".
const DATE_ONLY_KEYS = new Set(["createdAt", "updatedAt", "birthDate"]);
app.set("json replacer", function (this: Record<string, unknown>, key: string, value: unknown) {
  if (DATE_ONLY_KEYS.has(key) && this[key] instanceof Date) {
    return (this[key] as Date).toISOString().slice(0, 10);
  }
  return value;
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use("/api", authRouter);
app.use("/api", patientRouter);
app.use("/api", medicRouter);
app.use("/api", appointmentRouter);
app.use("/api", specialtyRouter);
app.use("/api", reportRouter);

// Siempre al final: 404 y manejador central de errores
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
