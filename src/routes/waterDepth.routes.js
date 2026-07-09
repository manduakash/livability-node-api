import { Router } from "express";
import { listWaterDepth } from "../controllers/waterDepth.controller.js";

const router = Router();

/** GET /api/:portal/water-depth */
router.get("/water-depth", listWaterDepth);

export default router;
