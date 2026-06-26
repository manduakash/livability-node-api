import { response } from "../utils/response.js";
import { SessionMasterModel } from "../models/sessionMaster.model.js";
import { logAudit } from "../utils/auditLog.js";

/** GET /api/:portal/sessions?realEstateId=1 */
export async function listSessions(req, res) {
  try {
    const { realEstateId } = req.query;
    const rows = realEstateId
      ? await SessionMasterModel.listByRealEstate(Number(realEstateId))
      : await SessionMasterModel.listAll();

    return response.success(res, "Sessions fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch sessions: ${err.message}`);
  }
}

/** GET /api/:portal/sessions/:id?realEstateId=1 */
export async function getSession(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;

    const row = await SessionMasterModel.getById(id, realEstateId);
    if (!row) return response.error(res, "Session not found", 404);
    return response.success(res, "Session fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch session: ${err.message}`);
  }
}

/** POST /api/:portal/sessions  { realEstateId, fromSession, toSession } */
export async function createSession(req, res) {
  try {
    const { realEstateId, fromSession, toSession } = req.body;
    if (!realEstateId || !fromSession || !toSession) {
      return response.error(res, "realEstateId, fromSession, and toSession are required", 400);
    }

    const result = await SessionMasterModel.create({
      realEstateId: Number(realEstateId),
      fromSession,
      toSession,
    });

    if (!result.created) {
      return response.success(res, "Session already exists for this date range", result);
    }

    await logAudit(req, {
      type: "ADD",
      lnk: "add_session.php",
      panel: req.portal.toUpperCase(),
      module: "Add_session",
    });

    return response.success(res, "Session created", result, 201);
  } catch (err) {
    return response.error(res, `Failed to create session: ${err.message}`);
  }
}

/** PUT /api/:portal/sessions/:id  { realEstateId, fromSession, toSession } */
export async function updateSession(req, res) {
  try {
    const id = Number(req.params.id);
    const { realEstateId, fromSession, toSession } = req.body;
    if (!realEstateId || !fromSession || !toSession) {
      return response.error(res, "realEstateId, fromSession, and toSession are required", 400);
    }

    const result = await SessionMasterModel.update(id, Number(realEstateId), { fromSession, toSession });
    if (!result) return response.error(res, "Session not found", 404);

    await logAudit(req, {
      type: "EDIT",
      lnk: "edit_session.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_session",
    });

    return response.success(res, "Session updated", result);
  } catch (err) {
    return response.error(res, `Failed to update session: ${err.message}`);
  }
}

/** DELETE /api/:portal/sessions/:id?realEstateId=1 */
export async function removeSession(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = Number(req.query.realEstateId);
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const existing = await SessionMasterModel.remove(id, realEstateId);
    if (!existing) return response.error(res, "Session not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "session_delete.php",
      panel: req.portal.toUpperCase(),
      module: "Delete_session",
    });

    return response.success(res, "Session deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete session: ${err.message}`);
  }
}
