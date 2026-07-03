import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { userMaster } from "../db/schema.js";

/**
 * Mirrors set_login.php:
 *   SELECT * FROM user_master WHERE user_id='$log_user' AND password='$log_pass'
 *   -> checks status==1, branches on user_type ('admin' | 'pcb' | 'real_estate')
 *
 * NOTE: the legacy table stores passwords in Base64 (btoa). This is preserved
 * for compatibility with existing rows.
 */
export const AuthModel = {
  async findActiveUser(userName, password) {
    const rows = await db
      .select()
      .from(userMaster)
      .where(
        and(
          eq(userMaster.userId, userName),
          eq(userMaster.password, btoa(password))
        )
      )
      .limit(1);

    const user = rows[0];
    if (!user || user.status !== 1) return null;

    return user;
  },
};