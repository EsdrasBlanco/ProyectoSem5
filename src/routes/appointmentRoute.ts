import { Router } from "express";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
} from "../controllers/appointmentController";

const router = Router();

router.get("/appointments", getAppointments);
router.get("/appointments/:id", getAppointmentById);
router.post("/appointments", createAppointment); // TODO JWT: RECEPCIONISTA
router.patch("/appointments/:id/status", updateAppointmentStatus); // TODO JWT: MEDICO

export default router;
