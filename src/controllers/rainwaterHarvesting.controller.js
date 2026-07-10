import { response } from "../utils/response.js";
import { RainwaterHarvestingModel } from "../models/rainwaterHarvesting.model.js";
import { logAudit } from "../utils/auditLog.js";

/** GET /api/:portal/rainwater-harvesting/:realEstateId */
export async function getRainwaterHarvesting(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const row = await RainwaterHarvestingModel.getByRealEstate(realEstateId);
    if (!row) return response.error(res, "No rainwater harvesting config found for this property", 404);
    return response.success(res, "Rainwater harvesting config fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch rainwater harvesting config: ${err.message}`);
  }
}

/** PUT /api/:portal/rainwater-harvesting/:realEstateId */
export async function upsertRainwaterHarvesting(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const id = await RainwaterHarvestingModel.upsert({ ...req.body, realEstateId });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_rainwater_harvesting_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_rainwater_harvesting",
    });

    return response.success(res, "Rainwater harvesting config saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save rainwater harvesting config: ${err.message}`);
  }
}

/** GET /api/:portal/rainwater-harvesting?realEstateId=1&from=2026-01-01&to=2026-06-01 */
export async function listRainwaterHarvestingByWarranty(req, res) {
  try {
    const { from, to } = req.query;
    const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;
    if (!from || !to) return response.error(res, "from and to are required", 400);

    const rows = await RainwaterHarvestingModel.listByWarrantyDateRange(from, to, realEstateId);
    return response.success(res, "Rainwater harvesting warranty records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch rainwater harvesting warranty records: ${err.message}`);
  }
}

export async function getRainwaterCollectionReport(req, res) {
  try {
    const realEstateId = req.query.realEstateId !== undefined && req.query.realEstateId !== "" ? Number(req.query.realEstateId) : 0;
    const { from, to } = req.query;

    const data = await RainwaterHarvestingModel.getRainwaterCollectionReport(realEstateId, from, to);
    return response.success(res, "Rainwater collection report fetched successfully", data);
  } catch (err) {
    return response.error(res, `Failed to fetch rainwater collection report: ${err.message}`);
  }
}
