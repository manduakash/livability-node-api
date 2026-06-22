import { response } from "../utils/response.js";
import { AmcModel, VALID_FACT_SHEETS } from "../models/amc.model.js";
import { logAudit } from "../utils/auditLog.js";

/** GET /api/:portal/amc/:realEstateId/:factSheet */
export async function getAmc(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const { factSheet } = req.params;

    if (!VALID_FACT_SHEETS.includes(factSheet)) {
      return response.error(res, `factSheet must be one of: ${VALID_FACT_SHEETS.join(", ")}`, 400);
    }

    const row = await AmcModel.get(realEstateId, factSheet);
    if (!row) return response.error(res, "No AMC record found", 404);
    return response.success(res, "AMC record fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch AMC record: ${err.message}`);
  }
}

/** GET /api/:portal/amc/:realEstateId - all 5 fact sheets at once */
export async function getAllAmc(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const result = await AmcModel.getAllForRealEstate(realEstateId);
    return response.success(res, "AMC records fetched", result);
  } catch (err) {
    return response.error(res, `Failed to fetch AMC records: ${err.message}`);
  }
}

/** PUT /api/:portal/amc/:realEstateId/:factSheet  { name, address, phone, emailid, gst } */
export async function upsertAmc(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const { factSheet } = req.params;

    const id = await AmcModel.upsert({ ...req.body, factSheet, realEstateId });

    await logAudit(req, {
      type: "EDIT",
      lnk: "save_amc_admin.php",
      panel: req.portal.toUpperCase(),
      module: `Edit_amc_${factSheet}`,
    });

    return response.success(res, "AMC record saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save AMC record: ${err.message}`);
  }
}
