import { response } from "../utils/response.js";
import { DgSetUsageModel } from "../models/dgSetUsage.model.js";
import { logAudit } from "../utils/auditLog.js";

/** GET /api/:portal/dg-set-usage/report?from=&to=&realEstateId=&page=0&pageSize=10 */
export async function getDgSetUsageReport(req, res) {
  try {
    const { from, to, realEstateId } = req.query;

    const page = req.query.page !== undefined ? Number(req.query.page) : undefined;
    const pageSize = Number(req.query.pageSize) || 10;
    const offset = page !== undefined ? page * pageSize : undefined;

    const rows = await DgSetUsageModel.reportByDateRange({
      fromDate: from,
      toDate: to,
      realEstateId: realEstateId !== undefined && realEstateId !== "all" && realEstateId !== "" ? Number(realEstateId) : 0,
      offset,
      pageSize,
    });

    const data = rows.map((row, index) => {
      const year = row.dateOfDg instanceof Date 
        ? row.dateOfDg.getFullYear() 
        : (row.dateOfDg ? new Date(row.dateOfDg).getFullYear() : "");

      return {
        sl: (offset !== undefined ? offset : 0) + index + 1,
        year,
        hours: Number(row.hoursUsed) || 0,
        electricity: `${Number(row.electricity) || 0} kWh`,
        oil: `${Number(row.oilConsumption) || 0} L`,
        waste: `${Number(row.wasteGenerated) || 0} kg`,
      };
    });

    return response.success(res, "DG set usage report fetched successfully", data);
  } catch (err) {
    return response.error(res, `Failed to fetch DG set usage report: ${err.message}`);
  }
}

/** GET /api/:portal/dg-set-usage?realEstateId=1&from=&to= */
export async function listDgSetUsage(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);

    const { from, to } = req.query;
    const rows = from && to
      ? await DgSetUsageModel.listByDateRange(realEstateId, from, to)
      : await DgSetUsageModel.listByRealEstate(realEstateId);

    return response.success(res, "DG set usage records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch DG set usage records: ${err.message}`);
  }
}

/** POST /api/:portal/dg-set-usage  { hoursUsed, electricity, oilConsumption, wasteGenerated, dateOfDg, realEstateId } */
export async function createDgSetUsage(req, res) {
  try {
    const { hoursUsed, electricity, oilConsumption, wasteGenerated, dateOfDg, realEstateId } = req.body;
    if (!dateOfDg || !realEstateId) {
      return response.error(res, "dateOfDg and realEstateId are required", 400);
    }

    const id = await DgSetUsageModel.create({
      hoursUsed: Number(hoursUsed) || 0,
      electricity: Number(electricity) || 0,
      oilConsumption: Number(oilConsumption) || 0,
      wasteGenerated: Number(wasteGenerated) || 0,
      dateOfDg,
      realEstateId: Number(realEstateId),
    });

    await logAudit(req, {
      type: "ADD",
      lnk: "add_dg_set_usage_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_dg_set_usage",
    });

    return response.success(res, "DG set usage record created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create DG set usage record: ${err.message}`);
  }
}

/** DELETE /api/:portal/dg-set-usage/:id?realEstateId=1 */
export async function removeDgSetUsage(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;

    const existing = await DgSetUsageModel.remove(id, realEstateId);
    if (!existing) return response.error(res, "DG set usage record not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "dg_set_usage_delete.php",
      panel: req.portal.toUpperCase(),
      module: "Delete_dg_set_usage",
    });

    return response.success(res, "DG set usage record deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete DG set usage record: ${err.message}`);
  }
}
