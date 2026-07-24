import { and, between, eq, sql, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { stp, stpReading, realEstateMaster } from "../db/schema.js";

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
    const conditions = realEstateId === 0 ? undefined : eq(stp.realEstateId, realEstateId);
    const rows = await db
      .select()
      .from(stp)
      .where(conditions)
      .orderBy(sql`${stp.id} DESC`);
    return rows[0] ?? null;
  },

  async getFlag(realEstateId) {
    const conditions = realEstateId === 0 ? undefined : eq(stp.realEstateId, realEstateId);
    const [row] = await db
      .select({ flagStp: stp.flagStp })
      .from(stp)
      .where(conditions)
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
  async reportByDateRange({ fromDate, toDate, realEstateId, offset, pageSize = 10 } = {}) {
    const conditions = [];

    if (fromDate && toDate) {
      conditions.push(between(stpReading.readingDate, fromDate, toDate));
    } else if (fromDate) {
      conditions.push(sql`${stpReading.readingDate} >= ${fromDate}`);
    } else if (toDate) {
      conditions.push(sql`${stpReading.readingDate} <= ${toDate}`);
    }

    if (realEstateId !== undefined && Number(realEstateId) !== 0) {
      conditions.push(eq(stpReading.realEstateId, Number(realEstateId)));
    }

    let query = db
      .select({
        id: stpReading.id,
        inlet: stpReading.inlet,
        outlet: stpReading.outlet,
        bod: stpReading.bod,
        ph: stpReading.ph,
        tss: stpReading.tss,
        nitrogen: stpReading.nitrogen,
        cod: stpReading.cod,
        feedal: stpReading.feedal,
        coliform: stpReading.coliform,
        readingDate: stpReading.readingDate,
        realEstateId: stpReading.realEstateId,
      })
      .from(stpReading);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(stpReading.readingDate);

    if (offset !== undefined) {
      query = query.limit(pageSize).offset(offset);
    }

    return query;
  },

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
    const conditions = realEstateId === 0
      ? between(stpReading.readingDate, fromDate, toDate)
      : and(eq(stpReading.realEstateId, realEstateId), between(stpReading.readingDate, fromDate, toDate));
    return db
      .select()
      .from(stpReading)
      .where(conditions);
  },

  /**
   * select distinct(year(reading_date)) as dt from stp_reading
   * where real_estate_id='$real_estate_id' and reading_date between '$dd1' and '$dd2'
   * (used to populate a year-selector for the readings chart)
   */
  async listDistinctYears(realEstateId, fromDate, toDate) {
    const conditions = realEstateId === 0
      ? between(stpReading.readingDate, fromDate, toDate)
      : and(eq(stpReading.realEstateId, realEstateId), between(stpReading.readingDate, fromDate, toDate));
    const rows = await db
      .select({ year: sql`DISTINCT YEAR(${stpReading.readingDate})` })
      .from(stpReading)
      .where(conditions);
    return rows.map((r) => Number(r.year));
  },

  /**
   * select bod,ph,tss,nitrogen,cod,feedal,coliform from stp_reading
   * where YEAR(reading_date)='$year' and reading_date between '$dd1' and '$dd2'
   */
  async listMetricsByYear(year, fromDate, toDate, realEstateId) {
    const conditions = realEstateId === 0
      ? and(
          sql`YEAR(${stpReading.readingDate}) = ${year}`,
          between(stpReading.readingDate, fromDate, toDate)
        )
      : and(
          sql`YEAR(${stpReading.readingDate}) = ${year}`,
          between(stpReading.readingDate, fromDate, toDate),
          eq(stpReading.realEstateId, realEstateId)
        );
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
      .where(conditions);
  },

  async getStpPoorQualityReport(realEstateId, fromDate, toDate) {
    const conditions = [];

    if (Number(realEstateId) !== 0) {
      conditions.push(eq(stpReading.realEstateId, Number(realEstateId)));
    }
    if (fromDate) {
      conditions.push(sql`${stpReading.readingDate} >= ${fromDate}`);
    }
    if (toDate) {
      conditions.push(sql`${stpReading.readingDate} <= ${toDate}`);
    }

    const rows = await db
      .select({
        id: stpReading.id,
        ph: stpReading.ph,
        bod: stpReading.bod,
        cod: stpReading.cod,
        tss: stpReading.tss,
        nitrogen: stpReading.nitrogen,
        coliform: stpReading.coliform,
        readingDate: stpReading.readingDate,
        realEstateId: stpReading.realEstateId,
        realEstateName: realEstateMaster.realEstateName,
      })
      .from(stpReading)
      .leftJoin(realEstateMaster, eq(stpReading.realEstateId, realEstateMaster.id))
      .where(and(...conditions))
      .orderBy(desc(stpReading.readingDate));

    const groups = {};

    for (const r of rows) {
      let year = 2026;
      if (r.readingDate) {
        const dateObj = new Date(r.readingDate);
        if (!isNaN(dateObj.getTime())) {
          year = dateObj.getFullYear();
        }
      }

      const key = `${r.realEstateId}_${year}`;
      if (!groups[key]) {
        groups[key] = {
          year,
          realEstateId: r.realEstateId,
          realEstateName: r.realEstateName,
          daysPoor: 0,
          poorParamsList: new Set(),
        };
      }

      const phVal = parseFloat(r.ph);
      const bodVal = parseFloat(r.bod);
      const codVal = parseFloat(r.cod);
      const tssVal = parseFloat(r.tss);
      const nitrogenVal = parseFloat(r.nitrogen);
      const coliformVal = parseFloat(r.coliform);

      const poorParams = [];
      if (!isNaN(phVal) && (phVal < 6.5 || phVal > 9.0)) poorParams.push("pH");
      if (!isNaN(bodVal) && bodVal > 10) poorParams.push("BOD");
      if (!isNaN(codVal) && codVal > 50) poorParams.push("COD");
      if (!isNaN(tssVal) && tssVal > 10) poorParams.push("TSS");
      if (!isNaN(nitrogenVal) && nitrogenVal > 10) poorParams.push("Nitrogen");
      if (!isNaN(coliformVal) && coliformVal > 230) poorParams.push("Fecal Coliform");

      if (poorParams.length > 0) {
        groups[key].daysPoor++;
        poorParams.forEach((p) => groups[key].poorParamsList.add(p));
      }
    }

    return Object.values(groups).map((g, i) => {
      const paramsJoined = g.poorParamsList.size > 0 
        ? Array.from(g.poorParamsList).join(", ") 
        : "None";
      return {
        slNo: i + 1,
        sl: i + 1,
        realEstateId: g.realEstateId,
        realEstateName: g.realEstateName,
        estate: g.realEstateName,
        year: g.year,
        daysPoor: g.daysPoor,
        params: paramsJoined,
        poorParams: paramsJoined,
      };
    });
  },
};
