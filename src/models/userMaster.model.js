import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { userMaster } from "../db/schema.js";

/**
 * user_master: account management CRUD (creation/registration, listing
 * by type, full edit, password change, profile update, deletion).
 * Login itself (the credential check used by POST /api/auth/login) lives
 * in auth.model.js - this model covers everything else.
 */
export const UserMasterModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${userMaster.id})` }).from(userMaster);
    return (Number(row?.maxId) || 0) + 1;
  },

  async getById(id) {
    const [row] = await db.select().from(userMaster).where(eq(userMaster.id, id)).limit(1);
    return row ?? null;
  },

  async getByUserId(userId) {
    const [row] = await db.select().from(userMaster).where(eq(userMaster.userId, userId)).limit(1);
    return row ?? null;
  },

  async getByUserName(userName) {
    const [row] = await db.select().from(userMaster).where(eq(userMaster.userName, userName)).limit(1);
    return row ?? null;
  },

  async listByType(userType) {
    return db.select().from(userMaster).where(eq(userMaster.userType, userType));
  },

  async listByTypeAndState(userType, stateId) {
    return db
      .select()
      .from(userMaster)
      .where(and(eq(userMaster.userType, userType), eq(userMaster.stateId, stateId)));
  },

  async listAll() {
    return db.select().from(userMaster);
  },

  /**
   * Mirrors the various INSERT INTO user_master(...) shapes - some omit
   * state_id, some default user_type to 'real_estate'. All variants are
   * unified into one create() with sensible defaults.
   */
  async create({ userName, userId, password, userType, status, stateId, phone, website, email }) {
    const id = await this.getNextId();
    const today = new Date();

    await db.insert(userMaster).values({
      id,
      userName,
      userId,
      password,
      userType: userType ?? "real_estate",
      status: status ?? 1,
      createdon: today,
      updatedon: today,
      stateId: stateId ?? 0,
      phone: phone ?? 0,
      website: website ?? "",
      email: email ?? "",
    });

    return id;
  },

  /** UPDATE user_master set user_name=...,user_id=...,password=...,user_type=...,updatedon=... where id=... (full edit) */
  async update(id, { userName, userId, password, userType }) {
    const existing = await this.getById(id);
    if (!existing) return null;

    await db
      .update(userMaster)
      .set({ userName, userId, password, userType, updatedon: new Date() })
      .where(eq(userMaster.id, id));

    return { id, userName, userId, userType };
  },

  /** UPDATE user_master set phone=...,website=...,email=... where user_name=... (self-service profile update) */
  async updateProfile(userName, { phone, website, email }) {
    await db.update(userMaster).set({ phone, website, email }).where(eq(userMaster.userName, userName));
  },

  /** UPDATE user_master set password=... where user_name=... (change password) */
  async updatePassword(userName, newPassword) {
    await db.update(userMaster).set({ password: newPassword }).where(eq(userMaster.userName, userName));
  },

  async remove(id) {
    const existing = await this.getById(id);
    if (!existing) return null;
    await db.delete(userMaster).where(eq(userMaster.id, id));
    return existing;
  },

  async removeByUserName(userName) {
    const existing = await this.getByUserName(userName);
    if (!existing) return null;
    await db.delete(userMaster).where(eq(userMaster.userName, userName));
    return existing;
  },
};
