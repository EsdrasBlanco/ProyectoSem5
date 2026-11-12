import { Router } from "express";
import { appointmentsBySpecialty, dailyReport } from "../controllers/reportController";

const router = Router();

// TODO JWT: todas las rutas de reportes solo para GERENCIA
router.get("/reports/appointments-by-specialty", appointmentsBySpecialty);
router.get("/reports/daily", dailyReport);

export default router;
