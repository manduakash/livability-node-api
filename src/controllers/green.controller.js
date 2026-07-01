import { response } from "../utils/response.js";
import { GreenModel } from "../models/green.model.js";
import { logAudit } from "../utils/auditLog.js";

/** GET /api/:portal/green/:realEstateId */
export async function getGreen(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const row = await GreenModel.getByRealEstate(realEstateId);
    if (!row) return response.success(res, "No green/tree config found for this property", null);
    return response.success(res, "Green config fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch green config: ${err.message}`);
  }
}

/** GET /api/:portal/green?realEstateId=1&from=&to= */
export async function listGreen(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);

    const { from, to } = req.query;
    const rows = from && to
      ? await GreenModel.listByDateRange(realEstateId, from, to)
      : await GreenModel.listByRealEstate(realEstateId);

    return response.success(res, "Green records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch green records: ${err.message}`);
  }
}

/** PUT /api/:portal/green/:realEstateId */
export async function upsertGreen(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const id = await GreenModel.upsert({ ...req.body, realEstateId });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_green_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_green",
    });

    return response.success(res, "Green config saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save green config: ${err.message}`);
  }
}

/**
 * GET /api/:portal/green/report?from=&to=&name=&stateId=&page=0&pageSize=10
 * Cross-property admin reporting view.
 */
export async function getGreenReport(req, res) {
  try {
    const { from, to, name, stateId } = req.query;
    if (!from || !to) return response.error(res, "from and to are required", 400);

    const page = req.query.page !== undefined ? Number(req.query.page) : undefined;
    const pageSize = Number(req.query.pageSize) || 10;

    const rows = await GreenModel.reportByDateRange({
      fromDate: from,
      toDate: to,
      nameSearch: name,
      stateId,
      offset: page !== undefined ? page * pageSize : undefined,
      pageSize,
    });

    return response.success(res, "Green report fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch green report: ${err.message}`);
  }
}

/**
 * GET /api/:portal/green/active-report?from=&to=&stateId=&name=&page=0&pageSize=10
 * Cross-property report restricted to properties with status='active'.
 */
export async function getGreenActiveReport(req, res) {
  try {
    const { from, to, stateId, name } = req.query;
    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;

    const rows = await GreenModel.listActivePropertiesReport({
      fromDate: from,
      toDate: to,
      stateId,
      exactName: name,
      offset: page * pageSize,
      pageSize,
    });

    return response.success(res, "Active properties green report fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch active properties green report: ${err.message}`);
  }
}
