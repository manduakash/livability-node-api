import { and, desc, eq, like, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { ecModule, ecSanction, realEstateMaster } from "../db/schema.js";

/**
 * ec_module: Environmental Clearance report - one (large, many-field) row
 * per property, with a search/filter UI joined against real_estate_master
 * by state/district/name, plus pagination for the admin listing page.
 */
export const EcModuleModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${ecModule.id})` }).from(ecModule);
    return (Number(row?.maxId) || 0) + 1;
  },

  async create(data) {
    const id = await this.getNextId();
    await db.insert(ecModule).values({ id, ...data });
    return id;
  },

  async getById(id, realEstateId) {
    const conditions = realEstateId
      ? and(eq(ecModule.id, id), eq(ecModule.realEstateId, realEstateId))
      : eq(ecModule.id, id);
    const [row] = await db.select().from(ecModule).where(conditions).limit(1);
    return row ?? null;
  },

  async getBySessionKey(sessionKey, realEstateId) {
    const [row] = await db
      .select()
      .from(ecModule)
      .where(and(eq(ecModule.sessionKey, sessionKey), eq(ecModule.realEstateId, realEstateId)))
      .limit(1);
    return row ?? null;
  },

  async listByRealEstate(realEstateId) {
    return db
      .select()
      .from(ecModule)
      .where(eq(ecModule.realEstateId, realEstateId))
      .orderBy(desc(ecModule.id));
  },

  /** SELECT * from ec_module order by id DESC LIMIT $offset,10 (admin listing pagination) */
  async listPaginated(offset = 0, pageSize = 10) {
    return db.select().from(ecModule).orderBy(desc(ecModule.id)).limit(pageSize).offset(offset);
  },

  async countAll() {
    const [row] = await db.select({ count: sql`COUNT(${ecModule.realEstateId})` }).from(ecModule);
    return Number(row?.count) || 0;
  },

  /**
   * Mirrors the various e/r join + filter combinations found in the
   * legacy admin EC search page (filter by state, district, and/or
   * property name search, any combination). Pass null/undefined to skip a
   * filter.
   */
  async search({ state, district, nameSearch } = {}) {
    const conditions = [];
    if (state) conditions.push(eq(realEstateMaster.state, state));
    if (district) conditions.push(eq(realEstateMaster.district, district));
    if (nameSearch) conditions.push(like(realEstateMaster.realEstateName, `%${nameSearch}%`));

    const query = db
      .select({
        realEstateId: realEstateMaster.id,
        realEstateName: realEstateMaster.realEstateName,
        session: ecModule.session,
        videLetterNo: ecModule.videLetterNo,
        projectLocation: ecModule.projectLocation,
        projectProponent: ecModule.projectProponent,
        uploadEc: ecModule.uploadEc,
      })
      .from(ecModule)
      .innerJoin(realEstateMaster, eq(ecModule.realEstateId, realEstateMaster.id))
      .orderBy(desc(ecModule.id));

    return conditions.length > 0 ? query.where(and(...conditions)) : query;
  },

  /** UPDATE ec_module set upload_ec='$path' where real_estate_id='$id' */
  async setUploadEc(realEstateId, path) {
    await db.update(ecModule).set({ uploadEc: path ?? "" }).where(eq(ecModule.realEstateId, realEstateId));
  },

  async remove(id, realEstateId) {
    const existing = await this.getById(id, realEstateId);
    if (!existing) return null;

    const conditions = realEstateId
      ? and(eq(ecModule.id, id), eq(ecModule.realEstateId, realEstateId))
      : eq(ecModule.id, id);

    await db.delete(ecModule).where(conditions);
    return existing;
  },
};

/**
 * ec_sanction: sanction letter records, one-to-many per property (full
 * CRUD, genuine AUTO_INCREMENT id - simpler than ec_module).
 */
export const EcSanctionModel = {
  async create({ realEstateId, date1, sancLett, vidLetterNo, projectLocation }) {
    const [result] = await db
      .insert(ecSanction)
      .values({ realEstateId, date1, sancLett, vidLetterNo, projectLocation });
    return result.insertId;
  },

  async getById(id, realEstateId) {
    const [row] = await db
      .select()
      .from(ecSanction)
      .where(and(eq(ecSanction.id, id), eq(ecSanction.realEstateId, realEstateId)))
      .limit(1);
    return row ?? null;
  },

  async listByRealEstate(realEstateId) {
    return db
      .select()
      .from(ecSanction)
      .where(eq(ecSanction.realEstateId, realEstateId))
      .orderBy(desc(ecSanction.id));
  },

  /** SELECT * from ec_sanction order by real_estate_id LIMIT $offset,10 */
  async listPaginated(offset = 0, pageSize = 10) {
    return db.select().from(ecSanction).orderBy(ecSanction.realEstateId).limit(pageSize).offset(offset);
  },

  async update(id, realEstateId, { sancLett, vidLetterNo, projectLocation }) {
    const existing = await this.getById(id, realEstateId);
    if (!existing) return null;

    await db
      .update(ecSanction)
      .set({ sancLett, vidLetterNo, projectLocation })
      .where(and(eq(ecSanction.id, id), eq(ecSanction.realEstateId, realEstateId)));

    return { id, sancLett, vidLetterNo, projectLocation, realEstateId };
  },

  async remove(id, realEstateId) {
    const existing = await this.getById(id, realEstateId);
    if (!existing) return null;
    await db.delete(ecSanction).where(and(eq(ecSanction.id, id), eq(ecSanction.realEstateId, realEstateId)));
    return existing;
  },

  /** SELECT * from ec_sanction as a, real_estate_master as b where a.real_estate_id=b.id and b.district='$dis' [and b.state='$state'] */
  async search({ state, district } = {}) {
    const conditions = [];
    if (state) conditions.push(eq(realEstateMaster.state, state));
    if (district) conditions.push(eq(realEstateMaster.district, district));

    const query = db
      .select({
        realEstateId: realEstateMaster.id,
        realEstateName: realEstateMaster.realEstateName,
        date1: ecSanction.date1,
        sancLett: ecSanction.sancLett,
        vidLetterNo: ecSanction.vidLetterNo,
        projectLocation: ecSanction.projectLocation,
      })
      .from(ecSanction)
      .innerJoin(realEstateMaster, eq(ecSanction.realEstateId, realEstateMaster.id));

    return conditions.length > 0 ? query.where(and(...conditions)) : query;
  },
};
