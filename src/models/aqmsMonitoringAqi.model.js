import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { aqmsMonitoringAqi } from "../db/schema.js";

/**
 * aqms_monitoring_aqi: AQI history records, deduped on
 * (real_estate_id, aqi, aqi_date) before insert, manual max(id)+1 - same
 * pattern as the dateWiseAqiData table built earlier for the WBPCB sync.
 * This table additionally carries a `main_id` FK into
 * aqms_monitoring_main.
 */
export const AqmsMonitoringAqiModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${aqmsMonitoringAqi.id})` }).from(aqmsMonitoringAqi);
    return (Number(row?.maxId) || 0) + 1;
  },

  async existsDuplicate(realEstateId, aqi, aqiDate) {
    const rows = await db
      .select({ id: aqmsMonitoringAqi.id })
      .from(aqmsMonitoringAqi)
      .where(
        and(
          eq(aqmsMonitoringAqi.realEstateId, realEstateId),
          eq(aqmsMonitoringAqi.aqi, aqi),
          eq(aqmsMonitoringAqi.aqiDate, aqiDate)
        )
      )
      .limit(1);
    return rows.length > 0;
  },

  async create({ mainId, aqi, aqiDate, realEstateId }) {
    const duplicate = await this.existsDuplicate(realEstateId, aqi, aqiDate);
    if (duplicate) return { created: false, id: null };

    const id = await this.getNextId();
    await db.insert(aqmsMonitoringAqi).values({ id, mainId, aqi, aqiDate, realEstateId });
    return { created: true, id };
  },

  async listByRealEstate(realEstateId) {
    if (realEstateId === 0) {
      return db.select().from(aqmsMonitoringAqi);
    }
    return db.select().from(aqmsMonitoringAqi).where(eq(aqmsMonitoringAqi.realEstateId, realEstateId));
  },
};
