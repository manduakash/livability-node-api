import { and, between, eq, like, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { wasteCollection, wasteDetails, wasteRelated } from "../db/schema.js";

/**
 * waste_collection: per-date waste generation/treatment log entries.
 * Mirrors add/list/delete-by-id-and-real-estate found in the legacy
 * waste_collection_admin.php / *_pcb.php / *_real.php family.
 */
export const WasteCollectionModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${wasteCollection.id})` }).from(wasteCollection);
    return (Number(row?.maxId) || 0) + 1;
  },

  async create({ wasteGen, wasteTreat, wasteDateCollec, ulb, realEstateId }) {
    const id = await this.getNextId();
    await db.insert(wasteCollection).values({
      id,
      wasteGen,
      wasteTreat,
      wasteDateCollec,
      ulb,
      realEstateId,
    });
    return id;
  },

  async getById(id, realEstateId) {
    const conditions = realEstateId
      ? and(eq(wasteCollection.id, id), eq(wasteCollection.realEstateId, realEstateId))
      : eq(wasteCollection.id, id);

    const [row] = await db.select().from(wasteCollection).where(conditions).limit(1);
    return row ?? null;
  },

  /**
   * select * from waste_collection where waste_date_collec between '$dd1' and '$dd2' and real_estate_id='$real'
   */
  async listByDateRange(realEstateId, fromDate, toDate) {
    return db
      .select()
      .from(wasteCollection)
      .where(
        and(
          eq(wasteCollection.realEstateId, realEstateId),
          between(wasteCollection.wasteDateCollec, fromDate, toDate)
        )
      );
  },

  /**
   * select * from waste_collection where waste_date_collec like '%$dd%' and real_estate_id='$real_estate_id'
   * (legacy used LIKE for partial date matches, e.g. matching just a month/year fragment)
   */
  async listByDateLike(realEstateId, datePattern) {
    return db
      .select()
      .from(wasteCollection)
      .where(
        and(
          eq(wasteCollection.realEstateId, realEstateId),
          like(wasteCollection.wasteDateCollec, `%${datePattern}%`)
        )
      );
  },

  async remove(id, realEstateId) {
    const existing = await this.getById(id, realEstateId);
    if (!existing) return null;

    const conditions = realEstateId
      ? and(eq(wasteCollection.id, id), eq(wasteCollection.realEstateId, realEstateId))
      : eq(wasteCollection.id, id);

    await db.delete(wasteCollection).where(conditions);
    return existing;
  },
};

/**
 * waste_details: per-date, per-category waste entries (Solid Waste,
 * Hazardous Waste, Bio-Medical Waste, Pollution Waste, Const & Downward
 * Waste). Mirrors add_waste_details_admin.php and friends.
 */
export const WasteDetailsModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${wasteDetails.id})` }).from(wasteDetails);
    return (Number(row?.maxId) || 0) + 1;
  },

  async create({ wasteName, wasteDate, realEstateId }) {
    if (!wasteName) {
      // legacy guarded against empty waste_name with a defensive DELETE -
      // here we simply refuse to insert an empty entry instead.
      throw new Error("wasteName is required");
    }

    const id = await this.getNextId();
    await db.insert(wasteDetails).values({ id, wasteName, wasteDate, realEstateId });
    return id;
  },

  async getById(id) {
    const [row] = await db.select().from(wasteDetails).where(eq(wasteDetails.id, id)).limit(1);
    return row ?? null;
  },

  async listByDate(realEstateId, date) {
    return db
      .select()
      .from(wasteDetails)
      .where(and(eq(wasteDetails.realEstateId, realEstateId), eq(wasteDetails.wasteDate, date)));
  },

  /**
   * select * from waste_details where waste_date between '$dd1' and '$dd2' and waste_name='Solid Waste'
   * (and similarly for the other 4 fixed categories)
   */
  async listByDateRangeAndCategory(category, fromDate, toDate) {
    return db
      .select()
      .from(wasteDetails)
      .where(and(eq(wasteDetails.wasteName, category), between(wasteDetails.wasteDate, fromDate, toDate)));
  },

  async remove(id) {
    const existing = await this.getById(id);
    if (!existing) return null;
    await db.delete(wasteDetails).where(eq(wasteDetails.id, id));
    return existing;
  },
};

/**
 * waste_related: one config/status row per property tracking door-to-door
 * collection, auto-composting, and segregation practice flags, with
 * derived points/remarks - same "flag_x yes/no" pattern seen in
 * anms_detail/aqms_detail. Mirrors add_waste_related*.php.
 */
export const WasteRelatedModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${wasteRelated.id})` }).from(wasteRelated);
    return (Number(row?.maxId) || 0) + 1;
  },

  async getByRealEstate(realEstateId) {
    const rows = await db
      .select()
      .from(wasteRelated)
      .where(eq(wasteRelated.realEstateId, realEstateId))
      .orderBy(sql`${wasteRelated.id} DESC`);
    return rows[0] ?? null;
  },

  async getFlag(realEstateId) {
    const [row] = await db
      .select({ flagWaste: wasteRelated.flagWaste })
      .from(wasteRelated)
      .where(eq(wasteRelated.realEstateId, realEstateId))
      .limit(1);
    return row?.flagWaste ?? null;
  },

  /**
   * Mirrors the legacy "DELETE existing row, then INSERT fresh" pattern
   * for waste_related (it's a single config row per property, replaced
   * wholesale on every save rather than updated in place).
   */
  async upsert({
    door,
    auto,
    segregation,
    pointsWaste,
    pointsSegregation,
    remarksWaste,
    remarksSegre,
    flagWaste,
    realEstateId,
    installDate,
  }) {
    await db.delete(wasteRelated).where(eq(wasteRelated.realEstateId, realEstateId));

    const id = await this.getNextId();
    await db.insert(wasteRelated).values({
      id,
      door: door ?? "",
      auto: auto ?? "",
      segregation: segregation ?? "",
      pointsWaste: pointsWaste ?? 0,
      pointsSegregation: pointsSegregation ?? 0,
      remarksWaste: remarksWaste ?? "",
      remarksSegre: remarksSegre ?? "",
      flagWaste: flagWaste ?? "no",
      realEstateId,
      installDate: installDate ?? new Date(),
    });

    return id;
  },
};
