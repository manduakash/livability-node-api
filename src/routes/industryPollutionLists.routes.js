import { Router } from "express";
import * as controller from "../controllers/industryPollutionLists.controller.js";
import { getNoiseQualityReport } from "../controllers/anms.controller.js";

const router = Router();

router.get("/water-consumption-list/totals", controller.getWaterConsumptionTotals);
router.get("/water-consumption-list", controller.listWaterConsumption);
router.post("/water-consumption-list", controller.createWaterConsumption);

router.get("/water-polution-list/totals", controller.getWaterPolutionTotals);
router.get("/water-polution-list", controller.listWaterPolution);
router.post("/water-polution-list", controller.createWaterPolution);
router.put("/water-polution-list/:id", controller.updateWaterPolution);
router.delete("/water-polution-list/:id", controller.removeWaterPolution);

router.get("/air-polution-list/totals", controller.getAirPolutionTotals);
router.get("/air-polution-list", controller.listAirPolution);
router.post("/air-polution-list", controller.createAirPolution);

router.get("/aqms-monitoring-aqi", controller.listAqmsMonitoringAqi);
router.post("/aqms-monitoring-aqi", controller.createAqmsMonitoringAqi);
router.get("/air-quality-report", controller.getAirQualityReport);
router.get("/noise-quality-report", getNoiseQualityReport);

export default router;
