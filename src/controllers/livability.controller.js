import { response } from "../utils/response.js";
import {
  LivabilityIndexMasterModel,
  LivabilityModel,
  TempLivabilityModel,
} from "../models/livability.model.js";
import { logAudit } from "../utils/auditLog.js";

// --- livability_index_master (criteria) ---

/** GET /api/:portal/livability/criteria */
export async function listCriteria(req, res) {
  try {
    const rows = await LivabilityIndexMasterModel.listAll();
    return response.success(res, "Livability criteria fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch livability criteria: ${err.message}`);
  }
}

/** GET /api/:portal/livability/criteria/max-points */
export async function getMaxPoints(req, res) {
  try {
    const total = await LivabilityIndexMasterModel.getMaxPossiblePoints();
    return response.success(res, "Maximum possible points fetched", { total });
  } catch (err) {
    return response.error(res, `Failed to fetch maximum possible points: ${err.message}`);
  }
}

/** PUT /api/:portal/livability/criteria/:id  { name, points } */
export async function updateCriterion(req, res) {
  try {
    const id = Number(req.params.id);
    const { name, points } = req.body;
    if (!name || points === undefined) {
      return response.error(res, "name and points are required", 400);
    }

    const result = await LivabilityIndexMasterModel.update(id, { name, points: Number(points) });
    if (!result) return response.error(res, "Criterion not found", 404);

    await logAudit(req, {
      type: "EDIT",
      lnk: "edit_livability_index_master_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_livability_criterion",
    });

    return response.success(res, "Criterion updated", result);
  } catch (err) {
    return response.error(res, `Failed to update criterion: ${err.message}`);
  }
}

// --- livability (assessment log) ---

/** GET /api/:portal/livability/:realEstateId/latest - latest assessment snapshot */
export async function getLatestAssessment(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const result = await LivabilityModel.getLatestAssessment(realEstateId);
    return response.success(res, "Latest assessment fetched", result);
  } catch (err) {
    return response.error(res, `Failed to fetch latest assessment: ${err.message}`);
  }
}

/** GET /api/:portal/livability/:realEstateId/dates - list of assessment dates */
export async function listAssessmentDates(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const dates = await LivabilityModel.listAssessmentDates(realEstateId);
    return response.success(res, "Assessment dates fetched", dates);
  } catch (err) {
    return response.error(res, `Failed to fetch assessment dates: ${err.message}`);
  }
}

/** GET /api/:portal/livability/:realEstateId/criteria/:livabilityId/history */
export async function getCriterionHistory(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const livabilityId = Number(req.params.livabilityId);

    const rows = await LivabilityModel.getHistoryForCriterion(realEstateId, livabilityId);
    return response.success(res, "Criterion history fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch criterion history: ${err.message}`);
  }
}

/**
 * PUT /api/:portal/livability/:realEstateId/assessment
 * { date1, items: [{ livabilityId, status, remarks }, ...] }
 * Saves a full assessment in one call - mirrors the legacy form that
 * submits every criterion's status at once.
 */
export async function saveAssessment(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const { date1, items } = req.body;

    if (!date1 || !Array.isArray(items) || items.length === 0) {
      return response.error(res, "date1 and a non-empty items array are required", 400);
    }

    const results = await LivabilityModel.saveAssessment(realEstateId, date1, items);

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_livability_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Save_livability_assessment",
    });

    return response.success(res, "Assessment saved", results);
  } catch (err) {
    return response.error(res, `Failed to save assessment: ${err.message}`);
  }
}

/**
 * GET /api/:portal/livability/criteria/:criterionName/compliant-properties
 * Count of properties currently compliant with a specific named criterion.
 */
export async function getCompliantProperties(req, res) {
  try {
    const { criterionName } = req.params;
    const rows = await LivabilityModel.countCompliantPropertiesByCriterionName(criterionName);
    return response.success(res, "Compliant properties fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch compliant properties: ${err.message}`);
  }
}

// --- temp_livability (leaderboard cache) ---

/** GET /api/:portal/livability/:realEstateId/score */
export async function getScore(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const row = await TempLivabilityModel.getByRealEstate(realEstateId);
    if (!row) return response.error(res, "No cached score found for this property", 404);
    return response.success(res, "Score fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch score: ${err.message}`);
  }
}

/** POST /api/:portal/livability/:realEstateId/score/refresh - recomputes and caches the score */
export async function refreshScore(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const result = await TempLivabilityModel.refresh(realEstateId);
    return response.success(res, "Score refreshed", result);
  } catch (err) {
    return response.error(res, `Failed to refresh score: ${err.message}`);
  }
}

/** GET /api/:portal/livability/leaderboard/top?limit=10 */
export async function getTopPerformers(req, res) {
  try {
    const limit = Number(req.query.limit) || 10;
    const rows = await TempLivabilityModel.topPerformers(limit);
    return response.success(res, "Top performers fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch top performers: ${err.message}`);
  }
}

/** GET /api/:portal/livability/leaderboard/bottom?limit=10 */
export async function getBottomPerformers(req, res) {
  try {
    const limit = Number(req.query.limit) || 10;
    const rows = await TempLivabilityModel.bottomPerformers(limit);
    return response.success(res, "Bottom performers fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch bottom performers: ${err.message}`);
  }
}
