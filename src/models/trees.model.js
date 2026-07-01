import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { trees, realEstateMaster } from "../db/schema.js";

/**
 * Mirrors trees_master_listing.php / add_trees_master_listing.php /
 * edit_trees_master_listing.php / trees_admin.php (and their
 * pcb/real_estate equivalents) across all 3 portals.
 */
export const TreesModel = {
  async listByRealEstate(realEstateId) {
    if (realEstateId === 0) {
      return db.select().from(trees);
    }
    return db.select().from(trees).where(eq(trees.realEstateId, realEstateId));
  },

  async getById(id) {
    const [row] = await db.select().from(trees).where(eq(trees.id, id)).limit(1);
    return row ?? null;
  },

  async getRealEstateName(realEstateId) {
    const [row] = await db
      .select({ realEstateName: realEstateMaster.realEstateName })
      .from(realEstateMaster)
      .where(eq(realEstateMaster.id, realEstateId))
      .limit(1);
    return row?.realEstateName ?? "";
  },

  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${trees.id})` }).from(trees);
    return (Number(row?.maxId) || 0) + 1;
  },

  async existsDuplicate({ botName, comName, quantity, realEstateId }) {
    const rows = await db
      .select({ id: trees.id })
      .from(trees)
      .where(
        and(
          eq(trees.botName, botName),
          eq(trees.comName, comName),
          eq(trees.quantity, quantity),
          eq(trees.realEstateId, realEstateId)
        )
      )
      .limit(1);
    return rows.length > 0;
  },

  /**
   * Mirrors add_trees_master_listing.php: dedupe check, then manual
   * MAX(id)+1 insert. Returns { created: boolean, id }.
   */
  async create({ botName, comName, quantity, realEstateId }) {
    const duplicate = await this.existsDuplicate({ botName, comName, quantity, realEstateId });
    if (duplicate) {
      return { created: false, id: null };
    }

    const id = await this.getNextId();
    await db.insert(trees).values({
      id,
      botName,
      comName,
      quantity,
      realEstateId,
    });

    return { created: true, id };
  },

  /**
   * Mirrors edit_trees_master_listing.php: legacy code deletes the old row
   * by id, then re-inserts as a *new* row with a fresh MAX(id)+1 (so the id
   * changes on edit - preserved here for behavioural parity, even though
   * it's an odd pattern).
   */
  async update(id, { botName, comName, quantity, realEstateId }) {
    await db.delete(trees).where(eq(trees.id, id));
    return this.create({ botName, comName, quantity, realEstateId });
  },

  async remove(id) {
    const existing = await this.getById(id);
    if (!existing) return null;
    await db.delete(trees).where(eq(trees.id, id));
    return existing;
  },
};
