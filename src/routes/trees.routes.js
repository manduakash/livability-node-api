import { Router } from "express";
import * as treesController from "../controllers/trees.controller.js";

/**
 * One router definition, mounted 3 times (once per portal) in routes/index.js
 * - each mount point applies its own auth + portal tag, per the decision to
 * keep 3 separate route namespaces mirroring the legacy PHP portals.
 */
const router = Router();

router.get("/trees", treesController.list);
router.get("/trees/:id", treesController.getOne);
router.post("/trees", treesController.create);
router.put("/trees/:id", treesController.update);
router.delete("/trees/:id", treesController.remove);

export default router;
