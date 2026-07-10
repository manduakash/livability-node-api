import { and, between, eq, like, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { dgSetUsage } from "../db/schema.js";

/**
 * dg_set_usage: per-date DG (diesel generator) usage log entries. `id` is
 * a genuine AUTO_INCREMENT column - same full-CRUD shape as
 * waste_collection/autocomposter/solar_generation.
 */
export const DgSetUsageModel = {
  async reportByDateRange({ fromDate, toDate, realEstateId, offset, pageSize = 10 } = {}) {
    const conditions = [];

    if (fromDate && toDate) {
      conditions.push(between(dgSetUsage.dateOfDg, fromDate, toDate));
    } else if (fromDate) {
      conditions.push(sql`${dgSetUsage.dateOfDg} >= ${fromDate}`);
    } else if (toDate) {
      conditions.push(sql`${dgSetUsage.dateOfDg} <= ${toDate}`);
    }

    if (realEstateId !== undefined && Number(realEstateId) !== 0) {
      conditions.push(eq(dgSetUsage.realEstateId, Number(realEstateId)));
    }

    let query = db
      .select({
        id: dgSetUsage.id,
        hoursUsed: dgSetUsage.hoursUsed,
        electricity: dgSetUsage.electricity,
        oilConsumption: dgSetUsage.oilConsumption,
        wasteGenerated: dgSetUsage.wasteGenerated,
        realEstateId: dgSetUsage.realEstateId,
        dateOfDg: dgSetUsage.dateOfDg,
      })
      .from(dgSetUsage);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(dgSetUsage.dateOfDg);

    if (offset !== undefined) {
      query = query.limit(pageSize).offset(offset);
    }

    return query;
  },

  async create({ hoursUsed, electricity, oilConsumption, wasteGenerated, realEstateId, dateOfDg }) {
    const [result] = await db
      .insert(dgSetUsage)
      .values({ hoursUsed, electricity, oilConsumption, wasteGenerated, realEstateId, dateOfDg });
    return result.insertId;
  },

  async getById(id, realEstateId) {
    const conditions = realEstateId
      ? and(eq(dgSetUsage.id, id), eq(dgSetUsage.realEstateId, realEstateId))
      : eq(dgSetUsage.id, id);
    const [row] = await db.select().from(dgSetUsage).where(conditions).limit(1);
    return row ?? null;
  },

  async remove(id, realEstateId) {
    const existing = await this.getById(id, realEstateId);
    if (!existing) return null;

    const conditions = realEstateId
      ? and(eq(dgSetUsage.id, id), eq(dgSetUsage.realEstateId, realEstateId))
      : eq(dgSetUsage.id, id);

    await db.delete(dgSetUsage).where(conditions);
    return existing;
  },

  async listByRealEstate(realEstateId) {
    if (realEstateId === 0) {
      return db.select().from(dgSetUsage);
    }
    return db.select().from(dgSetUsage).where(eq(dgSetUsage.realEstateId, realEstateId));
  },

  async listByDateRange(realEstateId, fromDate, toDate) {
    if (realEstateId === 0) {
      return db
        .select()
        .from(dgSetUsage)
        .where(between(dgSetUsage.dateOfDg, fromDate, toDate));
    }
    return db
      .select()
      .from(dgSetUsage)
      .where(and(eq(dgSetUsage.realEstateId, realEstateId), between(dgSetUsage.dateOfDg, fromDate, toDate)));
  },

  async listByDateLike(realEstateId, datePattern) {
    if (realEstateId === 0) {
      return db
        .select()
        .from(dgSetUsage)
        .where(like(dgSetUsage.dateOfDg, `%${datePattern}%`));
    }
    return db
      .select()
      .from(dgSetUsage)
      .where(and(eq(dgSetUsage.realEstateId, realEstateId), like(dgSetUsage.dateOfDg, `%${datePattern}%`)));
  },
};
