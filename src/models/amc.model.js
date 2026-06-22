import { and, eq, sql, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { amc } from "../db/schema.js";

/**
 * amc: Annual Maintenance Contract details for the 5 device modules that
 * have a "fact_sheet" tag (solar, harvesting, stp, aqms, anms) - one row
 * per (real_estate_id, fact_sheet) combination, replaced wholesale on
 * every save (delete + reinsert), matching the legacy
 * admin/save_amc*.php pattern.
 */
export const VALID_FACT_SHEETS = ["solar", "harvesting", "stp", "aqms", "anms"];

export const AmcModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${amc.id})` }).from(amc);
    return (Number(row?.maxId) || 0) + 1;
  },

  async get(realEstateId, factSheet) {
    const rows = await db
      .select()
      .from(amc)
      .where(and(eq(amc.realEstateId, realEstateId), eq(amc.factSheet, factSheet)))
      .orderBy(desc(amc.id));
    return rows[0] ?? null;
  },

  /**
   * Mirrors:
   *   DELETE from amc where real_estate_id='$id' and fact_sheet='$type'
   *   insert into amc(id,name,address,phone,emailid,gst,fact_sheet,real_estate_id) values (...)
   */
  async upsert({ name, address, phone, emailid, gst, factSheet, realEstateId }) {
    if (!VALID_FACT_SHEETS.includes(factSheet)) {
      throw new Error(`factSheet must be one of: ${VALID_FACT_SHEETS.join(", ")}`);
    }

    await db.delete(amc).where(and(eq(amc.realEstateId, realEstateId), eq(amc.factSheet, factSheet)));

    const id = await this.getNextId();
    await db.insert(amc).values({
      id,
      name: name ?? "",
      address: address ?? "",
      phone: phone ?? 0,
      emailid: emailid ?? "",
      gst: gst ?? "",
      factSheet,
      realEstateId,
    });

    return id;
  },

  /** Convenience: fetch all 5 AMC records for a property in one call. */
  async getAllForRealEstate(realEstateId) {
    const rows = await db.select().from(amc).where(eq(amc.realEstateId, realEstateId));
    const byFactSheet = {};
    for (const sheet of VALID_FACT_SHEETS) {
      byFactSheet[sheet] = rows.find((r) => r.factSheet === sheet) ?? null;
    }
    return byFactSheet;
  },
};
