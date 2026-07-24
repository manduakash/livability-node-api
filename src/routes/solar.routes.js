import { Router } from "express";
import * as solarController from "../controllers/solar.controller.js";

const router = Router();

router.get("/solar-energy/:realEstateId", solarController.getSolarEnergy);
router.put("/solar-energy/:realEstateId", solarController.upsertSolarEnergy);
router.patch("/solar-energy/:realEstateId/points", solarController.updateSolarEnergyPoints);

router.get("/solar-generation/chart", solarController.listSolarGenerationChart);
router.get("/solar-generation", solarController.listSolarGeneration);
router.post("/solar-generation", solarController.createSolarGeneration);
router.put("/solar-generation/:id", solarController.updateSolarGeneration);
router.delete("/solar-generation/:id", solarController.removeSolarGeneration);
router.get("/solar-generation-report", solarController.getSolarGenerationReport);
router.get("/solar-underproduction-report", solarController.getSolarUnderProductionReport);

export default router;
