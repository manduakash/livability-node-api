import { Router } from "express";
import * as greenController from "../controllers/green.controller.js";

const router = Router();

router.get("/green/report", greenController.getGreenReport);
router.get("/green/active-report", greenController.getGreenActiveReport);
router.get("/green/noncompliance-report", greenController.getGreeneryNonComplianceReport);
router.get("/green/:realEstateId", greenController.getGreen);
router.get("/green", greenController.listGreen);
router.put("/green/:realEstateId", greenController.upsertGreen);

export default router;
