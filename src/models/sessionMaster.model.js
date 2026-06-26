import { and, eq, desc } from "drizzle-orm";
import crypto from "crypto";
import { db } from "../db/index.js";
import { sessionMaster } from "../db/schema.js";

/**
 * session_master: named reporting-period ("session") date ranges per
 * property, each with a unique generated `session_key` token used to
 * cross-reference reports in other modules (e.g. ec_module.session_key).
 * `id` is a genuine AUTO_INCREMENT column.
 */
export const SessionMasterModel = {
  /** Replaces the legacy PHP token generator (uniqid()/md5(rand()) style). */
  generateSessionKey() {
    return crypto.randomBytes(16).toString("hex");
  },

  async findByDateRange(realEstateId, fromSession, toSession) {
    const [row] = await db
      .select()
      .from(sessionMaster)
      .where(
        and(
          eq(sessionMaster.realEstateId, realEstateId),
          eq(sessionMaster.fromSession, fromSession),
          eq(sessionMaster.toSession, toSession)
        )
      )
      .limit(1);
    return row ?? null;
  },

  async getSessionKey(realEstateId, fromSession, toSession) {
    const row = await this.findByDateRange(realEstateId, fromSession, toSession);
    return row?.sessionKey ?? null;
  },

  async getById(id, realEstateId) {
    const conditions = realEstateId
      ? and(eq(sessionMaster.id, id), eq(sessionMaster.realEstateId, realEstateId))
      : eq(sessionMaster.id, id);
    const [row] = await db.select().from(sessionMaster).where(conditions).limit(1);
    return row ?? null;
  },

  async listByRealEstate(realEstateId) {
    return db
      .select()
      .from(sessionMaster)
      .where(eq(sessionMaster.realEstateId, realEstateId))
      .orderBy(desc(sessionMaster.id));
  },

  async listAll() {
    return db.select().from(sessionMaster);
  },

  /**
   * Mirrors add_session.php: checks for an existing identical date range
   * for this property first (findByDateRange), only inserts a new session
   * + key if none exists.
   */
  async create({ realEstateId, fromSession, toSession }) {
    const existing = await this.findByDateRange(realEstateId, fromSession, toSession);
    if (existing) {
      return { created: false, row: existing };
    }

    const sessionKey = this.generateSessionKey();
    const [result] = await db
      .insert(sessionMaster)
      .values({ realEstateId, fromSession, toSession, sessionKey });

    return { created: true, row: { id: result.insertId, realEstateId, fromSession, toSession, sessionKey } };
  },

  async update(id, realEstateId, { fromSession, toSession }) {
    const existing = await this.getById(id, realEstateId);
    if (!existing) return null;

    const conditions = realEstateId
      ? and(eq(sessionMaster.id, id), eq(sessionMaster.realEstateId, realEstateId))
      : eq(sessionMaster.id, id);

    await db.update(sessionMaster).set({ fromSession, toSession }).where(conditions);
    return { id, fromSession, toSession, realEstateId };
  },

  async remove(id, realEstateId) {
    const existing = await this.getById(id, realEstateId);
    if (!existing) return null;

    await db
      .delete(sessionMaster)
      .where(and(eq(sessionMaster.id, id), eq(sessionMaster.realEstateId, realEstateId)));

    return existing;
  },
};
