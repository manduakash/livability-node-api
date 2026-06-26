import { Router } from "express";
import { syncAnms, syncAllAnms } from "../controllers/anms.controller.js";
import { syncAqi, syncAllAqi } from "../controllers/aqi.controller.js";

const router = Router();

// Noise (ANMS)
router.get("/anms/sync-all", syncAllAnms);
router.get("/anms/:propertyKey/sync", syncAnms);

// Air quality (AQI)
router.get("/aqi/sync-all", syncAllAqi);
router.get("/aqi/:propertyKey/sync", syncAqi);

export default router;
