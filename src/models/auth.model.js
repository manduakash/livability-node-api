import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { userMaster } from "../db/schema.js";

/**
 * Mirrors set_login.php:
 *   SELECT * FROM user_master WHERE user_id='$log_user' AND password='$log_pass'
 *   -> checks status==1, branches on user_type ('admin' | 'pcb' | 'real_estate')
 *
 * NOTE: the legacy table stores passwords in plain text (no hashing). This
 * is preserved here for drop-in compatibility with existing rows; strongly
 * recommend migrating to bcrypt hashes - see README "Security notes".
 */
export const AuthModel = {
  async findActiveUser(userId, password) {
    const rows = await db
      .select()
      .from(userMaster)
      .where(and(eq(userMaster.userId, userId), eq(userMaster.password, password)))
      .limit(1);

    const user = rows[0];
    if (!user || user.status !== 1) return null;

    return user;
  },
};
