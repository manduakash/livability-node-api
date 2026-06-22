import { and, between, count, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { auditTrial } from "../db/schema.js";

/**
 * audit_trial: the write side (INSERT on every add/edit/delete action) is
 * already covered by utils/auditLog.js's logAudit(), used throughout the
 * codebase. This model covers the read/reporting side - the admin audit
 * log viewer, filterable by date range and by the logged-in username
 * (recall: real_estate_name actually stores the username, a legacy quirk
 * documented in auditLog.js), with pagination.
 */
export const AuditTrialModel = {
  /**
   * select * from audit_trial where date(date1) between '$d1' and '$d2'
   * [and real_estate_name='$user'] order by id desc [limit offset,10]
   */
  async search({ fromDate, toDate, username, page, pageSize = 10 } = {}) {
    const conditions = [];
    if (fromDate && toDate) {
      conditions.push(between(sql`DATE(${auditTrial.date1})`, fromDate, toDate));
    }
    if (username) conditions.push(eq(auditTrial.realEstateName, username));

    let query = db
      .select()
      .from(auditTrial)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditTrial.id));

    if (page !== undefined) {
      query = query.limit(pageSize).offset(page * pageSize);
    }

    return query;
  },

  async countSearch({ fromDate, toDate, username } = {}) {
    const conditions = [];
    if (fromDate && toDate) {
      conditions.push(between(sql`DATE(${auditTrial.date1})`, fromDate, toDate));
    }
    if (username) conditions.push(eq(auditTrial.realEstateName, username));

    const [row] = await db
      .select({ total: count() })
      .from(auditTrial)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return Number(row?.total) || 0;
  },
};
