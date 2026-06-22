import { response } from "../utils/response.js";
import * as paribeshService from "../services/paribesh.service.js";
import { NoiseDetailsModel } from "../models/noiseDetails.model.js";

/**
 * GET /api/noise/paribesh/sync?name=New Market&realEstateId=1&date=2026-06-15
 * Replaces: admin|real_estate/noise_api_new.php, pcb/progress2.php
 */
export async function syncParibeshNoise(req, res) {
  try {
    const name = req.query.name || "New Market";
    const realEstateId = Number(req.query.realEstateId || req.query.id || 1);
    const dateForNoise = req.query.date || req.query.id1 || "";

    const apiResponse = await paribeshService.getNoiseDataByName(name);
    const result = await NoiseDetailsModel.syncFromApi(apiResponse, {
      realEstateId,
      dateForNoise,
    });

    return response.success(res, "Paribesh noise data synced", result);
  } catch (err) {
    return response.error(res, `Failed to sync Paribesh noise data: ${err.message}`);
  }
}
