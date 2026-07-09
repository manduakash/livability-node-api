import { response } from "../utils/response.js";
import { WaterSensorModel } from "../models/waterSensor.model.js";

/**
 * GET /api/:portal/water-depth?realEstateId=1
 * GET /api/:portal/water-depth?realEstateId=0          → all properties
 * GET /api/:portal/water-depth?realEstateId=1&lastOnly=true  → most recent reading
 * GET /api/:portal/water-depth?realEstateId=1&from=2024-01-01&to=2024-06-30
 *
 * Columns returned: id | device | timestamp | waterdepth | realEstateId
 */
export async function listWaterDepth(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }

    const realEstateId = Number(req.query.realEstateId);
    const { from, to, lastOnly } = req.query;

    let rows;

    if (lastOnly === "true" || lastOnly === "1") {
      // "Show Last Data" mode
      rows = await WaterSensorModel.listLastByRealEstate(realEstateId);
    } else if (from && to) {
      // Date-range filter
      rows = await WaterSensorModel.listByDateRange(realEstateId, from, to);
    } else {
      // All records for the estate (or all estates if 0)
      rows = await WaterSensorModel.listByRealEstate(realEstateId);
    }

    return response.success(res, "Water depth / pollution records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch water depth records: ${err.message}`);
  }
}
