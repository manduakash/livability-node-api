import { db } from "../db/index.js";
import { noiseDetails } from "../db/schema.js";

/**
 * Mirrors pcb/progress2.php / admin/noise_api_new.php:
 *
 *   foreach ($response_data->data as $user) {
 *     INSERT INTO noise_details (header, subheader, zone, date_api, value,
 *       date_for_noise, real_estate_id) VALUES (...)
 *   }
 */
export const NoiseDetailsModel = {
  async insertReading({ header, subheader, zone, dateApi, value, dateForNoise, realEstateId }) {
    await db.insert(noiseDetails).values({
      header: String(header ?? ""),
      subheader: String(subheader ?? ""),
      zone: String(zone ?? ""),
      dateApi: String(dateApi ?? ""),
      value: String(value ?? ""),
      dateForNoise: String(dateForNoise ?? ""),
      realEstateId,
    });
  },

  async syncFromApi(apiResponse, { realEstateId, dateForNoise }) {
    const rows = apiResponse?.data || [];

    for (const row of rows) {
      await this.insertReading({
        header: row.header,
        subheader: row.subheader,
        zone: row.zone,
        dateApi: row.date,
        value: row.value,
        dateForNoise,
        realEstateId,
      });
    }

    return { inserted: rows.length };
  },
};
