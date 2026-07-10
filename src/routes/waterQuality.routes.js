import { Router } from "express";
import * as waterQualityController from "../controllers/waterQuality.controller.js";

const router = Router();

router.get("/portable-water-quality/:realEstateId", waterQualityController.getPortableWaterQuality);
router.put("/portable-water-quality/:realEstateId", waterQualityController.upsertPortableWaterQuality);

router.get("/water-quality/chart", waterQualityController.listWaterQualityChart);
router.get("/water-quality/years", waterQualityController.listWaterQualityYears);
router.get("/water-quality/by-year", waterQualityController.listWaterQualityByYear);
router.get("/water-quality", waterQualityController.listWaterQuality);
router.post("/water-quality", waterQualityController.createWaterQuality);
router.delete("/water-quality/:id", waterQualityController.removeWaterQuality);
router.get("/water-quality-report", waterQualityController.getWaterQualityReport);

export default router;
