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
 * GET /api/:portal/green/report?from=&to=&fromYear=&toYear=&name=&nameSearch=&stateId=&page=0&pageSize=10
 * Cross-property admin reporting view.
 */
export async function getGreenReport(req, res) {
  try {
    const { from, to, fromYear, toYear, name, nameSearch, stateId } = req.query;

    let fromDate = from;
    let toDate = to;

    if (fromYear) {
      fromDate = `${fromYear}-01-01`;
    }
    if (toYear) {
      toDate = `${toYear}-12-31`;
    }

    const page = req.query.page !== undefined ? Number(req.query.page) : undefined;
    const pageSize = Number(req.query.pageSize) || 10;
    const offset = page !== undefined ? page * pageSize : undefined;

    const rows = await GreenModel.reportByDateRange({
      fromDate,
      toDate,
      nameSearch: name || nameSearch,
      stateId,
      offset,
      pageSize,
    });

    const data = rows.map((row, index) => {
      const actualAreaVal = parseFloat(row.actualArea) || 0;
      const totAreaVal = parseFloat(row.totArea) || 0;
      const pctOfTotalArea = totAreaVal > 0 ? ((actualAreaVal / totAreaVal) * 100).toFixed(2) : "0.00";

      // Formatted date string for dt (YYYY-MM-DD)
      const dateStr = row.dt instanceof Date 
        ? row.dt.toISOString().split('T')[0] 
        : String(row.dt || '');

      const year = row.dt instanceof Date 
        ? row.dt.getFullYear() 
        : (row.dt ? new Date(row.dt).getFullYear() : "");

      return {
        slNo: (offset !== undefined ? offset : 0) + index + 1,
        year,
        realEstateName: row.realEstateName,
        areaUnderGreenery: `${row.actualArea}(${dateStr})`,
        pctOfTotalArea,
        noOfTrees: Number(row.trees) || 0,
      };
    });

    return response.success(res, "Green report fetched successfully", data);
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
