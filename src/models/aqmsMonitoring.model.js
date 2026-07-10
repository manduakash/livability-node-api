import { desc, eq, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { aqmsDetail, aqmsMonitoring, aqmsMonitoringMain, realEstateMaster } from "../db/schema.js";


/**
 * Mirrors admin/save_aqms_data_admin.php:
 *
 *   $time_air = date("H:i:s");
 *   points/remarks derived from AQI (vgood / good / poor)
 *   INSERT INTO aqms_monitoring_main (...)
 *   INSERT INTO aqms_monitoring (main_id, ...) VALUES (last_insert_id, ...)
 */
export const AqmsMonitoringModel = {
  /**
   * The legacy code only proceeds if the property's `aqms_detail.flag_aqms`
   * row says "yes" - returns { allowed, aqDetailsId }.
   */
  async getAqmsFlag(realEstateId) {
    const [row] = await db
      .select({ id: aqmsDetail.id, flagAqms: aqmsDetail.flagAqms })
      .from(aqmsDetail)
      .where(eq(aqmsDetail.realEstateId, realEstateId))
      .orderBy(desc(aqmsDetail.id))
      .limit(1);

    return {
      allowed: row?.flagAqms === "yes",
      aqDetailsId: row?.id ?? null,
    };
  },

  scoreFromAqi(aqi) {
    if (aqi > 0 && aqi <= 50) return { points: 10, remarks: "vgood" };
    if (aqi >= 51 && aqi <= 60) return { points: 5, remarks: "good" };
    return { points: 0, remarks: "poor" };
  },

  timeNowIST() {
    const now = new Date().toLocaleTimeString("en-GB", {
      timeZone: "Asia/Kolkata",
      hour12: false,
    });
    return now; // HH:MM:SS
  },

  /**
   * Full sync, mirroring the AQI branch of
   * admin/air_quality_moni_sta_admin.php + admin/save_aqms_data_admin.php.
   *
   * `apiResponse.data` is expected to be an array whose first element holds
   * the station + sensor stats (see distronix.service.js doc comment).
   */
  async syncFromApi(apiResponse, realEstateId) {
    const { allowed, aqDetailsId } = await this.getAqmsFlag(realEstateId);
    if (!allowed) {
      return { skipped: true, reason: "aqms_detail.flag_aqms is not 'yes' for this property" };
    }

    const res = apiResponse?.data?.[0];
    if (!res) {
      return { skipped: true, reason: "API response had no `data[0]` payload" };
    }

    const aqi = Number(res.AQI) || 0;
    const { points, remarks } = this.scoreFromAqi(aqi);

    const [mainResult] = await db.insert(aqmsMonitoringMain).values({
      aqDetailsId: aqDetailsId ?? realEstateId,
      promptPol: String(res.Prompt_Pol ?? ""),
      location: String(res.location ?? ""),
      district: String(res.district ?? ""),
      dateAqms: res.date,
      hour: Number(res.hour) || 0,
      aqi,
      pointsAqms: points,
      remarksAqms: remarks,
      realEstateId,
      timeAir: this.timeNowIST(),
    });

    const mainId = mainResult.insertId;

    await db.insert(aqmsMonitoring).values({
      mainId,
      extHumiAvg: num(res.ext_humi_avg),
      extHumiMax: num(res.ext_humi_max),
      extHumiMin: num(res.ext_humi_min),
      extTempAvg: num(res.ext_temp_avg),
      extTempMax: num(res.ext_temp_max),
      extTempMin: num(res.ext_temp_min),
      intHumiAvg: num(res.int_humi_avg),
      intHumiMax: num(res.int_humi_max),
      intHumiMin: num(res.int_humi_min),
      intTempAvg: num(res.int_temp_avg),
      intTempMax: num(res.int_temp_max),
      intTempMin: num(res.int_temp_min),
      lastOnline: String(res.last_online ?? ""),
      no2Avg: num(res.no2_avg),
      no2Max: num(res.no2_max),
      no2Min: num(res.no2_min),
      pm1Avg: num(res.pm1_avg),
      pm1Max: num(res.pm1_max),
      pm1Min: num(res.pm1_min),
      pm10Avg: num(res.pm10_avg),
      pm10Max: num(res.pm10_max),
      pm10Min: num(res.pm10_min),
      pm25Avg: num(res.pm25_avg),
      pm25Max: num(res.pm25_max),
      pm25Min: num(res.pm25_min),
      pmHumiAvg: num(res.pm_humi_avg),
      pmHumiMax: num(res.pm_humi_max),
      pmHumiMin: num(res.pm_humi_min),
      pmTempAvg: num(res.pm_temp_avg),
      pmTempMax: num(res.pm_temp_max),
      pmTempMin: num(res.pm_temp_min),
      so2Avg: num(res.so2_avg),
      so2Max: num(res.so2_max),
      realEstateId,
    });

    return { inserted: 1, mainId, aqi, points, remarks };
  },

  async getAirQualityReport(realEstateId, fromDate, toDate) {
    const conditions = [];

    if (Number(realEstateId) !== 0) {
      conditions.push(eq(aqmsMonitoringMain.realEstateId, Number(realEstateId)));
    }
    if (fromDate) {
      conditions.push(sql`${aqmsMonitoringMain.dateAqms} >= ${fromDate}`);
    }
    if (toDate) {
      conditions.push(sql`${aqmsMonitoringMain.dateAqms} <= ${toDate}`);
    }

    const rows = await db
      .select({
        id: aqmsMonitoring.id,
        realEstateId: aqmsMonitoringMain.realEstateId,
        realEstateName: realEstateMaster.realEstateName,
        dateAqms: aqmsMonitoringMain.dateAqms,
        timeAir: aqmsMonitoringMain.timeAir,
        aqi: aqmsMonitoringMain.aqi,
        pm10: aqmsMonitoring.pm10Avg,
        pm25: aqmsMonitoring.pm25Avg,
        sox: aqmsMonitoring.so2Avg,
        nox: aqmsMonitoring.no2Avg,
      })
      .from(aqmsMonitoring)
      .innerJoin(aqmsMonitoringMain, eq(aqmsMonitoring.mainId, aqmsMonitoringMain.id))
      .leftJoin(realEstateMaster, eq(aqmsMonitoringMain.realEstateId, realEstateMaster.id))
      .where(and(...conditions))
      .orderBy(desc(aqmsMonitoringMain.dateAqms), desc(aqmsMonitoringMain.timeAir));

    return rows.map((r, i) => ({
      slNo: i + 1,
      realEstateId: r.realEstateId,
      realEstateName: r.realEstateName,
      dateTime: `${r.dateAqms} ${r.timeAir}`,
      aqi: r.aqi,
      pm10: r.pm10,
      pm25: r.pm25,
      sox: r.sox,
      nox: r.nox,
    }));
  },
};

function num(v) {
  return Number(v) || 0;
}
