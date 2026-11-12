import "dotenv/config";
import express from "express";
import type { Application } from "express";
import cors from "cors";
import patientRouter from "./routes/patientRoute";
import medicRouter from "./routes/medicRoute";
import appointmentRouter from "./routes/appointmentRoute";
import specialtyRouter from "./routes/specialtyRoute";
import reportRouter from "./routes/reportRoute";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", patientRouter);
app.use("/api", medicRouter);
app.use("/api", appointmentRouter);
app.use("/api", specialtyRouter);
app.use("/api", reportRouter);

// Siempre al final: 404 y manejador central de errores
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SERVIDOR CORRIENDO EN http://localhost:${PORT}`);
});