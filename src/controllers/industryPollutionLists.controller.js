import { response } from "../utils/response.js";
import {
  WaterConsumptionListModel,
  WaterPolutionListModel,
  AirPolutionListModel,
} from "../models/industryPollutionLists.model.js";
import { AqmsMonitoringAqiModel } from "../models/aqmsMonitoringAqi.model.js";
import { logAudit } from "../utils/auditLog.js";

// --- water_consumption_list ---

export async function listWaterConsumption(req, res) {
  try {
    const { industryMs } = req.query;
    if (!industryMs) return response.error(res, "industryMs is required", 400);

    const rows = await WaterConsumptionListModel.listByIndustry(industryMs);
    return response.success(res, "Water consumption records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch water consumption records: ${err.message}`);
  }
}

export async function getWaterConsumptionTotals(req, res) {
  try {
    const { industryMs } = req.query;
    if (!industryMs) return response.error(res, "industryMs is required", 400);

    const totals = await WaterConsumptionListModel.getTotalsByIndustry(industryMs);
    return response.success(res, "Water consumption totals fetched", totals);
  } catch (err) {
    return response.error(res, `Failed to fetch water consumption totals: ${err.message}`);
  }
}

export async function createWaterConsumption(req, res) {
  try {
    const { industryMs, airDate } = req.body;
    if (!industryMs || !airDate) return response.error(res, "industryMs and airDate are required", 400);

    const result = await WaterConsumptionListModel.create(req.body);
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
    const { industryMs } = req.query;
    if (!industryMs) return response.error(res, "industryMs is required", 400);

    const rows = await WaterPolutionListModel.listByIndustry(industryMs);
    return response.success(res, "Water pollution records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch water pollution records: ${err.message}`);
  }
}

export async function getWaterPolutionTotals(req, res) {
  try {
    const { industryMs } = req.query;
    if (!industryMs) return response.error(res, "industryMs is required", 400);

    const totals = await WaterPolutionListModel.getTotalsByIndustry(industryMs);
    return response.success(res, "Water pollution totals fetched", totals);
  } catch (err) {
    return response.error(res, `Failed to fetch water pollution totals: ${err.message}`);
  }
}

export async function createWaterPolution(req, res) {
  try {
    const { industryMs, airDate } = req.body;
    if (!industryMs || !airDate) return response.error(res, "industryMs and airDate are required", 400);

    const result = await WaterPolutionListModel.create(req.body);
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

// --- air_polution_list ---

export async function listAirPolution(req, res) {
  try {
    const { industryMs } = req.query;
    if (!industryMs) return response.error(res, "industryMs is required", 400);

    const rows = await AirPolutionListModel.listByIndustry(Number(industryMs));
    return response.success(res, "Air pollution records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch air pollution records: ${err.message}`);
  }
}

export async function getAirPolutionTotals(req, res) {
  try {
    const { industryMs } = req.query;
    if (!industryMs) return response.error(res, "industryMs is required", 400);

    const totals = await AirPolutionListModel.getTotalsByIndustry(Number(industryMs));
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
