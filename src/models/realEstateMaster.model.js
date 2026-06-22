import { and, count, eq, like, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { realEstateMaster } from "../db/schema.js";

/**
 * real_estate_master: the central property/profile entity that nearly
 * every other module joins against. 716 queries reference this table in
 * the legacy dump, but 694 of them are read-only "populate a property
 * dropdown" or "look up a property's name/state/district for a join"
 * variants repeated across dozens of files - those are now served by
 * this one flexible `search()` function instead of being hand-ported
 * one-by-one. The genuine entity lifecycle (create / full edit / soft
 * delete / hard delete / status toggle / geo-location update / clear a
 * file field) is covered explicitly below.
 */
export const RealEstateMasterModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${realEstateMaster.id})` }).from(realEstateMaster);
    return (Number(row?.maxId) || 0) + 1;
  },

  async getById(id) {
    const [row] = await db.select().from(realEstateMaster).where(eq(realEstateMaster.id, id)).limit(1);
    return row ?? null;
  },

  async getByName(realEstateName) {
    const [row] = await db
      .select()
      .from(realEstateMaster)
      .where(eq(realEstateMaster.realEstateName, realEstateName))
      .limit(1);
    return row ?? null;
  },

  async getByUsername(username) {
    const [row] = await db
      .select()
      .from(realEstateMaster)
      .where(eq(realEstateMaster.username, username))
      .limit(1);
    return row ?? null;
  },

  /**
   * Flexible search/list/paginate, replacing the ~200 near-duplicate
   * SELECT shapes found in the legacy dump (filter by any combination of
   * state, district, name (exact or partial), status, delStatus; with or
   * without pagination).
   */
  async search({ state, district, realEstateName, nameLike, status, delStatus, page, pageSize = 10 } = {}) {
    const conditions = [];
    if (state) conditions.push(eq(realEstateMaster.state, state));
    if (district) conditions.push(eq(realEstateMaster.district, district));
    if (realEstateName) conditions.push(eq(realEstateMaster.realEstateName, realEstateName));
    if (nameLike) conditions.push(like(realEstateMaster.realEstateName, `${nameLike}%`));
    if (status) conditions.push(eq(realEstateMaster.status, status));
    if (delStatus !== undefined) conditions.push(eq(realEstateMaster.delStatus, delStatus));

    let query = db
      .select()
      .from(realEstateMaster)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(realEstateMaster.realEstateName);

    if (page !== undefined) {
      query = query.limit(pageSize).offset(page * pageSize);
    }

    return query;
  },

  /** Same filters as search(), but returns just the total count (for pagination UIs). */
  async countSearch({ state, district, realEstateName, nameLike, status, delStatus } = {}) {
    const conditions = [];
    if (state) conditions.push(eq(realEstateMaster.state, state));
    if (district) conditions.push(eq(realEstateMaster.district, district));
    if (realEstateName) conditions.push(eq(realEstateMaster.realEstateName, realEstateName));
    if (nameLike) conditions.push(like(realEstateMaster.realEstateName, `${nameLike}%`));
    if (status) conditions.push(eq(realEstateMaster.status, status));
    if (delStatus !== undefined) conditions.push(eq(realEstateMaster.delStatus, delStatus));

    const [row] = await db
      .select({ total: count() })
      .from(realEstateMaster)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return Number(row?.total) || 0;
  },

  async listDistinctStates() {
    const rows = await db
      .select({ state: sql`DISTINCT ${realEstateMaster.state}` })
      .from(realEstateMaster);
    return rows.map((r) => r.state);
  },

  /**
   * Mirrors the legacy registration INSERT (~80 fields). Any field not
   * supplied falls back to an empty/zero default to match the legacy
   * behaviour of submitting partially-filled forms.
   */
  async create(data) {
    const id = await this.getNextId();

    await db.insert(realEstateMaster).values({
      id,
      date1: data.date1 ?? new Date(),
      realEstateName: data.realEstateName,
      profilePhoto: data.profilePhoto ?? "",
      industryType: Number(data.industryType) || 0,
      industryClassification: Number(data.industryClassification) || 0,
      categoriesIndustry: Number(data.categoriesIndustry) || 0,
      registrationNo: data.registrationNo ?? "",
      scale: data.scale ?? "",
      dateOffComm: data.dateOffComm ?? new Date(),
      powerSupply: data.powerSupply ?? "",
      noOfStaff: Number(data.noOfStaff) || 0,
      tradeLicense: data.tradeLicense ?? "",
      tradeLicenseIssBy: data.tradeLicenseIssBy ?? "",
      issDate: data.issDate ?? new Date(),
      validUpto: data.validUpto ?? new Date(),
      gstinDetail: data.gstinDetail ?? "",
      gstDoc: data.gstDoc ?? "",
      addrFactory: data.addrFactory ?? "",
      phone: data.phone ?? "",
      comEmailId: data.comEmailId ?? "",
      landNo: data.landNo ?? "",
      state: data.state ?? "",
      district: data.district ?? "",
      city: data.city ?? "",
      pinCode: Number(data.pinCode) || 0,
      postOffice: data.postOffice ?? "",
      policeStation: data.policeStation ?? "",
      localBody: data.localBody ?? "",
      wordNo: data.wordNo ?? "",
      jlNo: data.jlNo ?? "",
      plotNo: data.plotNo ?? "",
      dagNo: data.dagNo ?? "",
      developerName: data.developerName ?? "",
      addrOff: data.addrOff ?? "",
      addrReal: data.addrReal ?? "",
      telephone: data.telephone ?? "",
      faxNo: data.faxNo ?? "",
      email: data.email ?? "",
      website: data.website ?? "",
      pcbOffice: data.pcbOffice ?? "",
      addressOfResident: data.addressOfResident ?? "",
      areaResidential: data.areaResidential ?? "",
      block: data.block ?? "",
      blockType: data.blockType ?? "",
      block1: data.block1 ?? "",
      blockType1: data.blockType1 ?? "",
      projectArea: data.projectArea ?? "",
      dwellingUnit: data.dwellingUnit ?? "",
      dateOfEc: data.dateOfEc ?? new Date(),
      nodalPerson: data.nodalPerson ?? "",
      dateOfInstallationAqms: data.dateOfInstallationAqms ?? new Date(),
      dateOfInstallationWqms: data.dateOfInstallationWqms ?? new Date(),
      dateOfInstallationAnms: data.dateOfInstallationAnms ?? new Date(),
      dateOfInstallationNoise: data.dateOfInstallationNoise ?? new Date(),
      dateOfAutoComposter: data.dateOfAutoComposter ?? new Date(),
      latitude: data.latitude ?? "",
      longitude: data.longitude ?? "",
      expPopulation: data.expPopulation ?? "",
      totalWater: data.totalWater ?? "",
      freshWater: data.freshWater ?? "",
      wasteWater: data.wasteWater ?? "",
      treatedWaterRecycled: data.treatedWaterRecycled ?? "",
      treatedWaterDischarged: data.treatedWaterDischarged ?? "",
      solid: data.solid ?? "",
      noOfStory: data.noOfStory ?? "",
      ground: data.ground ?? "",
      pavedArea: data.pavedArea ?? "",
      greenArea: data.greenArea ?? "",
      exclusive: data.exclusive ?? "",
      noOfPlantation: data.noOfPlantation ?? "",
      services: data.services ?? "",
      noOfParking: data.noOfParking ?? "",
      totalPower: data.totalPower ?? "",
      backUp: data.backUp ?? "",
      solarStreet: data.solarStreet ?? "",
      solarDetails: data.solarDetails ?? "",
      noOfFlats: data.noOfFlats ?? "",
      noOfBunglows: data.noOfBunglows ?? "",
      noOfCommercials: data.noOfCommercials ?? "",
      status: data.status ?? "active",
      username: data.username ?? "",
      password: data.password ?? "",
      delStatus: 0,
      geoLocation: data.geoLocation ?? "",
    });

    return id;
  },

  /**
   * Mirrors the legacy "full edit" UPDATE (~50 fields, everything except
   * id/date1/registration-only fields/username/password/del_status).
   */
  async update(id, data) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const updateValues = {};
    const editableFields = [
      "phone", "district", "city", "pinCode", "policeStation", "email", "industryType",
      "industryClassification", "categoriesIndustry", "registrationNo", "scale", "dateOffComm",
      "powerSupply", "noOfStaff", "tradeLicense", "tradeLicenseIssBy", "issDate", "validUpto",
      "gstinDetail", "gstDoc", "addrFactory", "comEmailId", "landNo", "state", "postOffice",
      "localBody", "wordNo", "jlNo", "plotNo", "dagNo", "developerName", "addrOff", "addrReal",
      "telephone", "faxNo", "website", "pcbOffice", "addressOfResident", "areaResidential",
      "block", "blockType", "block1", "blockType1", "projectArea", "dwellingUnit", "dateOfEc",
      "nodalPerson", "dateOfInstallationAqms", "dateOfInstallationWqms", "dateOfInstallationAnms",
      "dateOfInstallationNoise", "dateOfAutoComposter", "latitude", "expPopulation", "totalWater",
      "freshWater", "wasteWater", "treatedWaterRecycled", "treatedWaterDischarged", "solid",
      "noOfStory", "ground", "pavedArea", "greenArea", "exclusive", "noOfPlantation", "services",
      "noOfParking", "totalPower", "backUp", "solarStreet", "noOfFlats", "noOfBunglows",
      "noOfCommercials", "status", "realEstateName",
    ];

    for (const field of editableFields) {
      if (data[field] !== undefined) updateValues[field] = data[field];
    }

    if (Object.keys(updateValues).length === 0) return existing;

    await db.update(realEstateMaster).set(updateValues).where(eq(realEstateMaster.id, id));
    return { id, ...updateValues };
  },

  /** update real_estate_master set status='active'|'inactive' where id=... */
  async setStatus(id, status) {
    await db.update(realEstateMaster).set({ status }).where(eq(realEstateMaster.id, id));
  },

  /** update real_estate_master set del_status=1|0 where id=... (soft delete / restore) */
  async setDelStatus(id, delStatus) {
    await db.update(realEstateMaster).set({ delStatus }).where(eq(realEstateMaster.id, id));
  },

  /** update real_estate_master set geo_location='...' where id=... */
  async updateGeoLocation(id, location) {
    await db.update(realEstateMaster).set({ geoLocation: location }).where(eq(realEstateMaster.id, id));
  },

  /** UPDATE real_estate_master set gst_doc='' where id=... (clear an uploaded file reference) */
  async clearGstDoc(id) {
    await db.update(realEstateMaster).set({ gstDoc: "" }).where(eq(realEstateMaster.id, id));
  },

  /** UPDATE real_estate_master set profile_photo='' where id=... */
  async clearProfilePhoto(id) {
    await db.update(realEstateMaster).set({ profilePhoto: "" }).where(eq(realEstateMaster.id, id));
  },

  /** Hard delete - DELETE from real_estate_master where id=... */
  async remove(id) {
    const existing = await this.getById(id);
    if (!existing) return null;
    await db.delete(realEstateMaster).where(eq(realEstateMaster.id, id));
    return existing;
  },

  /** DELETE FROM real_estate_master where real_estate_name=... */
  async removeByName(realEstateName) {
    const existing = await this.getByName(realEstateName);
    if (!existing) return null;
    await db.delete(realEstateMaster).where(eq(realEstateMaster.realEstateName, realEstateName));
    return existing;
  },
};
