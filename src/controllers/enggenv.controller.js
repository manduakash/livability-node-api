import { response } from "../utils/response.js";
import * as enggenvService from "../services/enggenv.service.js";
import { WaterSensorModel } from "../models/waterSensor.model.js";
import { SensorWaterModel } from "../models/sensorWater.model.js";

/**
 * GET /api/water-sensor/sync?realEstateId=1
 * Replaces: admin|pcb|real_estate/api_data_for_water_pollution(_api).php
 */
export async function syncWaterDepth(req, res) {
  try {
    const realEstateId = Number(req.query.realEstateId || req.query.real || 1);

    const apiResponse = await enggenvService.getWaterDepth();
    const result = await WaterSensorModel.syncFromApi(apiResponse, realEstateId);

    return response.success(res, "Water depth sensor data synced", result);
  } catch (err) {
    return response.error(res, `Failed to sync water depth data: ${err.message}`);
  }
}

/**
 * GET /api/water-sensor/hourly
 * Replaces: api_for_water.php, test_waterapi.php, test_waterapi1.php
 */
export async function getWaterDepthHourly(req, res) {
  try {
    const apiResponse = await enggenvService.getWaterDepthHourly();

    return response.success(res, "Hourly water depth data fetched", {
      device: apiResponse?.device,
      timestamp: apiResponse?.data?.timestamp,
      waterDepth: apiResponse?.data?.WaterDepth,
    });
  } catch (err) {
    return response.error(res, `Failed to fetch hourly water depth data: ${err.message}`);
  }
}

/**
 * GET /api/aaq/sync?realEstateId=1
 * Replaces: admin|pcb|real_estate/api_new(_admin|_pcb).php
 */
export async function syncAaqStations(req, res) {
  try {
    const realEstateId = Number(req.query.realEstateId || req.query.real || 1);

    const apiResponse = await enggenvService.getAaqFetchAll();
    const result = await SensorWaterModel.syncFirstTwo(apiResponse, realEstateId);

    return response.success(res, "AAQ station data synced", result);
  } catch (err) {
    return response.error(res, `Failed to sync AAQ station data: ${err.message}`);
  }
}
