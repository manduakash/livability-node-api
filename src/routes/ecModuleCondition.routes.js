import { Router } from "express";
import * as ecConditionController from "../controllers/ecModuleCondition.controller.js";

const router = Router();

router.get("/ec-module/:ecModuleId/conditions", ecConditionController.listConditions);
router.put("/ec-module/:ecModuleId/conditions", ecConditionController.setAllConditions);
router.get(
  "/ec-module/:ecModuleId/conditions/:condition/:subCondition/:head",
  ecConditionController.getCondition
);
router.put(
  "/ec-module/:ecModuleId/conditions/:condition/:subCondition/:head",
  ecConditionController.setCondition
);

export default router;
