import { Router } from "express";
import {
  syncWaterDepth,
  getWaterDepthHourly,
  syncAaqStations,
} from "../controllers/enggenv.controller.js";

const router = Router();

router.get("/water-sensor/sync", syncWaterDepth);
router.get("/water-sensor/hourly", getWaterDepthHourly);
router.get("/aaq/sync", syncAaqStations);

export default router;
