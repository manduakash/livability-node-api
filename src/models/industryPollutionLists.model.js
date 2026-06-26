import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { waterConsumptionList, waterPolutionList, airPolutionList } from "../db/schema.js";

/**
 * These 3 tables share an identical legacy pattern: manual max(id)+1
 * insert with a full-row dedupe check, scoped by `industry_ms` (an
 * industry/source identifier - NOT real_estate_id, unlike most other
 * modules in this codebase) rather than a property. Each also has an
 * aggregate COUNT/SUM reporting query used for industry-level summaries.
 */

export const WaterConsumptionListModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${waterConsumptionList.id})` }).from(waterConsumptionList);
    return (Number(row?.maxId) || 0) + 1;
  },

  async existsDuplicate({ waterConsumptionQuantity, dischargeQuantity, treatmentQuantity }) {
    const rows = await db
      .select({ id: waterConsumptionList.id })
      .from(waterConsumptionList)
      .where(
        and(
          eq(waterConsumptionList.waterConsumptionQuantity, waterConsumptionQuantity),
          eq(waterConsumptionList.dischargeQuantity, dischargeQuantity),
          eq(waterConsumptionList.treatmentQuantity, treatmentQuantity)
        )
      )
      .limit(1);
    return rows.length > 0;
  },

  async create({
    waterConsumptionQuantity,
    uomWaterconsumption,
    dischargeQuantity,
    uomDischarge,
    treatmentQuantity,
    uomTreatment,
    airDate,
    industryMs,
  }) {
    const duplicate = await this.existsDuplicate({ waterConsumptionQuantity, dischargeQuantity, treatmentQuantity });
    if (duplicate) return { created: false, id: null };

    const id = await this.getNextId();
    await db.insert(waterConsumptionList).values({
      id,
      waterConsumptionQuantity,
      uomWaterconsumption,
      dischargeQuantity,
      uomDischarge,
      treatmentQuantity,
      uomTreatment,
      airDate,
      industryMs,
    });

    return { created: true, id };
  },

  async listByIndustry(industryMs) {
    return db
      .select()
      .from(waterConsumptionList)
      .where(eq(waterConsumptionList.industryMs, industryMs))
      .orderBy(waterConsumptionList.id);
  },

  async listGroupedByIndustry() {
    return db.select().from(waterConsumptionList).groupBy(waterConsumptionList.industryMs).orderBy(waterConsumptionList.id);
  },

  /** select count/sum aggregate for one industry's discharge & treatment totals */
  async getTotalsByIndustry(industryMs) {
    const [row] = await db
      .select({
        totCount: sql`COUNT(${waterConsumptionList.dischargeQuantity})`,
        totDis: sql`SUM(${waterConsumptionList.dischargeQuantity})`,
        totTreat: sql`SUM(${waterConsumptionList.treatmentQuantity})`,
      })
      .from(waterConsumptionList)
      .where(eq(waterConsumptionList.industryMs, industryMs));

    return {
      totCount: Number(row?.totCount) || 0,
      totDis: Number(row?.totDis) || 0,
      totTreat: Number(row?.totTreat) || 0,
    };
  },
};

export const WaterPolutionListModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${waterPolutionList.id})` }).from(waterPolutionList);
    return (Number(row?.maxId) || 0) + 1;
  },

  async existsDuplicate({ waterPolution, inlet, outlet, sampleDate, reportDate, readingTime, laboratory, airDate, industryMs }) {
    const rows = await db
      .select({ id: waterPolutionList.id })
      .from(waterPolutionList)
      .where(
        and(
          eq(waterPolutionList.waterPolution, waterPolution),
          eq(waterPolutionList.inlet, inlet),
          eq(waterPolutionList.outlet, outlet),
          eq(waterPolutionList.sampleDate, sampleDate),
          eq(waterPolutionList.reportDate, reportDate),
          eq(waterPolutionList.readingTime, readingTime),
          eq(waterPolutionList.laboratory, laboratory),
          eq(waterPolutionList.airDate, airDate),
          eq(waterPolutionList.industryMs, industryMs)
        )
      )
      .limit(1);
    return rows.length > 0;
  },

  async create(data) {
    const duplicate = await this.existsDuplicate(data);
    if (duplicate) return { created: false, id: null };

    const id = await this.getNextId();
    await db.insert(waterPolutionList).values({ id, ...data });
    return { created: true, id };
  },

  async listByIndustry(industryMs) {
    return db.select().from(waterPolutionList).where(eq(waterPolutionList.industryMs, industryMs));
  },

  async getTotalsByIndustry(industryMs) {
    const [row] = await db
      .select({
        totCount: sql`COUNT(${waterPolutionList.readingTime})`,
      })
      .from(waterPolutionList)
      .where(eq(waterPolutionList.industryMs, industryMs));

    return { totCount: Number(row?.totCount) || 0 };
  },
};

export const AirPolutionListModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${airPolutionList.id})` }).from(airPolutionList);
    return (Number(row?.maxId) || 0) + 1;
  },

  async existsDuplicate({ airEmmition, airPollutionParameters, reading, sampleDate, reportDate, laboratory, airDate, industryMs }) {
    const rows = await db
      .select({ id: airPolutionList.id })
      .from(airPolutionList)
      .where(
        and(
          eq(airPolutionList.airEmmition, airEmmition),
          eq(airPolutionList.airPollutionParameters, airPollutionParameters),
          eq(airPolutionList.reading, reading),
          eq(airPolutionList.sampleDate, sampleDate),
          eq(airPolutionList.reportDate, reportDate),
          eq(airPolutionList.laboratory, laboratory),
          eq(airPolutionList.airDate, airDate),
          eq(airPolutionList.industryMs, industryMs)
        )
      )
      .limit(1);
    return rows.length > 0;
  },

  async create(data) {
    const duplicate = await this.existsDuplicate(data);
    if (duplicate) return { created: false, id: null };

    const id = await this.getNextId();
    await db.insert(airPolutionList).values({ id, ...data });
    return { created: true, id };
  },

  async listByIndustry(industryMs) {
    return db.select().from(airPolutionList).where(eq(airPolutionList.industryMs, industryMs));
  },

  async getTotalsByIndustry(industryMs) {
    const [row] = await db
      .select({
        totCount: sql`COUNT(${airPolutionList.reading})`,
        totReading: sql`SUM(${airPolutionList.reading})`,
      })
      .from(airPolutionList)
      .where(eq(airPolutionList.industryMs, industryMs));

    return { totCount: Number(row?.totCount) || 0, totReading: Number(row?.totReading) || 0 };
  },
};
