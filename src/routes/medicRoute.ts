import { Router } from "express";
import { getMedics, createMedic, getMedicAgenda } from "../controllers/medicController";

const router = Router();

router.get("/medics", getMedics);
router.post("/medics", createMedic); // TODO JWT: GERENCIA
router.get("/medics/:id/appointments", getMedicAgenda); // TODO JWT: MEDICO

export default router;