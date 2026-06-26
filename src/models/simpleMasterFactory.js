import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";

/**
 * Factory for the recurring "simple single-field master" CRUD pattern
 * found identically across industry_type_master, industry_category,
 * clasification_master, and laboratory_master in the legacy code:
 *
 *   select max(id) as id from <table>
 *   select * from <table> where <nameColumn>='$value'   (dedupe check)
 *   INSERT INTO <table>(id,<nameColumn>) VALUES (...)    (manual id)
 *   select * from <table> where id='$id_for_edit'
 *   UPDATE <table> set <nameColumn>='$value' where id='$id_for_edit'
 *   DELETE from <table> where id='$id_for_delete'
 *   select * from <table>
 *
 * `table` is the Drizzle table object, `idCol`/`nameCol` are its column
 * refs (e.g. table.id, table.typeOfIndustry), and `nameKey` is the JS
 * property name for that column as declared in schema.js (e.g.
 * "typeOfIndustry") - needed because Drizzle's `.values()` takes JS
 * property keys, not the underlying SQL column name.
 */
export function createSimpleMasterModel(table, idCol, nameCol, nameKey) {
  return {
    async list() {
      return db.select().from(table);
    },

    async getById(id) {
      const [row] = await db.select().from(table).where(eq(idCol, id)).limit(1);
      return row ?? null;
    },

    async findByName(name) {
      const [row] = await db.select().from(table).where(eq(nameCol, name)).limit(1);
      return row ?? null;
    },

    async getNextId() {
      const [row] = await db.select({ maxId: sql`MAX(${idCol})` }).from(table);
      return (Number(row?.maxId) || 0) + 1;
    },

    async create(name) {
      const existing = await this.findByName(name);
      if (existing) {
        return { created: false, row: existing };
      }

      const id = await this.getNextId();
      await db.insert(table).values({ id, [nameKey]: name });
      return { created: true, row: { id, [nameKey]: name } };
    },

    async update(id, name) {
      const existing = await this.getById(id);
      if (!existing) return null;

      await db.update(table).set({ [nameKey]: name }).where(eq(idCol, id));
      return { id, [nameKey]: name };
    },

    async remove(id) {
      const existing = await this.getById(id);
      if (!existing) return null;

      await db.delete(table).where(eq(idCol, id));
      return existing;
    },
  };
}
