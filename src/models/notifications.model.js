import { and, between, desc, eq, like, notInArray, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { displayBoard, autocomposter, notificationMessages, realEstateMaster } from "../db/schema.js";

/**
 * display_board: device config row per property, same delete+reinsert
 * pattern as stp/solar_energy/rainwater_harvesting/waste_related.
 *
 * NOTE: several older legacy queries reference description/remarks/status
 * text columns that don't exist in the current schema (only status,
 * points_dis, remarks_dis, install_date do) - this model targets the
 * current schema shape only. If those older columns are actually still
 * needed, the table will need a migration to add them back.
 */
export const DisplayBoardModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${displayBoard.id})` }).from(displayBoard);
    return (Number(row?.maxId) || 0) + 1;
  },

  async getByRealEstate(realEstateId) {
    const rows = await db
      .select()
      .from(displayBoard)
      .where(eq(displayBoard.realEstateId, realEstateId))
      .orderBy(desc(displayBoard.id));
    return rows[0] ?? null;
  },

  async getStatus(realEstateId) {
    const [row] = await db
      .select({ status: displayBoard.status })
      .from(displayBoard)
      .where(eq(displayBoard.realEstateId, realEstateId))
      .limit(1);
    return row?.status ?? null;
  },

  async upsert({ status, pointsDis, remarksDis, realEstateId, installDate }) {
    await db.delete(displayBoard).where(eq(displayBoard.realEstateId, realEstateId));

    const id = await this.getNextId();
    await db.insert(displayBoard).values({
      id,
      status: status ?? "",
      pointsDis: pointsDis ?? 0,
      remarksDis: remarksDis ?? "",
      realEstateId,
      installDate: installDate ?? new Date(),
    });

    return id;
  },
};

/**
 * autocomposter: per-date production log entries (same shape as
 * waste_collection/solar_generation - full CRUD, manual id increment,
 * date-range + LIKE filtering, distinct-year listing for charts).
 */
export const AutocomposterModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${autocomposter.id})` }).from(autocomposter);
    return (Number(row?.maxId) || 0) + 1;
  },

  async create({ dt, totCompostProduction, totHours, realEstateId }) {
    const id = await this.getNextId();
    await db.insert(autocomposter).values({ id, dt, totCompostProduction, totHours, realEstateId });
    return id;
  },

  async getById(id, realEstateId) {
    const [row] = await db
      .select()
      .from(autocomposter)
      .where(and(eq(autocomposter.id, id), eq(autocomposter.realEstateId, realEstateId)))
      .limit(1);
    return row ?? null;
  },

  async remove(id, realEstateId) {
    const existing = await this.getById(id, realEstateId);
    if (!existing) return null;
    await db
      .delete(autocomposter)
      .where(and(eq(autocomposter.id, id), eq(autocomposter.realEstateId, realEstateId)));
    return existing;
  },

  async listByRealEstate(realEstateId) {
    const query = db
      .select({
        id: autocomposter.id,
        dt: autocomposter.dt,
        totCompostProduction: autocomposter.totCompostProduction,
        totHours: autocomposter.totHours,
        realEstateId: autocomposter.realEstateId,
        realEstateName: realEstateMaster.realEstateName,
      })
      .from(autocomposter)
      .leftJoin(realEstateMaster, eq(autocomposter.realEstateId, realEstateMaster.id));

    if (realEstateId === 0) return query;
    return query.where(eq(autocomposter.realEstateId, realEstateId));
  },

  async listByDateRange(realEstateId, fromDate, toDate) {
    const query = db
      .select({
        id: autocomposter.id,
        dt: autocomposter.dt,
        totCompostProduction: autocomposter.totCompostProduction,
        totHours: autocomposter.totHours,
        realEstateId: autocomposter.realEstateId,
        realEstateName: realEstateMaster.realEstateName,
      })
      .from(autocomposter)
      .leftJoin(realEstateMaster, eq(autocomposter.realEstateId, realEstateMaster.id));

    if (realEstateId === 0) {
      return query.where(between(autocomposter.dt, fromDate, toDate));
    }
    return query.where(
      and(eq(autocomposter.realEstateId, realEstateId), between(autocomposter.dt, fromDate, toDate))
    );
  },

  async listByDateLike(realEstateId, datePattern) {
    return db
      .select()
      .from(autocomposter)
      .where(and(eq(autocomposter.realEstateId, realEstateId), like(autocomposter.dt, `%${datePattern}%`)));
  },

  /** select distinct(year(dt)) as dtname from autocomposter where real_estate_id=... and DATE(dt) between ... */
  async listDistinctYears(realEstateId, fromDate, toDate) {
    const rows = await db
      .select({ year: sql`DISTINCT YEAR(${autocomposter.dt})` })
      .from(autocomposter)
      .where(
        and(eq(autocomposter.realEstateId, realEstateId), between(autocomposter.dt, fromDate, toDate))
      );
    return rows.map((r) => Number(r.year));
  },

  /** select dt from autocomposter where real_estate_id=... and DATE(dt) between ... and YEAR(dt)=... */
  async listDatesByYear(realEstateId, fromDate, toDate, year) {
    const rows = await db
      .select({ dt: autocomposter.dt })
      .from(autocomposter)
      .where(
        and(
          eq(autocomposter.realEstateId, realEstateId),
          between(autocomposter.dt, fromDate, toDate),
          sql`YEAR(${autocomposter.dt}) = ${year}`
        )
      );
    return rows.map((r) => r.dt);
  },
};

/**
 * notification_messages: simple per-property notification/messaging
 * system with a reply mechanism (`extraa` references the id of the
 * message being replied to) and a read/unread-style `flag` toggle.
 */
export const NotificationMessagesModel = {
  async getNextId() {
    const [row] = await db
      .select({ maxId: sql`MAX(${notificationMessages.id})` })
      .from(notificationMessages);
    return (Number(row?.maxId) || 0) + 1;
  },

  async create({ description, subject, dateN, timeN, realEstateId, extraa, userType }) {
    const id = await this.getNextId();
    await db.insert(notificationMessages).values({
      id,
      description,
      subject,
      flag: 0,
      dateN: dateN ?? new Date(),
      timeN: timeN ?? "00:00:00",
      realEstateId,
      extraa: extraa ?? 0,
      userType: userType ?? "",
    });
    return id;
  },

  /**
   * Mirrors the "reply" insert variant, which sets subject='notification_reply',
   * flag=1, and extraa=<id of the message being replied to>.
   */
  async createReply({ description, dateN, timeN, realEstateId, replyToId, userType }) {
    const id = await this.getNextId();
    await db.insert(notificationMessages).values({
      id,
      description,
      subject: "notification_reply",
      flag: 1,
      dateN: dateN ?? new Date(),
      timeN: timeN ?? "00:00:00",
      realEstateId,
      extraa: replyToId,
      userType: userType ?? "",
    });
    return id;
  },

  async getById(id) {
    const [row] = await db
      .select()
      .from(notificationMessages)
      .where(eq(notificationMessages.id, id))
      .limit(1);
    return row ?? null;
  },

  /** update notification_messages set flag=1 where id='$id' (mark as read/replied) */
  async markFlag(id, flag = 1) {
    await db.update(notificationMessages).set({ flag }).where(eq(notificationMessages.id, id));
  },

  async update(id, { description }) {
    const existing = await this.getById(id);
    if (!existing) return null;
    await db.update(notificationMessages).set({ description }).where(eq(notificationMessages.id, id));
    return { id, description };
  },

  async remove(id, realEstateId) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const conditions = realEstateId
      ? and(eq(notificationMessages.id, id), eq(notificationMessages.realEstateId, realEstateId))
      : eq(notificationMessages.id, id);

    await db.delete(notificationMessages).where(conditions);
    return existing;
  },

  /** select * from notification_messages where user_type='real_estate' and flag=0 ORDER BY date_n,time_n DESC */
  async listUnreadByUserType(userType) {
    return db
      .select()
      .from(notificationMessages)
      .where(and(eq(notificationMessages.userType, userType), eq(notificationMessages.flag, 0)))
      .orderBy(notificationMessages.dateN, desc(notificationMessages.timeN));
  },

  async listByRealEstateAndSubject(realEstateId, subject) {
    return db
      .select()
      .from(notificationMessages)
      .where(and(eq(notificationMessages.realEstateId, realEstateId), eq(notificationMessages.subject, subject)));
  },

  /**
   * select * from notification_messages n,real_estate_master r
   * where n.real_estate_id=r.id and r.real_estate_name like '%$name%'
   * and n.user_type='real_estate' [and n.subject='$sub']
   * (admin search across all notifications by property name, optionally
   * filtered by subject)
   */
  async searchByPropertyName(userType, nameSearch, subject) {
    const conditions = [eq(notificationMessages.userType, userType)];
    if (nameSearch) conditions.push(like(realEstateMaster.realEstateName, `%${nameSearch}%`));
    if (subject) conditions.push(eq(notificationMessages.subject, subject));

    return db
      .select({
        id: notificationMessages.id,
        description: notificationMessages.description,
        subject: notificationMessages.subject,
        flag: notificationMessages.flag,
        dateN: notificationMessages.dateN,
        timeN: notificationMessages.timeN,
        realEstateId: notificationMessages.realEstateId,
        realEstateName: realEstateMaster.realEstateName,
      })
      .from(notificationMessages)
      .innerJoin(realEstateMaster, eq(notificationMessages.realEstateId, realEstateMaster.id))
      .where(and(...conditions));
  },

  /**
   * select * from notification_messages where real_estate_id='$id' and
   * subject='notification' and id not in (select extraa from notification_messages)
   * (find notifications that have NOT yet received a reply - replies
   * record the original message's id in their own `extraa` column)
   */
  async listUnrepliedNotifications(realEstateId) {
    const repliedIds = db.select({ extraa: notificationMessages.extraa }).from(notificationMessages);

    return db
      .select()
      .from(notificationMessages)
      .where(
        and(
          eq(notificationMessages.realEstateId, realEstateId),
          eq(notificationMessages.subject, "notification"),
          notInArray(notificationMessages.id, repliedIds)
        )
      );
  },
};
