import { Router } from "express";
import * as livabilityController from "../controllers/livability.controller.js";

const router = Router();

// criteria master (livability_index_master)
router.get("/livability/criteria", livabilityController.listCriteria);
router.get("/livability/criteria/max-points", livabilityController.getMaxPoints);
router.put("/livability/criteria/:id", livabilityController.updateCriterion);

// leaderboard (temp_livability) — before /:realEstateId to avoid route conflict
router.get("/livability/leaderboard/top", livabilityController.getTopPerformers);
router.get("/livability/leaderboard/bottom", livabilityController.getBottomPerformers);

// compliant-properties count by criterion name
router.get("/livability/criteria/:criterionName/compliant-properties", livabilityController.getCompliantProperties);

// per-property assessment (livability)
router.get("/livability/:realEstateId/latest", livabilityController.getLatestAssessment);
router.get("/livability/:realEstateId/dates", livabilityController.listAssessmentDates);
router.get("/livability/:realEstateId/criteria/:livabilityId/history", livabilityController.getCriterionHistory);
router.put("/livability/:realEstateId/assessment", livabilityController.saveAssessment);

// per-property score cache (temp_livability)
router.get("/livability/:realEstateId/score", livabilityController.getScore);
router.post("/livability/:realEstateId/score/refresh", livabilityController.refreshScore);

export default router;
