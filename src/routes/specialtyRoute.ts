import { Router } from "express";
import { getSpecialties, createSpecialty } from "../controllers/specialtyController";

const router = Router();

router.get("/specialties", getSpecialties);
router.post("/specialties", createSpecialty); // TODO JWT: GERENCIA

export default router;
