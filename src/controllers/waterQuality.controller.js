import { response } from "../utils/response.js";
import { PortableWaterQualityModel, WaterQualityModel } from "../models/waterQuality.model.js";
import { RealEstateMasterModel } from "../models/realEstateMaster.model.js";
import { logAudit } from "../utils/auditLog.js";

// --- portable_water_quality ---

/** GET /api/:portal/portable-water-quality/:realEstateId */
export async function getPortableWaterQuality(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const row = await PortableWaterQualityModel.getByRealEstate(realEstateId);
    if (!row) return response.error(res, "No portable water quality config found for this property", 404);
    return response.success(res, "Portable water quality config fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch portable water quality config: ${err.message}`);
  }
}

/** PUT /api/:portal/portable-water-quality/:realEstateId */
export async function upsertPortableWaterQuality(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const id = await PortableWaterQualityModel.upsert({ ...req.body, realEstateId });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_portable_water_quality_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_portable_water_quality",
    });

    return response.success(res, "Portable water quality config saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save portable water quality config: ${err.message}`);
  }
}

// --- water_quality ---

/** GET /api/:portal/water-quality?realEstateId=1&from=2026-01-01&to=2026-12-31 (or &limit=10) */
export async function listWaterQuality(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);
    const { from, to } = req.query;

    let rows;
    if (from && to) {
      rows = await WaterQualityModel.listByDateRange(realEstateId, from, to);
    } else {
      const limit = Number(req.query.limit) || 10;
      rows = await WaterQualityModel.listRecent(realEstateId, limit);
    }

    const reIds = [...new Set(rows.map((r) => r.realEstateId))];
    const reMap = {};
    for (const id of reIds) {
      const re = await RealEstateMasterModel.getById(id);
      reMap[id] = re ? re.realEstateName : "";
    }

    const mappedRows = rows.map((row) => ({
      ...row,
      realEstateName: reMap[row.realEstateId] || "",
    }));

    return response.success(res, "Water quality readings fetched", mappedRows);
  } catch (err) {
    return response.error(res, `Failed to fetch water quality readings: ${err.message}`);
  }
}

/** GET /api/:portal/water-quality/chart?realEstateId=1&limit=10 */
export async function listWaterQualityChart(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);

    const limit = Number(req.query.limit) || 10;
    const rows = await WaterQualityModel.listRecentForChart(realEstateId, limit);
    return response.success(res, "Water quality chart data fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch water quality chart data: ${err.message}`);
  }
}

/** GET /api/:portal/water-quality/years?realEstateId=1&from=&to= */
export async function listWaterQualityYears(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "" || !req.query.from || !req.query.to) {
      return response.error(res, "realEstateId, from, and to are required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);
    const { from, to } = req.query;

    const years = await WaterQualityModel.listDistinctYears(realEstateId, from, to);
    return response.success(res, "Distinct water quality years fetched", years);
  } catch (err) {
    return response.error(res, `Failed to fetch water quality years: ${err.message}`);
  }
}

/** GET /api/:portal/water-quality/by-year?realEstateId=1&year=2026&from=&to= */
export async function listWaterQualityByYear(req, res) {
  try {
    const { year, from, to } = req.query;
    if (!year || !from || !to) return response.error(res, "year, from, and to are required", 400);

    const rows = await WaterQualityModel.listMetricsByYear(Number(year), from, to);
    return response.success(res, "Water quality metrics fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch water quality metrics: ${err.message}`);
  }
}

/** POST /api/:portal/water-quality  { tss, tds, temp, ph, bod, cod, readingDate, realEstateId } */
export async function createWaterQuality(req, res) {
  try {
    const { tss, tds, temp, ph, bod, cod, readingDate, realEstateId } = req.body;
    if (!readingDate || !realEstateId) {
      return response.error(res, "readingDate and realEstateId are required", 400);
    }

    const id = await WaterQualityModel.create({
      tss: tss ?? "",
      tds: tds ?? "",
      temp: temp ?? "",
      ph: Number(ph) || 0,
      bod: bod ?? "",
      cod: cod ?? "",
      readingDate,
      realEstateId: Number(realEstateId),
    });

    await logAudit(req, {
      type: "ADD",
      lnk: "add_water_quality_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_water_quality",
    });

    return response.success(res, "Water quality reading created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create water quality reading: ${err.message}`);
  }
}

/** DELETE /api/:portal/water-quality/:id */
export async function removeWaterQuality(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await WaterQualityModel.remove(id);
    if (!existing) return response.error(res, "Water quality reading not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "water_quality_delete.php",
      panel: req.portal.toUpperCase(),
      module: "Delete_water_quality",
    });

    return response.success(res, "Water quality reading deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete water quality reading: ${err.message}`);
  }
}
