import { response } from "../utils/response.js";
import * as wbpcbService from "../services/wbpcb.service.js";
import { WbpcbModel } from "../models/aqiForPcb.model.js";

/**
 * GET /api/wbpcb/sync?stationId=01116&realEstateId=1
 * Replaces: pcb/aqms_api.php
 */
export async function syncStationData(req, res) {
  try {
    const stationId = req.query.stationId || undefined; // falls back to WBPCB_DEFAULT_STATION_ID
    const realEstateId = Number(req.query.realEstateId || req.query.id || 1);

    const apiResponse = await wbpcbService.getStationDetails(stationId);
    const result = await WbpcbModel.syncFromApi(apiResponse, realEstateId);

    return response.success(res, "WBPCB station data synced", result);
  } catch (err) {
    return response.error(res, `Failed to sync WBPCB station data: ${err.message}`);
  }
}
