import { db } from "../db/index.js";
import { sensorWater } from "../db/schema.js";
import { nowIST } from "../utils/dateTime.js";

/**
 * Mirrors the legacy loop in admin/api_new(_admin).php, pcb/api_new_pcb.php,
 * real_estate/api_new.php:
 *
 *   for ($i = 0; $i < 2; $i++) {
 *     INSERT INTO sensor_water (site, device_id, place, lat, lon, ph, tds,
 *       temp, ts_server, cod, bod, tss, curdttime, real_estate_id) VALUES (...)
 *   }
 *
 * The legacy code always read indices 0 and 1 from the AAQ `fetchAll`
 * response - we keep that "first two stations" behaviour by default but
 * also expose a generic insert for any station entry.
 */
export const SensorWaterModel = {
  async insertStationReading(station, realEstateId) {
    await db.insert(sensorWater).values({
      site: String(station?.site ?? ""),
      deviceId: String(station?.device_id ?? ""),
      place: String(station?.location?.place ?? ""),
      lat: String(station?.location?.lat ?? ""),
      lon: String(station?.location?.lon ?? ""),
      ph: String(station?.data?.ph ?? ""),
      tds: String(station?.data?.tds ?? ""),
      temp: String(station?.data?.temp ?? ""),
      tsServer: String(station?.data?.ts_server ?? ""),
      cod: String(station?.data?.cod ?? ""),
      bod: String(station?.data?.bod ?? ""),
      tss: String(station?.data?.tss ?? ""),
      curdttime: nowIST(),
      realEstateId,
    });
  },

  /**
   * Replays the original "first two entries" sync behaviour against the
   * full `fetchAll` response array.
   */
  async syncFirstTwo(apiResponse, realEstateId) {
    const stations = Array.isArray(apiResponse) ? apiResponse.slice(0, 2) : [];
    for (const station of stations) {
      await this.insertStationReading(station, realEstateId);
    }
    return { inserted: stations.length };
  },
};
