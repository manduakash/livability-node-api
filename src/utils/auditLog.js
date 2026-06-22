import { db } from "../db/index.js";
import { auditTrial } from "../db/schema.js";
import { nowIST } from "./dateTime.js";

/**
 * Mirrors the repeated legacy block found in almost every add/edit/delete
 * PHP file:
 *
 *   $ip = $_SERVER['REMOTE_ADDR'];
 *   $data = getBrowser();
 *   $browser = $data['name'].$data['version'];
 *   $device = $data['platform'];
 *   $date1 = date('Y-m-d H:i:s');
 *   $userid = $_SESSION['user_id'];
 *   $username = $_SESSION['user_name'];
 *   $usertype = $_SESSION['user_type']; // admin: lowercase, pcb/real_estate: strtoupper()
 *   $module = "Add_trees_" . $real_estate_name;
 *   INSERT INTO audit_trial(date1,type,user_id,lnk,ip,panel,module,real_estate_name,browser,device) VALUES (...)
 *
 * `req` is the Express request - req.user is populated by the auth
 * middleware (see middleware/auth.js), req.deviceInfo by the
 * deviceInfo middleware (see middleware/deviceInfo.js).
 */
export async function logAudit(req, { type, lnk, panel, module, realEstateName }) {
  const userId = req.user?.userId ?? "";
  const username = req.user?.username ?? "";

  await db.insert(auditTrial).values({
    date1: nowIST(),
    type, // 'ADD' | 'EDIT' | 'DELETE' | ...
    userId: String(userId),
    lnk,
    ip: req.ip || req.headers["x-forwarded-for"] || "",
    panel, // 'ADMIN' | 'PCB' | 'REAL_ESTATE'
    module, // legacy convention: `${Type}_${moduleName}_${realEstateName}` e.g. "Add_trees_Swan Court"
    realEstateName: username, // legacy quirk: this column actually stores the logged-in username, not the property name
    browser: req.deviceInfo?.browser ?? "",
    device: req.deviceInfo?.platform ?? "",
  });
}
