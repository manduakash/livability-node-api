import { Router } from "express";
import { syncStationData } from "../controllers/wbpcb.controller.js";

const router = Router();

router.get("/wbpcb/sync", syncStationData);

export default router;
