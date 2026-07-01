import { and, between, desc, eq, like } from "drizzle-orm";
import { db } from "../db/index.js";
import { green, realEstateMaster } from "../db/schema.js";

/**
 * green: one or more rows per property tracking greenery/landscaped area
 * and tree counts, with two parallel scoring tracks (green-area flag/
 * points/remarks and tree-count flag/points/remarks). `id` is a genuine
 * AUTO_INCREMENT column despite legacy max(id)+1 queries (the table was
 * evidently altered after the original PHP was written).
 *
 * The legacy code's add flow follows the same delete-then-reinsert
 * pattern as stp/solar_energy/etc, but there's also a substantial admin
 * reporting layer (date-range + property-name + state filters, joined
 * against real_estate_master, paginated) - covered here too.
 */
export const GreenModel = {
  async getByRealEstate(realEstateId) {
    if (realEstateId === 0) {
      return db
        .select()
        .from(green)
        .orderBy(desc(green.id));
    }
    const rows = await db
      .select()
      .from(green)
      .where(eq(green.realEstateId, realEstateId))
      .orderBy(desc(green.id));
    return rows[0] ?? null;
  },

  async getFlags(realEstateId) {
    const [row] = await db
      .select({ flagGreen: green.flagGreen, flagTree: green.flagTree, actualTrees: green.actualTrees })
      .from(green)
      .where(eq(green.realEstateId, realEstateId))
      .limit(1);
    return row ?? null;
  },

  async listByRealEstate(realEstateId) {
    if (realEstateId === 0) {
      return db.select().from(green);
    }
    return db.select().from(green).where(eq(green.realEstateId, realEstateId));
  },

  async listByDateRange(realEstateId, fromDate, toDate) {
    if (realEstateId === 0) {
      return db
        .select()
        .from(green)
        .where(between(green.dt, fromDate, toDate));
    }
    return db
      .select()
      .from(green)
      .where(and(eq(green.realEstateId, realEstateId), between(green.dt, fromDate, toDate)));
  },

  /**
   * Mirrors the legacy "DELETE existing row(s), then INSERT fresh" pattern
   * found in add_green*.php across all 3 portals.
   */
  async upsert({
    totArea,
    mandatedArea,
    actualArea,
    trees,
    type,
    dt,
    pointsGreen,
    pointsTree,
    remarksGreen,
    remarksTree,
    flagGreen,
    flagTree,
    realEstateId,
    actualTrees,
    installDate,
  }) {
    await db.delete(green).where(eq(green.realEstateId, realEstateId));

    const [result] = await db.insert(green).values({
      totArea: totArea ?? "",
      mandatedArea: mandatedArea ?? "",
      actualArea: actualArea ?? "",
      trees: trees ?? "",
      type: type ?? "",
      dt: dt ?? new Date(),
      pointsGreen: pointsGreen ?? 0,
      pointsTree: pointsTree ?? 0,
      remarksGreen: remarksGreen ?? "",
      remarksTree: remarksTree ?? "",
      flagGreen: flagGreen ?? "no",
      flagTree: flagTree ?? "no",
      realEstateId,
      actualTrees: actualTrees ?? "",
      installDate: installDate ?? new Date(),
    });

    return result.insertId;
  },

  /**
   * select g.dt,g.actual_area,g.tot_area,g.trees,r.real_estate_name
   * from green g, real_estate_master r where g.real_estate_id=r.id
   * and g.dt between ... [and r.real_estate_name like '%...%'] [and r.state='...']
   * order by dt asc [limit offset,10]
   *
   * Admin cross-property reporting query - all filters optional.
   */
  async reportByDateRange({ fromDate, toDate, nameSearch, stateId, offset, pageSize = 10 } = {}) {
    const conditions = [between(green.dt, fromDate, toDate)];
    if (nameSearch) conditions.push(like(realEstateMaster.realEstateName, `%${nameSearch}%`));
    if (stateId) conditions.push(eq(realEstateMaster.state, stateId));

    let query = db
      .select({
        dt: green.dt,
        actualArea: green.actualArea,
        totArea: green.totArea,
        trees: green.trees,
        realEstateName: realEstateMaster.realEstateName,
      })
      .from(green)
      .innerJoin(realEstateMaster, eq(green.realEstateId, realEstateMaster.id))
      .where(and(...conditions))
      .orderBy(green.dt);

    if (offset !== undefined) {
      query = query.limit(pageSize).offset(offset);
    }

    return query;
  },

  /**
   * select * from green as g, real_estate_master as r where g.real_estate_id=r.id
   * and r.status='active' [and g.dt between ...] [and r.state='...'] [and r.real_estate_name='...']
   * order by dt asc limit offset,10
   */
  async listActivePropertiesReport({ fromDate, toDate, stateId, exactName, offset = 0, pageSize = 10 } = {}) {
    const conditions = [eq(realEstateMaster.status, "active")];
    if (fromDate && toDate) conditions.push(between(green.dt, fromDate, toDate));
    if (stateId) conditions.push(eq(realEstateMaster.state, stateId));
    if (exactName) conditions.push(eq(realEstateMaster.realEstateName, exactName));

    return db
      .select({
        id: green.id,
        dt: green.dt,
        totArea: green.totArea,
        actualArea: green.actualArea,
        trees: green.trees,
        actualTrees: green.actualTrees,
        flagGreen: green.flagGreen,
        flagTree: green.flagTree,
        realEstateId: realEstateMaster.id,
        realEstateName: realEstateMaster.realEstateName,
        status: realEstateMaster.status,
      })
      .from(green)
      .innerJoin(realEstateMaster, eq(green.realEstateId, realEstateMaster.id))
      .where(and(...conditions))
      .orderBy(green.dt)
      .limit(pageSize)
      .offset(offset);
  },
};
