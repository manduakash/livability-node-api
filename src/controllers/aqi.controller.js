import { response } from "../utils/response.js";
import * as distronixService from "../services/distronix.service.js";
import { AqmsMonitoringModel } from "../models/aqmsMonitoring.model.js";
import { getPropertyByKey, properties } from "../config/properties.js";

/**
 * GET /api/aqi/:propertyKey/sync
 * Replaces the AQI branches in admin/air_quality_moni_sta_admin.php +
 * admin/save_aqms_data_admin.php for a single property.
 */
export async function syncAqi(req, res) {
  try {
    const property = getPropertyByKey(req.params.propertyKey);

    if (!property) {
      return response.error(res, `Unknown property "${req.params.propertyKey}"`, 404);
    }
    if (!property.aqi) {
      return response.error(
        res,
        `Property "${property.key}" has no AQI endpoint configured`,
        400
      );
    }

    const apiResponse = await distronixService.getLatestData(
      property.aqi.url,
      property.aqi.token
    );
    const result = await AqmsMonitoringModel.syncFromApi(apiResponse, property.realEstateId);

    return response.success(res, `AQI data synced for ${property.name}`, result);
  } catch (err) {
    return response.error(res, `Failed to sync AQI data: ${err.message}`);
  }
}

/**
 * GET /api/aqi/sync-all
 * Loops every configured property, mirroring the "if (tt==1) ... else if (tt==2) ..."
 * ladder in admin/air_quality_moni_sta_admin.php.
 */
export async function syncAllAqi(req, res) {
  const results = [];

  for (const property of properties) {
    if (!property.aqi) continue;

    try {
      const apiResponse = await distronixService.getLatestData(
        property.aqi.url,
        property.aqi.token
      );
      const result = await AqmsMonitoringModel.syncFromApi(apiResponse, property.realEstateId);
      results.push({ property: property.key, ...result });
    } catch (err) {
      results.push({ property: property.key, error: err.message });
    }
  }

  return response.success(res, "AQI data sync completed", results);
}
