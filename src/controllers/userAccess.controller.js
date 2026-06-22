import { response } from "../utils/response.js";
import { UserAccessModel, PERMISSION_LEVELS } from "../models/userAccess.model.js";

/** GET /api/:portal/user-access?menu=daily_inputs */
export async function listAccess(req, res) {
  try {
    const { menu } = req.query;
    const rows = menu ? await UserAccessModel.listByMenu(menu) : await UserAccessModel.listAll();
    return response.success(res, "User access rules fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch user access rules: ${err.message}`);
  }
}

/** GET /api/:portal/user-access/:menu/:submenu */
export async function getAccess(req, res) {
  try {
    const { menu, submenu } = req.params;
    const row = await UserAccessModel.get(menu, submenu);
    if (!row) return response.error(res, "No access rule found for this menu/submenu", 404);
    return response.success(res, "Access rule fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch access rule: ${err.message}`);
  }
}

/** PUT /api/:portal/user-access/:menu/:submenu  { level } */
export async function setAccess(req, res) {
  try {
    const { menu, submenu } = req.params;
    const { level } = req.body;

    if (!PERMISSION_LEVELS.includes(level)) {
      return response.error(res, `level must be one of: ${PERMISSION_LEVELS.join(", ")}`, 400);
    }

    const id = await UserAccessModel.set(menu, submenu, level);
    return response.success(res, "Access rule saved", { id, menu, submenu, level });
  } catch (err) {
    return response.error(res, `Failed to save access rule: ${err.message}`);
  }
}

/**
 * PUT /api/:portal/user-access  { items: [{ menu, submenu, level }, ...] }
 * Saves several access rules in one call (mirrors the legacy form that
 * submits all submenu permissions for a menu at once).
 */
export async function setManyAccess(req, res) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return response.error(res, "items must be a non-empty array", 400);
    }

    for (const item of items) {
      if (!PERMISSION_LEVELS.includes(item.level)) {
        return response.error(
          res,
          `Invalid level "${item.level}" for ${item.menu}/${item.submenu}. Must be one of: ${PERMISSION_LEVELS.join(", ")}`,
          400
        );
      }
    }

    const ids = await UserAccessModel.setMany(items);
    return response.success(res, "Access rules saved", { ids });
  } catch (err) {
    return response.error(res, `Failed to save access rules: ${err.message}`);
  }
}

/** DELETE /api/:portal/user-access/:menu/:submenu */
export async function removeAccess(req, res) {
  try {
    const { menu, submenu } = req.params;
    const existing = await UserAccessModel.remove(menu, submenu);
    if (!existing) return response.error(res, "No access rule found for this menu/submenu", 404);
    return response.success(res, "Access rule removed", existing);
  } catch (err) {
    return response.error(res, `Failed to remove access rule: ${err.message}`);
  }
}
