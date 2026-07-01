import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { livability, livabilityIndexMaster, tempLivability, realEstateMaster } from "../db/schema.js";

/**
 * livability_index_master: the fixed list of scoring criteria (e.g.
 * "AQMS Installed", "Drinking Water Quality within Range"), each worth a
 * number of points. No INSERT exists anywhere in the legacy queries -
 * this is pre-seeded reference data, only ever edited (name/points) or
 * read. `id` has no AUTO_INCREMENT in the dump.
 */
export const LivabilityIndexMasterModel = {
  async listAll() {
    return db.select().from(livabilityIndexMaster);
  },

  async getById(id) {
    const [row] = await db
      .select()
      .from(livabilityIndexMaster)
      .where(eq(livabilityIndexMaster.id, id))
      .limit(1);
    return row ?? null;
  },

  /** select sum(points) as points from livability_index_master - the maximum possible score */
  async getMaxPossiblePoints() {
    const [row] = await db
      .select({ total: sql`SUM(${livabilityIndexMaster.points})` })
      .from(livabilityIndexMaster);
    return Number(row?.total) || 0;
  },

  /** UPDATE livability_index_master set name=...,points=... where id=... */
  async update(id, { name, points }) {
    const existing = await this.getById(id);
    if (!existing) return null;

    await db.update(livabilityIndexMaster).set({ name, points }).where(eq(livabilityIndexMaster.id, id));
    return { id, name, points };
  },
};

/**
 * livability: the per-property, per-date compliance assessment log - one
 * row per (real_estate_id, livability_id, date1) recording whether that
 * criterion was met ('yes'/'no') plus remarks. `id` is a genuine
 * AUTO_INCREMENT column despite the legacy code's manual max(id)+1
 * pattern (same situation found earlier in `green`/`stp_reading`).
 */
export const LivabilityModel = {
  /** select max(date1) as date1 from livability where real_estate_id=... - the latest assessment date */
  async getLatestAssessmentDate(realEstateId) {
    const [row] = await db
      .select({ date1: sql`MAX(${livability.date1})` })
      .from(livability)
      .where(eq(livability.realEstateId, realEstateId));
    return row?.date1 ?? null;
  },

  /**
   * select distinct(livability_id) as livability_id,status,remarks,id
   * from livability where date1=... and real_estate_id=... order by remarks desc
   *
   * The full criteria-status snapshot for one property on its latest (or
   * a specific) assessment date.
   */
  async getAssessmentForDate(realEstateId, date1) {
    return db
      .select({
        id: livability.id,
        livabilityId: livability.livabilityId,
        status: livability.status,
        remarks: livability.remarks,
      })
      .from(livability)
      .where(and(eq(livability.realEstateId, realEstateId), eq(livability.date1, date1)))
      .orderBy(desc(livability.remarks));
  },

  /**
   * Convenience: fetches the latest assessment date for a property, then
   * its full criteria snapshot for that date, in one call.
   */
  async getLatestAssessment(realEstateId) {
    const latestDate = await this.getLatestAssessmentDate(realEstateId);
    if (!latestDate) return { date1: null, items: [] };

    const items = await this.getAssessmentForDate(realEstateId, latestDate);
    return { date1: latestDate, items };
  },

  /**
   * select distinct(livability_id) ... where date1=... and real_estate_id=...
   * and livability_id not in (...) - finds which criteria are still
   * missing an assessment row for this date (so the form can show blank
   * entries for them).
   */
  async getUnassessedCriteriaIds(realEstateId, date1, assessedIds) {
    if (!assessedIds || assessedIds.length === 0) {
      const all = await db.select({ id: livabilityIndexMaster.id }).from(livabilityIndexMaster);
      return all.map((r) => r.id);
    }

    const rows = await db
      .select({ livabilityId: livability.livabilityId })
      .from(livability)
      .where(
        and(
          eq(livability.realEstateId, realEstateId),
          eq(livability.date1, date1),
          notInArray(livability.livabilityId, assessedIds)
        )
      );
    return rows.map((r) => r.livabilityId);
  },

  /** SELECT status from livability where real_estate_id=... and livability_id=... and date1=... */
  async getStatusForCriterion(realEstateId, livabilityId, date1) {
    const [row] = await db
      .select({ status: livability.status })
      .from(livability)
      .where(
        and(
          eq(livability.realEstateId, realEstateId),
          eq(livability.livabilityId, livabilityId),
          eq(livability.date1, date1)
        )
      )
      .limit(1);
    return row?.status ?? null;
  },

  /** SELECT status FROM livability where real_estate_id=... and livability_id=... order by date1 DESC - latest status regardless of date */
  async getLatestStatusForCriterion(realEstateId, livabilityId) {
    const [row] = await db
      .select({ status: livability.status })
      .from(livability)
      .where(and(eq(livability.realEstateId, realEstateId), eq(livability.livabilityId, livabilityId)))
      .orderBy(desc(livability.date1))
      .limit(1);
    return row?.status ?? null;
  },

  /** SELECT date1,status,remarks from livability where real_estate_id=... and livability_id=... order by date1 DESC - full history for one criterion */
  async getHistoryForCriterion(realEstateId, livabilityId) {
    return db
      .select({ date1: livability.date1, status: livability.status, remarks: livability.remarks })
      .from(livability)
      .where(and(eq(livability.realEstateId, realEstateId), eq(livability.livabilityId, livabilityId)))
      .orderBy(desc(livability.date1));
  },

  /** SELECT date1 from livability where real_estate_id=... order by date1 DESC - list of assessment dates for a property */
  async listAssessmentDates(realEstateId) {
    const rows = await db
      .select({ date1: livability.date1 })
      .from(livability)
      .where(eq(livability.realEstateId, realEstateId))
      .orderBy(desc(livability.date1));
    return [...new Set(rows.map((r) => r.date1))];
  },

  /**
   * Records one criterion's status for a property on a given date.
   * Mirrors the legacy "insert if not present, otherwise update status +
   * remarks" pattern (UPDATE livability SET status=...,remarks=... where
   * livability_id=... and real_estate_id=... and date1=...).
   */
  async setStatus({ realEstateId, livabilityId, date1, status, remarks }) {
    const existingStatus = await this.getStatusForCriterion(realEstateId, livabilityId, date1);

    if (existingStatus !== null) {
      await db
        .update(livability)
        .set({ status, remarks })
        .where(
          and(
            eq(livability.realEstateId, realEstateId),
            eq(livability.livabilityId, livabilityId),
            eq(livability.date1, date1)
          )
        );
      return { updated: true };
    }

    const [result] = await db
      .insert(livability)
      .values({ date1, realEstateId, livabilityId, status, remarks });
    return { updated: false, id: result.insertId };
  },

  /**
   * Saves a full assessment (every criterion's status) for one property
   * on one date in a single call - mirrors the legacy form that submits
   * all criteria at once.
   */
  async saveAssessment(realEstateId, date1, items) {
    const results = [];
    for (const item of items) {
      const result = await this.setStatus({
        realEstateId,
        livabilityId: item.livabilityId,
        date1,
        status: item.status,
        remarks: item.remarks ?? "",
      });
      results.push(result);
    }
    return results;
  },

  /**
   * Computes a property's compliance percentage for its latest
   * assessment: (sum of points for criteria marked 'yes') /
   * (sum of all criteria points) * 100. Used to populate
   * temp_livability.per_of_livability.
   */
  async computeCompliancePercentage(realEstateId) {
    const { date1, items } = await this.getLatestAssessment(realEstateId);
    if (!date1 || items.length === 0) return 0;

    const yesIds = items.filter((i) => i.status === "yes").map((i) => i.livabilityId);
    if (yesIds.length === 0) return 0;

    const [earned] = await db
      .select({ total: sql`SUM(${livabilityIndexMaster.points})` })
      .from(livabilityIndexMaster)
      .where(inArray(livabilityIndexMaster.id, yesIds));

    const maxPoints = await LivabilityIndexMasterModel.getMaxPossiblePoints();
    if (maxPoints === 0) return 0;

    return Math.round(((Number(earned?.total) || 0) / maxPoints) * 100);
  },

  /**
   * select count(l.livability_id) ... where li.name=... and l.status='yes'
   * group by l.real_estate_id - count of properties currently compliant
   * with a specific named criterion (e.g. "Drinking Water Quality within
   * Range").
   */
  async countCompliantPropertiesByCriterionName(criterionName) {
    const rows = await db
      .select({ realEstateId: livability.realEstateId, count: sql`COUNT(${livability.livabilityId})` })
      .from(livability)
      .innerJoin(livabilityIndexMaster, eq(livability.livabilityId, livabilityIndexMaster.id))
      .where(and(eq(livabilityIndexMaster.name, criterionName), eq(livability.status, "yes")))
      .groupBy(livability.realEstateId);
    return rows;
  },
};

/**
 * temp_livability: a leaderboard cache - one row per property storing its
 * precomputed compliance percentage, used for "top 10 best/worst
 * performing properties" rankings without recomputing on every request.
 */
export const TempLivabilityModel = {
  async getByRealEstate(realEstateId) {
    const [row] = await db
      .select()
      .from(tempLivability)
      .where(eq(tempLivability.realEstateId, realEstateId))
      .limit(1);
    return row ?? null;
  },

  /**
   * Mirrors the legacy refresh pattern: recompute the percentage, then
   * replace any existing cache row for this property.
   */
  async refresh(realEstateId) {
    const percentage = await LivabilityModel.computeCompliancePercentage(realEstateId);

    await db.delete(tempLivability).where(eq(tempLivability.realEstateId, realEstateId));
    const [result] = await db
      .insert(tempLivability)
      .values({ realEstateId, perOfLivability: percentage });

    return { id: result.insertId, realEstateId, perOfLivability: percentage };
  },

  /** select * from temp_livability order by per_of_livability desc LIMIT 10 - best performers */
  async topPerformers(limit = 10) {
    return db
      .select({
        id: tempLivability.id,
        realEstateId: tempLivability.realEstateId,
        perOfLivability: tempLivability.perOfLivability,
        realEstateName: realEstateMaster.realEstateName,
      })
      .from(tempLivability)
      .innerJoin(realEstateMaster, eq(tempLivability.realEstateId, realEstateMaster.id))
      .orderBy(desc(tempLivability.perOfLivability))
      .limit(limit);
  },

  /** select * from temp_livability order by per_of_livability LIMIT 10 - worst performers */
  async bottomPerformers(limit = 10) {
    return db
      .select({
        id: tempLivability.id,
        realEstateId: tempLivability.realEstateId,
        perOfLivability: tempLivability.perOfLivability,
        realEstateName: realEstateMaster.realEstateName,
      })
      .from(tempLivability)
      .innerJoin(realEstateMaster, eq(tempLivability.realEstateId, realEstateMaster.id))
      .orderBy(tempLivability.perOfLivability)
      .limit(limit);
  },
};
