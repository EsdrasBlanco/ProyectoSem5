import { Router } from "express";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.get(
  "/appointments",
  authenticate,
  authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"),
  getAppointments,
);
router.get(
  "/appointments/:id",
  authenticate,
  authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"),
  getAppointmentById,
);
router.post(
  "/appointments",
  authenticate,
  authorize("RECEPCIONISTA", "GERENCIA"),
  createAppointment,
);
router.patch(
  "/appointments/:id/status",
  authenticate,
  authorize("MEDICO", "GERENCIA"),
  updateAppointmentStatus,
);

export default router;
