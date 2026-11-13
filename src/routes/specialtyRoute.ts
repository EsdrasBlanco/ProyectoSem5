import { Router } from "express";
import { getSpecialties, createSpecialty } from "../controllers/specialtyController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

// Catálogo público de especialidades
router.get("/specialties", getSpecialties);
router.post("/specialties", authenticate, authorize("GERENCIA"), createSpecialty);

export default router;
