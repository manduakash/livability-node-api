import { response } from "../utils/response.js";
import { StpModel, StpReadingModel } from "../models/stp.model.js";
import { logAudit } from "../utils/auditLog.js";

// --- stp (device config) ---

/** GET /api/:portal/stp/:realEstateId */
export async function getStp(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const row = await StpModel.getByRealEstate(realEstateId);
    if (!row) return response.error(res, "No STP config found for this property", 404);
    return response.success(res, "STP config fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch STP config: ${err.message}`);
  }
}

/** PUT /api/:portal/stp/:realEstateId */
export async function upsertStp(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const id = await StpModel.upsert({ ...req.body, realEstateId });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_stp_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_stp",
    });

    return response.success(res, "STP config saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save STP config: ${err.message}`);
  }
}

// --- stp_reading (sensor log) ---

/** POST /api/:portal/stp-readings  { inlet, outlet, bod, ph, tss, nitrogen, cod, feedal, coliform, readingDate, realEstateId } */
export async function createStpReading(req, res) {
  try {
    const { realEstateId, readingDate } = req.body;
    if (!realEstateId || !readingDate) {
      return response.error(res, "realEstateId and readingDate are required", 400);
    }

    const id = await StpReadingModel.create({
      inlet: Number(req.body.inlet) || 0,
      outlet: Number(req.body.outlet) || 0,
      bod: Number(req.body.bod) || 0,
      ph: Number(req.body.ph) || 0,
      tss: Number(req.body.tss) || 0,
      nitrogen: Number(req.body.nitrogen) || 0,
      cod: Number(req.body.cod) || 0,
      feedal: Number(req.body.feedal) || 0,
      coliform: Number(req.body.coliform) || 0,
      readingDate,
      realEstateId: Number(realEstateId),
    });

    await logAudit(req, {
      type: "ADD",
      lnk: "add_stp_reading_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_stp_reading",
    });

    return response.success(res, "STP reading created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create STP reading: ${err.message}`);
  }
}

/** DELETE /api/:portal/stp-readings/:id?realEstateId=1 */
export async function removeStpReading(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = req.query.realEstateId
      ? Number(req.query.realEstateId)
      : req.body?.realEstateId
      ? Number(req.body.realEstateId)
      : undefined;

    const existing = await StpReadingModel.remove(id, realEstateId);
    if (!existing) return response.error(res, "STP reading not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "stp_reading_delete.php",
      panel: req.portal.toUpperCase(),
      module: "Delete_stp_reading",
    });

    return response.success(res, "STP reading deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete STP reading: ${err.message}`);
  }
}

/** GET /api/:portal/stp-readings?realEstateId=1&from=2026-01-01&to=2026-06-01 */
export async function listStpReadings(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);
    const { from, to } = req.query;
    if (!from || !to) {
      return response.error(res, "from and to are required", 400);
    }

    const rows = await StpReadingModel.listByDateRange(realEstateId, from, to);
    return response.success(res, "STP readings fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch STP readings: ${err.message}`);
  }
}

/** GET /api/:portal/stp-readings/years?realEstateId=1&from=2026-01-01&to=2026-06-01 */
export async function listStpReadingYears(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);
    const { from, to } = req.query;
    if (!from || !to) {
      return response.error(res, "from and to are required", 400);
    }

    const years = await StpReadingModel.listDistinctYears(realEstateId, from, to);
    return response.success(res, "Distinct reading years fetched", years);
  } catch (err) {
    return response.error(res, `Failed to fetch reading years: ${err.message}`);
  }
}

/** GET /api/:portal/stp-readings/by-year?realEstateId=1&year=2026&from=2026-01-01&to=2026-06-01 */
export async function listStpReadingsByYear(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);
    const { year, from, to } = req.query;
    if (!year || !from || !to) {
      return response.error(res, "year, from, and to are required", 400);
    }

    const rows = await StpReadingModel.listMetricsByYear(Number(year), from, to, realEstateId);
    return response.success(res, "STP reading metrics fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch STP reading metrics: ${err.message}`);
  }
}
