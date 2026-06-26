import { response } from "../utils/response.js";
import { EcModuleConditionModel, EC_CHECKLIST_ITEMS } from "../models/ecModuleCondition.model.js";
import { logAudit } from "../utils/auditLog.js";

/** GET /api/:portal/ec-module/:ecModuleId/conditions - the full 20-item checklist */
export async function listConditions(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const rows = await EcModuleConditionModel.listForEcModule(ecModuleId);
    return response.success(res, "EC module checklist fetched", { items: rows, shape: EC_CHECKLIST_ITEMS });
  } catch (err) {
    return response.error(res, `Failed to fetch EC module checklist: ${err.message}`);
  }
}

/**
 * GET /api/:portal/ec-module/:ecModuleId/conditions/:condition/:subCondition/:head
 * One specific checklist item.
 */
export async function getCondition(req, res) {
  try {
    const { ecModuleId, condition, subCondition, head } = req.params;

    const row = await EcModuleConditionModel.get(
      Number(ecModuleId),
      Number(condition),
      Number(subCondition),
      Number(head)
    );

    if (!row) return response.error(res, "Checklist item not found", 404);
    return response.success(res, "Checklist item fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch checklist item: ${err.message}`);
  }
}

/**
 * PUT /api/:portal/ec-module/:ecModuleId/conditions/:condition/:subCondition/:head
 * { realEstateId, subHead1, subHead2, sessionKey }
 */
export async function setCondition(req, res) {
  try {
    const { ecModuleId, condition, subCondition, head } = req.params;
    const { realEstateId, subHead1, subHead2, sessionKey } = req.body;

    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const id = await EcModuleConditionModel.set({
      realEstateId: Number(realEstateId),
      ecModuleId: Number(ecModuleId),
      condition: Number(condition),
      subCondition: Number(subCondition),
      head: Number(head),
      subHead1,
      subHead2,
      sessionKey,
    });

    return response.success(res, "Checklist item saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save checklist item: ${err.message}`);
  }
}

/**
 * PUT /api/:portal/ec-module/:ecModuleId/conditions
 * { realEstateId, sessionKey, items: [{ condition, subCondition, head, subHead1, subHead2 }, ...] }
 * Saves the whole 20-item checklist in one call.
 */
export async function setAllConditions(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const { realEstateId, sessionKey, items } = req.body;

    if (!realEstateId || !Array.isArray(items)) {
      return response.error(res, "realEstateId and an items array are required", 400);
    }

    const ids = await EcModuleConditionModel.setAll({
      realEstateId: Number(realEstateId),
      ecModuleId,
      sessionKey,
      items,
    });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_ec_module_condition_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_ec_module_condition",
    });

    return response.success(res, "Checklist saved", { ids });
  } catch (err) {
    return response.error(res, `Failed to save checklist: ${err.message}`);
  }
}
