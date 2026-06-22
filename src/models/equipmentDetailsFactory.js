import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";

/**
 * Factory for the anms_details / aqms_details equipment-registry pattern
 * found identically in both tables: a per-property log of installed
 * monitoring equipment (machine model, manufacturer, install date,
 * warranty info), full CRUD with a manual max(id)+1 insert and a guard
 * against inserting/keeping a row with an empty `machine` field (mirrors
 * the legacy `DELETE from <table> where machine=''` cleanup query).
 */
export function createEquipmentDetailsModel(table) {
  return {
    async getNextId() {
      const [row] = await db.select({ maxId: sql`MAX(${table.id})` }).from(table);
      return (Number(row?.maxId) || 0) + 1;
    },

    async getById(id, realEstateId) {
      const conditions = realEstateId
        ? and(eq(table.id, id), eq(table.realEstateId, realEstateId))
        : eq(table.id, id);
      const [row] = await db.select().from(table).where(conditions).limit(1);
      return row ?? null;
    },

    async listByRealEstate(realEstateId) {
      return db.select().from(table).where(eq(table.realEstateId, realEstateId)).orderBy(table.id);
    },

    async create({
      machine,
      nameOfManufacturer,
      dateManufacture,
      dateInstall,
      parameters,
      dateWaranty,
      warantyPerson,
      addressOfWarantyPerson,
      realEstateId,
    }) {
      if (!machine) {
        throw new Error("machine is required");
      }

      const id = await this.getNextId();
      await db.insert(table).values({
        id,
        machine,
        nameOfManufacturer: nameOfManufacturer ?? "",
        dateManufacture: dateManufacture ?? new Date(),
        dateInstall: dateInstall ?? new Date(),
        parameters: parameters ?? "",
        dateWaranty: dateWaranty ?? new Date(),
        warantyPerson: warantyPerson ?? "",
        addressOfWarantyPerson: addressOfWarantyPerson ?? "",
        realEstateId,
      });

      return id;
    },

    /**
     * UPDATE ... set name_of_manufacturer=...,parameters=...,date_waranty=...,
     * waranty_person=...,address_of_waranty_person=... where id=... and real_estate_id=...
     * (the legacy "edit" form only touches manufacturer/parameters/warranty
     * fields, not machine/dateManufacture/dateInstall - preserved as-is)
     */
    async update(id, realEstateId, { nameOfManufacturer, parameters, dateWaranty, warantyPerson, addressOfWarantyPerson }) {
      const existing = await this.getById(id, realEstateId);
      if (!existing) return null;

      await db
        .update(table)
        .set({
          nameOfManufacturer,
          parameters,
          dateWaranty,
          warantyPerson,
          addressOfWarantyPerson,
        })
        .where(and(eq(table.id, id), eq(table.realEstateId, realEstateId)));

      return { id, nameOfManufacturer, parameters, dateWaranty, warantyPerson, addressOfWarantyPerson };
    },

    /**
     * Full-field update variant found in aqms_details (also updates
     * machine/dateManufacture/dateInstall, unlike the narrower update()
     * above used elsewhere).
     */
    async updateFull(id, data) {
      const existing = await this.getById(id);
      if (!existing) return null;

      await db.update(table).set(data).where(eq(table.id, id));
      return { id, ...data };
    },

    async remove(id, realEstateId) {
      const existing = await this.getById(id, realEstateId);
      if (!existing) return null;

      await db.delete(table).where(and(eq(table.id, id), eq(table.realEstateId, realEstateId)));
      return existing;
    },

    /** DELETE from <table> where machine='' - cleanup guard from the legacy code */
    async removeEmptyMachineRows() {
      await db.delete(table).where(eq(table.machine, ""));
    },
  };
}
