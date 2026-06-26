import { and, between, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { portableWaterQuality, waterQuality } from "../db/schema.js";

/**
 * portable_water_quality: one config/status row per property tracking
 * drinking-water sourcing (portable supply, outside source, groundwater
 * received) and a "water sensor installed" flag with derived points -
 * same delete+reinsert pattern as stp/solar_energy/etc. Several older
 * legacy INSERT variants were found with fewer columns (no flag_drinking/
 * water_sensor/install_date) - this model targets the current schema's
 * full column set.
 */
export const PortableWaterQualityModel = {
  async getNextId() {
    const [row] = await db
      .select({ maxId: sql`MAX(${portableWaterQuality.id})` })
      .from(portableWaterQuality);
    return (Number(row?.maxId) || 0) + 1;
  },

  async getByRealEstate(realEstateId) {
    const rows = await db
      .select()
      .from(portableWaterQuality)
      .where(eq(portableWaterQuality.realEstateId, realEstateId))
      .orderBy(desc(portableWaterQuality.id));
    return rows[0] ?? null;
  },

  async getWaterSensorFlag(realEstateId) {
    const [row] = await db
      .select({ waterSensor: portableWaterQuality.waterSensor })
      .from(portableWaterQuality)
      .where(eq(portableWaterQuality.realEstateId, realEstateId))
      .limit(1);
    return row?.waterSensor ?? null;
  },

  async upsert({
    portable,
    fromOutside,
    received,
    waterQuality: waterQualityValue,
    dt,
    flagDrinking,
    waterSensor,
    pointsOfSensor,
    realEstateId,
    installDate,
  }) {
    await db.delete(portableWaterQuality).where(eq(portableWaterQuality.realEstateId, realEstateId));

    const id = await this.getNextId();
    await db.insert(portableWaterQuality).values({
      id,
      portable: portable ?? "",
      fromOutside: fromOutside ?? "",
      received: received ?? "",
      waterQuality: Number(waterQualityValue) || 0,
      dt: dt ?? new Date(),
      flagDrinking: flagDrinking ?? "no",
      waterSensor: waterSensor ?? "",
      pointsOfSensor: pointsOfSensor ?? 0,
      realEstateId,
      installDate: installDate ?? new Date(),
    });

    return id;
  },
};

/**
 * water_quality: per-date sensor readings (tss/tds/temp/ph/bod/cod). `id`
 * is a genuine AUTO_INCREMENT column - same shape/usage as stp_reading.
 */
export const WaterQualityModel = {
  async create({ tss, tds, temp, ph, bod, cod, readingDate, realEstateId }) {
    const [result] = await db
      .insert(waterQuality)
      .values({ tss, tds, temp, ph, bod, cod, readingDate, realEstateId });
    return result.insertId;
  },

  async getById(id, realEstateId) {
    const conditions = realEstateId
      ? and(eq(waterQuality.id, id), eq(waterQuality.realEstateId, realEstateId))
      : eq(waterQuality.id, id);
    const [row] = await db.select().from(waterQuality).where(conditions).limit(1);
    return row ?? null;
  },

  async remove(id) {
    const existing = await this.getById(id);
    if (!existing) return null;
    await db.delete(waterQuality).where(eq(waterQuality.id, id));
    return existing;
  },

  /** select * from water_quality where real_estate_id='$id' order by id desc limit $ss */
  async listRecent(realEstateId, limit = 10) {
    return db
      .select()
      .from(waterQuality)
      .where(eq(waterQuality.realEstateId, realEstateId))
      .orderBy(desc(waterQuality.id))
      .limit(limit);
  },

  async listByDate(realEstateId, date) {
    return db
      .select()
      .from(waterQuality)
      .where(and(eq(waterQuality.realEstateId, realEstateId), eq(waterQuality.readingDate, date)));
  },

  async listDistinctYears(realEstateId, fromDate, toDate) {
    const rows = await db
      .select({ year: sql`DISTINCT YEAR(${waterQuality.readingDate})` })
      .from(waterQuality)
      .where(
        and(eq(waterQuality.realEstateId, realEstateId), between(waterQuality.readingDate, fromDate, toDate))
      );
    return rows.map((r) => Number(r.year));
  },

  /** select tss,tds,temp,ph,bod,cod from water_quality where YEAR(reading_date)='$year' and reading_date between ... */
  async listMetricsByYear(year, fromDate, toDate) {
    return db
      .select({
        tss: waterQuality.tss,
        tds: waterQuality.tds,
        temp: waterQuality.temp,
        ph: waterQuality.ph,
        bod: waterQuality.bod,
        cod: waterQuality.cod,
      })
      .from(waterQuality)
      .where(
        and(sql`YEAR(${waterQuality.readingDate}) = ${year}`, between(waterQuality.readingDate, fromDate, toDate))
      );
  },

  /** select reading_date from water_quality where YEAR(reading_date)=... and reading_date between ... and real_estate_id=... */
  async listDatesByYear(realEstateId, year, fromDate, toDate) {
    const rows = await db
      .select({ readingDate: waterQuality.readingDate })
      .from(waterQuality)
      .where(
        and(
          eq(waterQuality.realEstateId, realEstateId),
          sql`YEAR(${waterQuality.readingDate}) = ${year}`,
          between(waterQuality.readingDate, fromDate, toDate)
        )
      );
    return rows.map((r) => r.readingDate);
  },

  /** SELECT * from water_quality where real_estate_id='$id' group by reading_date order by reading_date DESC limit 10 */
  async listRecentForChart(realEstateId, limit = 10) {
    return db
      .select()
      .from(waterQuality)
      .where(eq(waterQuality.realEstateId, realEstateId))
      .groupBy(waterQuality.readingDate)
      .orderBy(desc(waterQuality.readingDate))
      .limit(limit);
  },
};
