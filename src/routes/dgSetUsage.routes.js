import { Router } from "express";
import * as dgSetUsageController from "../controllers/dgSetUsage.controller.js";

const router = Router();

router.get("/dg-set-usage", dgSetUsageController.listDgSetUsage);
router.post("/dg-set-usage", dgSetUsageController.createDgSetUsage);
router.delete("/dg-set-usage/:id", dgSetUsageController.removeDgSetUsage);

export default router;
