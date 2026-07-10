import { Router } from "express";
import * as stpController from "../controllers/stp.controller.js";

const router = Router();

router.get("/stp/report", stpController.getStpReport);
router.get("/stp/:realEstateId", stpController.getStp);
router.put("/stp/:realEstateId", stpController.upsertStp);

router.get("/stp-readings/years", stpController.listStpReadingYears);
router.get("/stp-readings/by-year", stpController.listStpReadingsByYear);
router.get("/stp-readings", stpController.listStpReadings);
router.post("/stp-readings", stpController.createStpReading);
router.delete("/stp-readings/:id", stpController.removeStpReading);

export default router;
