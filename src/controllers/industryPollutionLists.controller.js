import { response } from "../utils/response.js";
import {
  WaterConsumptionListModel,
  WaterPolutionListModel,
  AirPolutionListModel,
} from "../models/industryPollutionLists.model.js";
import { AqmsMonitoringAqiModel } from "../models/aqmsMonitoringAqi.model.js";
import { AqmsMonitoringModel } from "../models/aqmsMonitoring.model.js";
import { logAudit } from "../utils/auditLog.js";

// --- water_consumption_list ---

export async function listWaterConsumption(req, res) {
  try {
    const idParam = req.query.industryMs ?? req.query.realEstateId ?? req.query.realestateId;
    const industryMs = idParam !== undefined && idParam !== "" ? Number(idParam) : 0;

    const rows = await WaterConsumptionListModel.listByIndustry(industryMs);
    return response.success(res, "Water consumption records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch water consumption records: ${err.message}`);
  }
}

export async function getWaterConsumptionTotals(req, res) {
  try {
    const idParam = req.query.industryMs ?? req.query.realEstateId ?? req.query.realestateId;
    const industryMs = idParam !== undefined && idParam !== "" ? Number(idParam) : 0;

    const totals = await WaterConsumptionListModel.getTotalsByIndustry(industryMs);
    return response.success(res, "Water consumption totals fetched", totals);
  } catch (err) {
    return response.error(res, `Failed to fetch water consumption totals: ${err.message}`);
  }
}

export async function createWaterConsumption(req, res) {
  try {
    const { industryMs, realEstateId, airDate } = req.body;
    const idParam = industryMs ?? realEstateId;
    if (!idParam || !airDate) return response.error(res, "industryMs/realEstateId and airDate are required", 400);

    const result = await WaterConsumptionListModel.create({ ...req.body, industryMs: Number(idParam) });
    if (!result.created) {
      return response.success(res, "Record already exists, skipped (duplicate)", result);
    }

    await logAudit(req, {
      type: "ADD",
      lnk: "add_water_consumption_list_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_water_consumption_list",
    });

    return response.success(res, "Water consumption record created", result, 201);
  } catch (err) {
    return response.error(res, `Failed to create water consumption record: ${err.message}`);
  }
}

// --- water_polution_list ---

export async function listWaterPolution(req, res) {
  try {
    const idParam = req.query.industryMs ?? req.query.realEstateId ?? req.query.realestateId;
    const industryMs = idParam !== undefined && idParam !== "" ? Number(idParam) : 0;

    const rows = await WaterPolutionListModel.listByIndustry(industryMs);
    return response.success(res, "Water pollution records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch water pollution records: ${err.message}`);
  }
}

export async function getWaterPolutionTotals(req, res) {
  try {
    const idParam = req.query.industryMs ?? req.query.realEstateId ?? req.query.realestateId;
    const industryMs = idParam !== undefined && idParam !== "" ? Number(idParam) : 0;

    const totals = await WaterPolutionListModel.getTotalsByIndustry(industryMs);
    return response.success(res, "Water pollution totals fetched", totals);
  } catch (err) {
    return response.error(res, `Failed to fetch water pollution totals: ${err.message}`);
  }
}

export async function createWaterPolution(req, res) {
  try {
    const { industryMs, realEstateId, airDate } = req.body;
    const idParam = industryMs ?? realEstateId;
    if (!idParam || !airDate) return response.error(res, "industryMs/realEstateId and airDate are required", 400);

    const result = await WaterPolutionListModel.create({ ...req.body, industryMs: Number(idParam) });
    if (!result.created) {
      return response.success(res, "Record already exists, skipped (duplicate)", result);
    }

    await logAudit(req, {
      type: "ADD",
      lnk: "add_water_polution_list_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_water_polution_list",
    });

    return response.success(res, "Water pollution record created", result, 201);
  } catch (err) {
    return response.error(res, `Failed to create water pollution record: ${err.message}`);
  }
}

export async function updateWaterPolution(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await WaterPolutionListModel.getById(id);
    if (!existing) return response.error(res, "Water pollution record not found", 404);

    const updated = await WaterPolutionListModel.update(id, req.body);

    await logAudit(req, {
      type: "EDIT",
      lnk: "edit_water_polution_list_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_water_polution_list",
    });

    return response.success(res, "Water pollution record updated", updated);
  } catch (err) {
    return response.error(res, `Failed to update water pollution record: ${err.message}`);
  }
}

export async function removeWaterPolution(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await WaterPolutionListModel.remove(id);
    if (!existing) return response.error(res, "Water pollution record not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "water_polution_list_delete.php",
      panel: req.portal.toUpperCase(),
      module: "Delete_water_polution_list",
    });

    return response.success(res, "Water pollution record deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete water pollution record: ${err.message}`);
  }
}

// --- air_polution_list ---

export async function listAirPolution(req, res) {
  try {
    const idParam = req.query.industryMs ?? req.query.realEstateId ?? req.query.realestateId;
    const industryMs = idParam !== undefined && idParam !== "" ? Number(idParam) : 0;

    const rows = await AirPolutionListModel.listByIndustry(industryMs);
    return response.success(res, "Air pollution records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch air pollution records: ${err.message}`);
  }
}

export async function getAirPolutionTotals(req, res) {
  try {
    const idParam = req.query.industryMs ?? req.query.realEstateId ?? req.query.realestateId;
    const industryMs = idParam !== undefined && idParam !== "" ? Number(idParam) : 0;

    const totals = await AirPolutionListModel.getTotalsByIndustry(industryMs);
    return response.success(res, "Air pollution totals fetched", totals);
  } catch (err) {
    return response.error(res, `Failed to fetch air pollution totals: ${err.message}`);
  }
}

export async function createAirPolution(req, res) {
  try {
    const { industryMs, airDate } = req.body;
    if (!industryMs || !airDate) return response.error(res, "industryMs and airDate are required", 400);

    const result = await AirPolutionListModel.create({ ...req.body, industryMs: Number(industryMs) });
    if (!result.created) {
      return response.success(res, "Record already exists, skipped (duplicate)", result);
    }

    await logAudit(req, {
      type: "ADD",
      lnk: "add_air_polution_list_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_air_polution_list",
    });

    return response.success(res, "Air pollution record created", result, 201);
  } catch (err) {
    return response.error(res, `Failed to create air pollution record: ${err.message}`);
  }
}

// --- aqms_monitoring_aqi ---

export async function listAqmsMonitoringAqi(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);

    const rows = await AqmsMonitoringAqiModel.listByRealEstate(realEstateId);
    return response.success(res, "AQMS AQI history fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch AQMS AQI history: ${err.message}`);
  }
}

export async function createAqmsMonitoringAqi(req, res) {
  try {
    const { mainId, aqi, aqiDate, realEstateId } = req.body;
    if (!aqi || !aqiDate || !realEstateId) {
      return response.error(res, "aqi, aqiDate, and realEstateId are required", 400);
    }

    const result = await AqmsMonitoringAqiModel.create({
      mainId: Number(mainId) || 0,
      aqi: Number(aqi),
      aqiDate,
      realEstateId: Number(realEstateId),
    });

    if (!result.created) {
      return response.success(res, "Record already exists, skipped (duplicate)", result);
    }

    return response.success(res, "AQMS AQI record created", result, 201);
  } catch (err) {
    return response.error(res, `Failed to create AQMS AQI record: ${err.message}`);
  }
}

export async function getAirQualityReport(req, res) {
  try {
    const realEstateId = req.query.realEstateId !== undefined && req.query.realEstateId !== "" ? Number(req.query.realEstateId) : 0;
    const { from, to } = req.query;

    const data = await AqmsMonitoringModel.getAirQualityReport(realEstateId, from, to);
    return response.success(res, "Air quality report fetched successfully", data);
  } catch (err) {
    return response.error(res, `Failed to fetch air quality report: ${err.message}`);
  }
}

export async function getAirQualityExceedanceReport(req, res) {
  try {
    const realEstateId = req.query.realEstateId !== undefined && req.query.realEstateId !== "" ? Number(req.query.realEstateId) : 0;
    const { from, to } = req.query;

    const data = await AqmsMonitoringModel.getAirQualityExceedanceReport(realEstateId, from, to);
    return response.success(res, "Air quality exceedance report fetched successfully", data);
  } catch (err) {
    return response.error(res, `Failed to fetch air quality exceedance report: ${err.message}`);
  }
}
