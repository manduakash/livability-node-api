import { response } from "../utils/response.js";
import { logAudit } from "../utils/auditLog.js";

/**
 * Generates list/create/update/delete handlers for a simple master model
 * (created via models/simpleMasterFactory.js). `entityLabel` is used in
 * response messages and audit log module names (e.g. "industry type",
 * "Industry_Type").
 */
export function createSimpleMasterController(model, { entityLabel, auditModuleName, lnkPrefix }) {
  return {
    async list(req, res) {
      try {
        const rows = await model.list();
        return response.success(res, `${entityLabel} list fetched`, rows);
      } catch (err) {
        return response.error(res, `Failed to fetch ${entityLabel} list: ${err.message}`);
      }
    },

    async getOne(req, res) {
      try {
        const row = await model.getById(Number(req.params.id));
        if (!row) return response.error(res, `${entityLabel} not found`, 404);
        return response.success(res, `${entityLabel} fetched`, row);
      } catch (err) {
        return response.error(res, `Failed to fetch ${entityLabel}: ${err.message}`);
      }
    },

    async create(req, res) {
      try {
        const { name } = req.body;
        if (!name) return response.error(res, "name is required", 400);

        const result = await model.create(name);
        if (!result.created) {
          return response.success(res, `${entityLabel} already exists, skipped (duplicate)`, result);
        }

        await logAudit(req, {
          type: "ADD",
          lnk: `add_${lnkPrefix}.php`,
          panel: req.portal.toUpperCase(),
          module: `Add_${auditModuleName}`,
        });

        return response.success(res, `${entityLabel} created`, result, 201);
      } catch (err) {
        return response.error(res, `Failed to create ${entityLabel}: ${err.message}`);
      }
    },

    async update(req, res) {
      try {
        const id = Number(req.params.id);
        const { name } = req.body;
        if (!name) return response.error(res, "name is required", 400);

        const result = await model.update(id, name);
        if (!result) return response.error(res, `${entityLabel} not found`, 404);

        await logAudit(req, {
          type: "EDIT",
          lnk: `edit_${lnkPrefix}.php`,
          panel: req.portal.toUpperCase(),
          module: `Edit_${auditModuleName}`,
        });

        return response.success(res, `${entityLabel} updated`, result);
      } catch (err) {
        return response.error(res, `Failed to update ${entityLabel}: ${err.message}`);
      }
    },

    async remove(req, res) {
      try {
        const id = Number(req.params.id);
        const existing = await model.remove(id);
        if (!existing) return response.error(res, `${entityLabel} not found`, 404);

        await logAudit(req, {
          type: "DELETE",
          lnk: `delete_${lnkPrefix}.php`,
          panel: req.portal.toUpperCase(),
          module: `Delete_${auditModuleName}`,
        });

        return response.success(res, `${entityLabel} deleted`, existing);
      } catch (err) {
        return response.error(res, `Failed to delete ${entityLabel}: ${err.message}`);
      }
    },
  };
}
