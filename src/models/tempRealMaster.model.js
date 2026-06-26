import { eq, like, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { tempRealMaster } from "../db/schema.js";
import { RealEstateMasterModel } from "./realEstateMaster.model.js";

/**
 * temp_real_master: the property self-registration staging table. A
 * prospective property submits the same ~85-field registration form as
 * real_estate_master, but it lands here first with `approval = 1`
 * ("pending"). An admin reviews the pending queue and either approves it
 * (which - per the legacy workflow - copies the data into
 * real_estate_master and should remove/flag the staging row) or it stays
 * pending. Note the inverted-sounding but confirmed-from-the-SQL
 * semantics: `approval = '1'` means PENDING, `approval = '0'` means
 * APPROVED (set alongside approve_by/approve_date_time).
 *
 * `id` has no AUTO_INCREMENT in the dump (same manual-increment
 * convention used throughout this codebase); `real_estate_name` has a
 * genuine UNIQUE constraint.
 */
export const APPROVAL_PENDING = 1;
export const APPROVAL_APPROVED = 0;

export const TempRealMasterModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${tempRealMaster.id})` }).from(tempRealMaster);
    return (Number(row?.maxId) || 0) + 1;
  },

  async getById(id) {
    const [row] = await db.select().from(tempRealMaster).where(eq(tempRealMaster.id, id)).limit(1);
    return row ?? null;
  },

  async getByName(realEstateName) {
    const [row] = await db
      .select()
      .from(tempRealMaster)
      .where(eq(tempRealMaster.realEstateName, realEstateName))
      .limit(1);
    return row ?? null;
  },

  /** select * from temp_real_master where approval='1' - the pending-review queue */
  async listPending() {
    return db.select().from(tempRealMaster).where(eq(tempRealMaster.approval, APPROVAL_PENDING));
  },

  /** SELECT * from temp_real_master where real_estate_name='$_SESSION[user_name]' order by approve_date_time desc - a registrant's own submission history */
  async listByRegistrant(realEstateName) {
    return db
      .select()
      .from(tempRealMaster)
      .where(eq(tempRealMaster.realEstateName, realEstateName))
      .orderBy(tempRealMaster.approveDateTime);
  },

  /** SELECT * from temp_real_master where real_estate_name like '%$name%' - admin search */
  async searchByName(nameSearch) {
    return db.select().from(tempRealMaster).where(like(tempRealMaster.realEstateName, `%${nameSearch}%`));
  },

  /**
   * Mirrors the legacy registration INSERT - same field set as
   * real_estate_master minus username/password, plus approval tracking.
   * Always inserts with approval = PENDING.
   */
  async create(data) {
    const existing = await this.getByName(data.realEstateName);
    if (existing) {
      return { created: false, id: null, reason: "A submission with this property name already exists" };
    }

    const id = await this.getNextId();
    const now = new Date();

    await db.insert(tempRealMaster).values({
      id,
      date1: data.date1 ?? now,
      time1: data.time1 ?? "00:00:00",
      realEstateName: data.realEstateName,
      profilePhoto: data.profilePhoto ?? "",
      industryType: Number(data.industryType) || 0,
      industryClassification: Number(data.industryClassification) || 0,
      categoriesIndustry: Number(data.categoriesIndustry) || 0,
      registrationNo: data.registrationNo ?? "",
      scale: data.scale ?? "",
      dateOffComm: data.dateOffComm ?? now,
      powerSupply: data.powerSupply ?? "",
      noOfStaff: Number(data.noOfStaff) || 0,
      tradeLicense: data.tradeLicense ?? "",
      tradeLicenseIssBy: data.tradeLicenseIssBy ?? "",
      issDate: data.issDate ?? now,
      validUpto: data.validUpto ?? now,
      gstinDetail: data.gstinDetail ?? "",
      gstDoc: data.gstDoc ?? "",
      addrFactory: data.addrFactory ?? "",
      phone: data.phone ?? 0,
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
      telephone: data.telephone ?? 0,
      faxNo: data.faxNo ?? "",
      email: data.email ?? "",
      website: data.website ?? "",
      pcbOffice: data.pcbOffice ?? "",
      addressOfResident: data.addressOfResident ?? "",
      areaResidential: Number(data.areaResidential) || 0,
      block: Number(data.block) || 0,
      blockType: data.blockType ?? "",
      block1: Number(data.block1) || 0,
      blockType1: data.blockType1 ?? "",
      projectArea: data.projectArea ?? "",
      dwellingUnit: Number(data.dwellingUnit) || 0,
      dateOfEc: data.dateOfEc ?? now,
      nodalPerson: data.nodalPerson ?? "",
      dateOfInstallationAqms: data.dateOfInstallationAqms ?? now,
      dateOfInstallationWqms: data.dateOfInstallationWqms ?? now,
      dateOfInstallationAnms: data.dateOfInstallationAnms ?? now,
      dateOfInstallationNoise: data.dateOfInstallationNoise ?? now,
      dateOfAutoComposter: data.dateOfAutoComposter ?? now,
      approval: APPROVAL_PENDING,
      approveBy: "",
      latitude: data.latitude ?? "",
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
      noOfFlats: Number(data.noOfFlats) || 0,
      noOfBunglows: Number(data.noOfBunglows) || 0,
      noOfCommercials: Number(data.noOfCommercials) || 0,
      status: data.status ?? "active",
    });

    return { created: true, id };
  },

  /** UPDATE temp_real_master set approval='0',approve_date_time=...,approve_by=... where id=... */
  async markApproved(id, approverName) {
    await db
      .update(tempRealMaster)
      .set({ approval: APPROVAL_APPROVED, approveBy: approverName, approveDateTime: new Date() })
      .where(eq(tempRealMaster.id, id));
  },

  /**
   * Full approval workflow: marks the staging row approved, then copies
   * its data into real_estate_master via RealEstateMasterModel.create().
   * The legacy code's exact post-approval cleanup of the staging row
   * wasn't found in the extracted queries (no DELETE-after-approve
   * pattern was present) - the row is left in place with approval=0 as
   * a permanent record, matching what the SQL shows.
   */
  async approve(id, approverName, { username, password } = {}) {
    const submission = await this.getById(id);
    if (!submission) return null;

    await this.markApproved(id, approverName);

    const realEstateId = await RealEstateMasterModel.create({
      ...submission,
      username: username ?? "",
      password: password ?? "",
    });

    return { tempId: id, realEstateId };
  },

  /** DELETE FROM temp_real_master where real_estate_name=... */
  async removeByName(realEstateName) {
    const existing = await this.getByName(realEstateName);
    if (!existing) return null;
    await db.delete(tempRealMaster).where(eq(tempRealMaster.realEstateName, realEstateName));
    return existing;
  },

  async remove(id) {
    const existing = await this.getById(id);
    if (!existing) return null;
    await db.delete(tempRealMaster).where(eq(tempRealMaster.id, id));
    return existing;
  },
};
