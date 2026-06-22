import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { aqiForPcb, dateWiseAqiData } from "../db/schema.js";

/**
 * NOTE on table mapping
 * ----------------------
 * The original pcb/aqms_api.php inserted WBPCB station data into
 * `aqms_monitoring` / `aqms_monitoring_aqi` using a column layout
 * (minval, avgval, maxval, pollutant, prompol, status, upddate, stnname,
 * stncode, real_estate_id) that no longer matches those tables in the
 * current dump - `aqms_monitoring` / `aqms_monitoring_main` are now shaped
 * for the Distronix AQI feed instead (see aqmsMonitoring.model.js).
 *
 * The current dump's `aqi_for_pcb` (pollutants, concentration, sub_index,
 * check_val, real_estate_id, upddate) and `date_wise_aqi_data`
 * (real_estate_id, aqi, pollutants, upddate) line up far better with the
 * WBPCB payload, so this migrated version writes there instead. Adjust the
 * field mapping below if you'd rather keep the old layout.
 */
export const WbpcbModel = {
  /**
   * One row per pollutant entry in `response.data`:
   *   { pollutant, minval, avgval, maxval }
   */
  async insertPollutantReadings(stationData, realEstateId) {
    const pollutants = stationData?.data || [];
    let inserted = 0;

    for (const p of pollutants) {
      await db.insert(aqiForPcb).values({
        pollutants: String(p.pollutant ?? ""),
        concentration: Number(p.avgval) || 0,
        subIndex: Number(p.maxval) || 0,
        checkVal: 1,
        realEstateId,
      });
      inserted++;
    }

    return inserted;
  },

  /**
   * `response.pastaqi` is an array of `{ aqi, date }`. We dedupe on
   * (real_estate_id, aqi, pollutants) the same way the legacy code deduped
   * on (real_estate_id, aqi, aqi_date).
   */
  async syncPastAqi(stationData, realEstateId) {
    const pastAqi = (stationData?.pastaqi || []).slice(0, 9); // legacy: array_slice($user_data, 0, 9)
    const prompol = String(stationData?.prompol ?? "");

    let inserted = 0;
    for (const entry of pastAqi) {
      const aqi = Number(entry.aqi) || 0;

      const existing = await db
        .select({ id: dateWiseAqiData.id })
        .from(dateWiseAqiData)
        .where(
          and(
            eq(dateWiseAqiData.realEstateId, realEstateId),
            eq(dateWiseAqiData.aqi, aqi),
            eq(dateWiseAqiData.pollutants, prompol)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(dateWiseAqiData).values({
          realEstateId,
          aqi,
          pollutants: prompol,
        });
        inserted++;
      }
    }

    return inserted;
  },

  /**
   * Full sync, mirroring pcb/aqms_api.php end-to-end.
   */
  async syncFromApi(stationData, realEstateId) {
    const pollutantRows = await this.insertPollutantReadings(stationData, realEstateId);
    const aqiRows = await this.syncPastAqi(stationData, realEstateId);

    return {
      station: {
        stnname: stationData?.stnname,
        stncode: stationData?.stncode,
        status: stationData?.status,
        upddate: stationData?.upddate,
        promptPollutant: stationData?.prompol,
      },
      pollutantRowsInserted: pollutantRows,
      aqiHistoryRowsInserted: aqiRows,
    };
  },
};
