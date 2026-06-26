import { Router } from "express";
import { syncParibeshNoise } from "../controllers/paribesh.controller.js";

const router = Router();

router.get("/noise/paribesh/sync", syncParibeshNoise);

export default router;
