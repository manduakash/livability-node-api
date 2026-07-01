import { response } from "../utils/response.js";
import { TreesModel } from "../models/trees.model.js";
import { logAudit } from "../utils/auditLog.js";

/**
 * GET /api/:portal/trees?realEstateId=1
 * Replaces: trees_admin.php, trees_pcb.php, set_trees_real.php (listing fragment)
 * and the table-rendering part of trees_master_listing.php
 */
export async function list(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);

    const rows = await TreesModel.listByRealEstate(realEstateId);
    return response.success(res, "Trees fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch trees: ${err.message}`);
  }
}

/**
 * GET /api/:portal/trees/:id
 * Replaces the "select * from trees where id=" lookup in edit_trees_master_listing.php
 */
export async function getOne(req, res) {
  try {
    const row = await TreesModel.getById(Number(req.params.id));
    if (!row) return response.error(res, "Tree record not found", 404);
    return response.success(res, "Tree record fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch tree record: ${err.message}`);
  }
}

/**
 * POST /api/:portal/trees  { botName, comName, quantity, realEstateId }
 * Replaces: add_trees_master_listing.php (all 3 portals)
 */
export async function create(req, res) {
  try {
    const { botName, comName, quantity, realEstateId } = req.body;

    if (!botName || !comName || !quantity || !realEstateId) {
      return response.error(
        res,
        "botName, comName, quantity, and realEstateId are required",
        400
      );
    }

    const result = await TreesModel.create({
      botName,
      comName,
      quantity: Number(quantity),
      realEstateId: Number(realEstateId),
    });

    if (!result.created) {
      return response.success(res, "Record already exists, skipped (duplicate)", result);
    }

    const realEstateName = await TreesModel.getRealEstateName(Number(realEstateId));
    await logAudit(req, {
      type: "ADD",
      lnk: "add_trees_master_listing.php",
      panel: req.portal.toUpperCase(),
      module: `Add_trees_${realEstateName}`,
    });

    return response.success(res, "Tree record created", result, 201);
  } catch (err) {
    return response.error(res, `Failed to create tree record: ${err.message}`);
  }
}

/**
 * PUT /api/:portal/trees/:id  { botName, comName, quantity, realEstateId }
 * Replaces: edit_trees_master_listing.php (all 3 portals)
 */
export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { botName, comName, quantity, realEstateId } = req.body;

    if (!botName || !comName || !quantity || !realEstateId) {
      return response.error(
        res,
        "botName, comName, quantity, and realEstateId are required",
        400
      );
    }

    const result = await TreesModel.update(id, {
      botName,
      comName,
      quantity: Number(quantity),
      realEstateId: Number(realEstateId),
    });

    if (!result.created) {
      return response.success(res, "Record already exists, skipped (duplicate)", result);
    }

    const realEstateName = await TreesModel.getRealEstateName(Number(realEstateId));
    await logAudit(req, {
      type: "EDIT",
      lnk: "edit_trees_master_listing.php",
      panel: req.portal.toUpperCase(),
      module: `Edit_trees_${realEstateName}`,
    });

    return response.success(res, "Tree record updated", result);
  } catch (err) {
    return response.error(res, `Failed to update tree record: ${err.message}`);
  }
}

/**
 * DELETE /api/:portal/trees/:id
 * Replaces the id_for_delete branch in trees_master_listing.php (all 3 portals)
 */
export async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await TreesModel.remove(id);

    if (!existing) {
      return response.error(res, "Tree record not found", 404);
    }

    const realEstateName = await TreesModel.getRealEstateName(existing.realEstateId);
    await logAudit(req, {
      type: "DELETE",
      lnk: "trees_master_listing.php",
      panel: req.portal.toUpperCase(),
      module: `Delete_trees_${realEstateName}`,
    });

    return response.success(res, "Tree record deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete tree record: ${err.message}`);
  }
}
