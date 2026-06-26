import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { ecModuleCondition } from "../db/schema.js";

/**
 * ec_module_condition: a fixed compliance checklist matrix attached to
 * each ec_module record. The legacy PHP source has this matrix unrolled
 * into ~85 near-identical INSERT/SELECT/DELETE statements, but they all
 * collapse to the same generic shape parameterized by 3 integers:
 * (condition, sub_condition, head) - 20 distinct combinations were found
 * in the legacy queries (condition 1 has sub_condition 1 with heads 1-12,
 * sub_condition 2 with heads 1-7; condition 2 always uses sub_condition=0,
 * head=0). Each combination stores a `sub_head1`/`sub_head2` (status text
 * + compliance text) pair.
 *
 * Rather than hand-write 20 near-duplicate functions, this model exposes
 * one parameterized get/set, plus a checklist-shape constant so the
 * frontend/controller can iterate the same 20 combinations the legacy
 * forms used.
 */
export const EC_CHECKLIST_ITEMS = [
  ...Array.from({ length: 12 }, (_, i) => ({ condition: 1, subCondition: 1, head: i + 1 })),
  ...Array.from({ length: 7 }, (_, i) => ({ condition: 1, subCondition: 2, head: i + 1 })),
  { condition: 2, subCondition: 0, head: 0 },
];

export const EcModuleConditionModel = {
  async get(ecModuleId, condition, subCondition, head) {
    const [row] = await db
      .select()
      .from(ecModuleCondition)
      .where(
        and(
          eq(ecModuleCondition.ecModuleId, ecModuleId),
          eq(ecModuleCondition.condition, condition),
          eq(ecModuleCondition.subCondition, subCondition),
          eq(ecModuleCondition.head, head)
        )
      )
      .limit(1);
    return row ?? null;
  },

  /**
   * select sub_head1, sub_head2, head from ec_module_condition
   * where real_estate_id=... and condition=... and sub_condition=...
   * and head=... and ec_module_id=... and session_key=...
   */
  async getForSession(realEstateId, ecModuleId, sessionKey, condition, subCondition, head) {
    const [row] = await db
      .select({
        subHead1: ecModuleCondition.subHead1,
        subHead2: ecModuleCondition.subHead2,
        head: ecModuleCondition.head,
      })
      .from(ecModuleCondition)
      .where(
        and(
          eq(ecModuleCondition.realEstateId, realEstateId),
          eq(ecModuleCondition.ecModuleId, ecModuleId),
          eq(ecModuleCondition.sessionKey, sessionKey),
          eq(ecModuleCondition.condition, condition),
          eq(ecModuleCondition.subCondition, subCondition),
          eq(ecModuleCondition.head, head)
        )
      )
      .limit(1);
    return row ?? null;
  },

  /** Fetches every checklist item for one ec_module record in one query. */
  async listForEcModule(ecModuleId) {
    return db.select().from(ecModuleCondition).where(eq(ecModuleCondition.ecModuleId, ecModuleId));
  },

  /**
   * Mirrors the legacy delete-then-insert-per-item pattern: clears any
   * existing row for this exact (ecModuleId, condition, subCondition,
   * head) combination, then inserts the new status/compliance text.
   */
  async set({ realEstateId, ecModuleId, condition, subCondition, head, subHead1, subHead2, sessionKey }) {
    await db
      .delete(ecModuleCondition)
      .where(
        and(
          eq(ecModuleCondition.ecModuleId, ecModuleId),
          eq(ecModuleCondition.condition, condition),
          eq(ecModuleCondition.subCondition, subCondition),
          eq(ecModuleCondition.head, head)
        )
      );

    const [result] = await db.insert(ecModuleCondition).values({
      realEstateId,
      ecModuleId,
      condition,
      subCondition,
      head,
      subHead1: subHead1 ?? "",
      subHead2: subHead2 ?? "",
      sessionKey: sessionKey ?? "",
    });

    return result.insertId;
  },

  /**
   * Saves the entire checklist (all 20 items) for one ec_module record in
   * one call - mirrors the legacy form's "submit all conditions at once"
   * behaviour. `items` is an array of { condition, subCondition, head,
   * subHead1, subHead2 }.
   */
  async setAll({ realEstateId, ecModuleId, sessionKey, items }) {
    const ids = [];
    for (const item of items) {
      const id = await this.set({
        realEstateId,
        ecModuleId,
        sessionKey,
        condition: item.condition,
        subCondition: item.subCondition,
        head: item.head,
        subHead1: item.subHead1,
        subHead2: item.subHead2,
      });
      ids.push(id);
    }
    return ids;
  },
};
