import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { userAccess } from "../db/schema.js";

/**
 * user_access: one row per (menu, submenu) combination, holding 6
 * mutually-exclusive permission flags (full_control, entry_only,
 * read_only, update_delete, except_delete, no_control). The legacy code
 * always deletes any existing row for that (menu, submenu) before
 * inserting the new permission level, so set() mirrors that.
 */
export const PERMISSION_LEVELS = [
  "full_control",
  "entry_only",
  "read_only",
  "update_delete",
  "except_delete",
  "no_control",
];

export const UserAccessModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${userAccess.id})` }).from(userAccess);
    return (Number(row?.maxId) || 0) + 1;
  },

  async get(menu, submenu) {
    const [row] = await db
      .select()
      .from(userAccess)
      .where(and(eq(userAccess.menu, menu), eq(userAccess.submenu, submenu)))
      .limit(1);
    return row ?? null;
  },

  async listAll() {
    return db.select().from(userAccess);
  },

  async listByMenu(menu) {
    return db.select().from(userAccess).where(eq(userAccess.menu, menu));
  },

  /**
   * Sets the permission level for one (menu, submenu) pair - mirrors the
   * legacy delete-then-insert. `level` must be one of PERMISSION_LEVELS;
   * only that flag is set to 1, the rest to 0.
   */
  async set(menu, submenu, level) {
    if (!PERMISSION_LEVELS.includes(level)) {
      throw new Error(`level must be one of: ${PERMISSION_LEVELS.join(", ")}`);
    }

    await db.delete(userAccess).where(and(eq(userAccess.menu, menu), eq(userAccess.submenu, submenu)));

    const flags = {
      fullControl: 0,
      entryOnly: 0,
      readOnly: 0,
      updateDelete: 0,
      exceptDelete: 0,
      noControl: 0,
    };
    const flagKey = {
      full_control: "fullControl",
      entry_only: "entryOnly",
      read_only: "readOnly",
      update_delete: "updateDelete",
      except_delete: "exceptDelete",
      no_control: "noControl",
    }[level];
    flags[flagKey] = 1;

    const id = await this.getNextId();
    await db.insert(userAccess).values({ id, menu, submenu, ...flags });
    return id;
  },

  /** Sets permission levels for several (menu, submenu) pairs in one call. */
  async setMany(items) {
    const ids = [];
    for (const item of items) {
      const id = await this.set(item.menu, item.submenu, item.level);
      ids.push(id);
    }
    return ids;
  },

  async remove(menu, submenu) {
    const existing = await this.get(menu, submenu);
    if (!existing) return null;
    await db.delete(userAccess).where(and(eq(userAccess.menu, menu), eq(userAccess.submenu, submenu)));
    return existing;
  },
};
