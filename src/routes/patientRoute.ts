import { Router } from "express";
import { getPatients, getPatientRecord, createPatient } from "../controllers/patientController";

const router = Router();

// TODO JWT: proteger escritura con rol RECEPCIONISTA
router.get("/patients", getPatients);
router.get("/patients/:id", getPatientRecord);
router.post("/patients", createPatient);

export default router;