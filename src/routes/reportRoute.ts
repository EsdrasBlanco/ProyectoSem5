import { Router } from "express";
import { appointmentsBySpecialty, dailyReport } from "../controllers/reportController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

// Todas las rutas de reportes solo para GERENCIA
router.get(
  "/reports/appointments-by-specialty",
  authenticate,
  authorize("GERENCIA"),
  appointmentsBySpecialty,
);
router.get("/reports/daily", authenticate, authorize("GERENCIA"), dailyReport);

export default router;
