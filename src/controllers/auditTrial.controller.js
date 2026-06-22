import { response } from "../utils/response.js";
import { AuditTrialModel } from "../models/auditTrial.model.js";

/**
 * GET /api/:portal/audit-trail?from=&to=&username=&page=&pageSize=
 * Replaces the admin audit-log viewer pages.
 */
export async function search(req, res) {
  try {
    const { from, to, username } = req.query;
    const page = req.query.page !== undefined ? Number(req.query.page) : undefined;
    const pageSize = Number(req.query.pageSize) || 10;

    const [rows, total] = await Promise.all([
      AuditTrialModel.search({ fromDate: from, toDate: to, username, page, pageSize }),
      AuditTrialModel.countSearch({ fromDate: from, toDate: to, username }),
    ]);

    return response.success(res, "Audit trail fetched", { rows, total, page, pageSize });
  } catch (err) {
    return response.error(res, `Failed to fetch audit trail: ${err.message}`);
  }
}
