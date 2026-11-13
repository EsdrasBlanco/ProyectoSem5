import { Router } from "express";
import { getPatients, getPatientRecord, createPatient } from "../controllers/patientController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.get("/patients", authenticate, authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"), getPatients);
router.get(
  "/patients/:id",
  authenticate,
  authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"),
  getPatientRecord,
);
router.post("/patients", authenticate, authorize("RECEPCIONISTA", "GERENCIA"), createPatient);

export default router;