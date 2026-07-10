import { and, between, eq, sql, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { rainwaterHarvesting, realEstateMaster } from "../db/schema.js";

/**
 * rainwater_harvesting: one config/status row per property - same
 * delete+reinsert / flag yes-no pattern as stp, solar_energy,
 * waste_related, anms_detail, aqms_detail.
 */
export const RainwaterHarvestingModel = {
  async getNextId() {
    const [row] = await db
      .select({ maxId: sql`MAX(${rainwaterHarvesting.id})` })
      .from(rainwaterHarvesting);
    return (Number(row?.maxId) || 0) + 1;
  },

  async getByRealEstate(realEstateId) {
    const rows = await db
      .select()
      .from(rainwaterHarvesting)
      .where(eq(rainwaterHarvesting.realEstateId, realEstateId))
      .orderBy(desc(rainwaterHarvesting.id));
    return rows[0] ?? null;
  },

  async getFlag(realEstateId) {
    const [row] = await db
      .select({ flag: rainwaterHarvesting.flag })
      .from(rainwaterHarvesting)
      .where(eq(rainwaterHarvesting.realEstateId, realEstateId))
      .limit(1);
    return row?.flag ?? null;
  },

  /** select * from rainwater_harvesting where warranty_harvesting between '$d1' and '$d2' [and real_estate_id=...] */
  async listByWarrantyDateRange(fromDate, toDate, realEstateId) {
    const conditions = realEstateId
      ? and(
          eq(rainwaterHarvesting.realEstateId, realEstateId),
          between(rainwaterHarvesting.warrantyHarvesting, fromDate, toDate)
        )
      : between(rainwaterHarvesting.warrantyHarvesting, fromDate, toDate);

    return db.select().from(rainwaterHarvesting).where(conditions);
  },

  async upsert({
    capacityHarvesting,
    warrantyHarvesting,
    mfgHarvesting,
    addressHarvesting,
    gstHarvesting,
    contactHarvesting,
    mobileHarvesting,
    emailHarvesting,
    points,
    remarks,
    flag,
    realEstateId,
    installDate,
  }) {
    await db.delete(rainwaterHarvesting).where(eq(rainwaterHarvesting.realEstateId, realEstateId));

    const id = await this.getNextId();
    await db.insert(rainwaterHarvesting).values({
      id,
      capacityHarvesting: capacityHarvesting ?? "",
      warrantyHarvesting: warrantyHarvesting ?? new Date(),
      mfgHarvesting: mfgHarvesting ?? "",
      addressHarvesting: addressHarvesting ?? "",
      gstHarvesting: gstHarvesting ?? "",
      contactHarvesting: contactHarvesting ?? "",
      mobileHarvesting: mobileHarvesting ?? "",
      emailHarvesting: emailHarvesting ?? "",
      points: points ?? 0,
      remarks: remarks ?? "",
      flag: flag ?? "no",
      realEstateId,
      installDate: installDate ?? new Date(),
    });

    return id;
  },

  async getRainwaterCollectionReport(realEstateId, fromDate, toDate) {
    const conditions = [];

    if (Number(realEstateId) !== 0) {
      conditions.push(eq(rainwaterHarvesting.realEstateId, Number(realEstateId)));
    }
    // Check installDate range if specified
    if (fromDate) {
      conditions.push(sql`${rainwaterHarvesting.installDate} >= ${fromDate}`);
    }
    if (toDate) {
      conditions.push(sql`${rainwaterHarvesting.installDate} <= ${toDate}`);
    }

    const rows = await db
      .select({
        id: rainwaterHarvesting.id,
        realEstateId: rainwaterHarvesting.realEstateId,
        realEstateName: realEstateMaster.realEstateName,
        installDate: rainwaterHarvesting.installDate,
        warrantyHarvesting: rainwaterHarvesting.warrantyHarvesting,
        capacityHarvesting: rainwaterHarvesting.capacityHarvesting,
      })
      .from(rainwaterHarvesting)
      .leftJoin(realEstateMaster, eq(rainwaterHarvesting.realEstateId, realEstateMaster.id))
      .where(and(...conditions))
      .orderBy(desc(rainwaterHarvesting.id));

    return rows.map((r, i) => {
      let year = "2026";
      const dateToUse = r.installDate || r.warrantyHarvesting;
      if (dateToUse) {
        const dateObj = new Date(dateToUse);
        if (!isNaN(dateObj.getTime())) {
          year = String(dateObj.getFullYear());
        }
      }

      const collection = r.capacityHarvesting || "0 KL";
      const capacityPct = "100%";

      return {
        slNo: i + 1,
        sl: i + 1,
        realEstateId: r.realEstateId,
        realEstateName: r.realEstateName,
        estate: r.realEstateName,
        year,
        collection,
        capacityPct,
        capacityHarvesting: r.capacityHarvesting,
      };
    });
  },
};
