import { and, between, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { stp, stpReading } from "../db/schema.js";

/**
 * stp: one config/status row per property for the Sewage Treatment Plant
 * device - same "delete existing config, reinsert fresh" + flag_x yes/no
 * pattern seen in waste_related, anms_detail, aqms_detail.
 */
export const StpModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${stp.id})` }).from(stp);
    return (Number(row?.maxId) || 0) + 1;
  },

  async getByRealEstate(realEstateId) {
    const rows = await db
      .select()
      .from(stp)
      .where(eq(stp.realEstateId, realEstateId))
      .orderBy(sql`${stp.id} DESC`);
    return rows[0] ?? null;
  },

  async getFlag(realEstateId) {
    const [row] = await db
      .select({ flagStp: stp.flagStp })
      .from(stp)
      .where(eq(stp.realEstateId, realEstateId))
      .limit(1);
    return row?.flagStp ?? null;
  },

  /**
   * Mirrors the legacy "DELETE existing row, then INSERT fresh" pattern
   * found in add_stp*.php across all 3 portals.
   */
  async upsert({
    capacityStp,
    warrantyValidity,
    mfgName,
    address,
    gst,
    contactPerson,
    mobile,
    email,
    pointsStp,
    remarksStp,
    flagStp,
    realEstateId,
    installDate,
  }) {
    await db.delete(stp).where(eq(stp.realEstateId, realEstateId));

    const id = await this.getNextId();
    await db.insert(stp).values({
      id,
      capacityStp: capacityStp ?? "",
      warrantyValidity: warrantyValidity ?? new Date(),
      mfgName: mfgName ?? "",
      address: address ?? "",
      gst: gst ?? "",
      contactPerson: contactPerson ?? "",
      mobile: mobile ?? "",
      email: email ?? "",
      pointsStp: pointsStp ?? 0,
      remarksStp: remarksStp ?? "",
      flagStp: flagStp ?? "no",
      realEstateId,
      installDate: installDate ?? new Date(),
    });

    return id;
  },
};

/**
 * stp_reading: per-date sensor readings (inlet/outlet quality params).
 * `id` is a genuine AUTO_INCREMENT column in the DB (unlike most other
 * tables in this codebase), so no manual max(id)+1 needed here.
 */
export const StpReadingModel = {
  async create({ inlet, outlet, bod, ph, tss, nitrogen, cod, feedal, coliform, readingDate, realEstateId }) {
    const [result] = await db.insert(stpReading).values({
      inlet,
      outlet,
      bod,
      ph,
      tss,
      nitrogen,
      cod,
      feedal,
      coliform,
      readingDate,
      realEstateId,
    });
    return result.insertId;
  },

  async getById(id, realEstateId) {
    const conditions = realEstateId
      ? and(eq(stpReading.id, id), eq(stpReading.realEstateId, realEstateId))
      : eq(stpReading.id, id);
    const [row] = await db
      .select()
      .from(stpReading)
      .where(conditions)
      .limit(1);
    return row ?? null;
  },

  async remove(id, realEstateId) {
    const existing = await this.getById(id, realEstateId);
    if (!existing) return null;

    const conditions = realEstateId
      ? and(eq(stpReading.id, id), eq(stpReading.realEstateId, realEstateId))
      : eq(stpReading.id, id);

    await db.delete(stpReading).where(conditions);
    return existing;
  },

  /**
   * select * from stp_reading where real_estate_id='$real_estate_id' and reading_date between '$dd1' and '$dd2'
   */
  async listByDateRange(realEstateId, fromDate, toDate) {
    return db
      .select()
      .from(stpReading)
      .where(
        and(eq(stpReading.realEstateId, realEstateId), between(stpReading.readingDate, fromDate, toDate))
      );
  },

  /**
   * select distinct(year(reading_date)) as dt from stp_reading
   * where real_estate_id='$real_estate_id' and reading_date between '$dd1' and '$dd2'
   * (used to populate a year-selector for the readings chart)
   */
  async listDistinctYears(realEstateId, fromDate, toDate) {
    const rows = await db
      .select({ year: sql`DISTINCT YEAR(${stpReading.readingDate})` })
      .from(stpReading)
      .where(
        and(eq(stpReading.realEstateId, realEstateId), between(stpReading.readingDate, fromDate, toDate))
      );
    return rows.map((r) => Number(r.year));
  },

  /**
   * select bod,ph,tss,nitrogen,cod,feedal,coliform from stp_reading
   * where YEAR(reading_date)='$year' and reading_date between '$dd1' and '$dd2'
   */
  async listMetricsByYear(year, fromDate, toDate, realEstateId) {
    return db
      .select({
        bod: stpReading.bod,
        ph: stpReading.ph,
        tss: stpReading.tss,
        nitrogen: stpReading.nitrogen,
        cod: stpReading.cod,
        feedal: stpReading.feedal,
        coliform: stpReading.coliform,
        readingDate: stpReading.readingDate,
      })
      .from(stpReading)
      .where(
        and(
          sql`YEAR(${stpReading.readingDate}) = ${year}`,
          between(stpReading.readingDate, fromDate, toDate),
          eq(stpReading.realEstateId, realEstateId)
        )
      );
  },
};
