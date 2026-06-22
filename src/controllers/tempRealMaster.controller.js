import { response } from "../utils/response.js";
import { TempRealMasterModel } from "../models/tempRealMaster.model.js";
import { logAudit } from "../utils/auditLog.js";

/**
 * POST /api/public/real-estate-registration - public self-registration form
 */
export async function register(req, res) {
  try {
    const { realEstateName } = req.body;
    if (!realEstateName) return response.error(res, "realEstateName is required", 400);

    const result = await TempRealMasterModel.create(req.body);
    if (!result.created) {
      return response.error(res, result.reason, 409);
    }

    return response.success(res, "Registration submitted for approval", { id: result.id }, 201);
  } catch (err) {
    return response.error(res, `Failed to submit registration: ${err.message}`);
  }
}

/** GET /api/:portal/real-estate-registration/pending - admin review queue */
export async function listPending(req, res) {
  try {
    const rows = await TempRealMasterModel.listPending();
    return response.success(res, "Pending registrations fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch pending registrations: ${err.message}`);
  }
}

/** GET /api/:portal/real-estate-registration/search?name= */
export async function search(req, res) {
  try {
    const { name } = req.query;
    if (!name) return response.error(res, "name is required", 400);

    const rows = await TempRealMasterModel.searchByName(name);
    return response.success(res, "Registration search results", rows);
  } catch (err) {
    return response.error(res, `Failed to search registrations: ${err.message}`);
  }
}

/** GET /api/:portal/real-estate-registration/by-name/:realEstateName - a registrant's own submission history */
export async function listByRegistrant(req, res) {
  try {
    const { realEstateName } = req.params;
    const rows = await TempRealMasterModel.listByRegistrant(realEstateName);
    return response.success(res, "Registration history fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch registration history: ${err.message}`);
  }
}

/** GET /api/:portal/real-estate-registration/:id */
export async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    const row = await TempRealMasterModel.getById(id);
    if (!row) return response.error(res, "Registration not found", 404);
    return response.success(res, "Registration fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch registration: ${err.message}`);
  }
}

/**
 * POST /api/:portal/real-estate-registration/:id/approve
 * { username, password } - the new real_estate_master account credentials
 */
export async function approve(req, res) {
  try {
    const id = Number(req.params.id);
    const { username, password } = req.body;
    const approverName = req.user?.username ?? "";

    const result = await TempRealMasterModel.approve(id, approverName, { username, password });
    if (!result) return response.error(res, "Registration not found", 404);

    await logAudit(req, {
      type: "EDIT",
      lnk: "approve_real_estate_registration_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Approve_real_estate_registration",
    });

    return response.success(res, "Registration approved", result);
  } catch (err) {
    return response.error(res, `Failed to approve registration: ${err.message}`);
  }
}

/** DELETE /api/:portal/real-estate-registration/:id */
export async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await TempRealMasterModel.remove(id);
    if (!existing) return response.error(res, "Registration not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "real_estate_registration_delete.php",
      panel: req.portal.toUpperCase(),
      module: `Delete_registration_${existing.realEstateName}`,
    });

    return response.success(res, "Registration deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete registration: ${err.message}`);
  }
}
