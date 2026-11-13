import { Router } from "express";
import { getMedics, createMedic, getMedicAgenda } from "../controllers/medicController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

router.get("/medics", authenticate, authorize("RECEPCIONISTA", "MEDICO", "GERENCIA"), getMedics);
router.post("/medics", authenticate, authorize("GERENCIA"), createMedic);
router.get(
  "/medics/:id/appointments",
  authenticate,
  authorize("MEDICO", "GERENCIA"),
  getMedicAgenda,
);

export default router;