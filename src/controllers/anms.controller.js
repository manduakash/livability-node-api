import { response } from "../utils/response.js";
import * as distronixService from "../services/distronix.service.js";
import { NoiseDetailsAllModel } from "../models/noiseDetailsAll.model.js";
import { getPropertyByKey, properties } from "../config/properties.js";

/**
 * GET /api/anms/:propertyKey/sync
 * Replaces the ANMS branches in admin/real_anms_admin.php +
 * admin/save_anms_data_admin.php for a single property.
 */
export async function syncAnms(req, res) {
  try {
    const property = getPropertyByKey(req.params.propertyKey);

    if (!property) {
      return response.error(res, `Unknown property "${req.params.propertyKey}"`, 404);
    }
    if (!property.anms) {
      return response.error(
        res,
        `Property "${property.key}" has no ANMS (noise) endpoint configured`,
        400
      );
    }

    const apiResponse = await distronixService.getLatestData(
      property.anms.url,
      property.anms.token
    );
    const result = await NoiseDetailsAllModel.syncFromApi(apiResponse, property.realEstateId);

    return response.success(res, `ANMS noise data synced for ${property.name}`, result);
  } catch (err) {
    return response.error(res, `Failed to sync ANMS data: ${err.message}`);
  }
}

/**
 * GET /api/anms/sync-all
 * Loops every configured property, mirroring the "if (tt==1) ... else if (tt==2) ..."
 * ladder in admin/real_anms_admin.php.
 */
export async function syncAllAnms(req, res) {
  const results = [];

  for (const property of properties) {
    if (!property.anms) continue;

    try {
      const apiResponse = await distronixService.getLatestData(
        property.anms.url,
        property.anms.token
      );
      const result = await NoiseDetailsAllModel.syncFromApi(apiResponse, property.realEstateId);
      results.push({ property: property.key, ...result });
    } catch (err) {
      results.push({ property: property.key, error: err.message });
    }
  }

  return response.success(res, "ANMS noise data sync completed", results);
}

export async function getNoiseQualityReport(req, res) {
  try {
    const realEstateId = req.query.realEstateId !== undefined && req.query.realEstateId !== "" ? Number(req.query.realEstateId) : 0;
    const { from, to } = req.query;

    const data = await NoiseDetailsAllModel.getNoiseQualityReport(realEstateId, from, to);
    return response.success(res, "Noise quality report fetched successfully", data);
  } catch (err) {
    return response.error(res, `Failed to fetch noise quality report: ${err.message}`);
  }
}

export async function getNoiseQualityExceedanceReport(req, res) {
  try {
    const realEstateId = req.query.realEstateId !== undefined && req.query.realEstateId !== "" ? Number(req.query.realEstateId) : 0;
    const { from, to } = req.query;

    const data = await NoiseDetailsAllModel.getNoiseQualityExceedanceReport(realEstateId, from, to);
    return response.success(res, "Noise quality exceedance report fetched successfully", data);
  } catch (err) {
    return response.error(res, `Failed to fetch noise quality exceedance report: ${err.message}`);
  }
}
