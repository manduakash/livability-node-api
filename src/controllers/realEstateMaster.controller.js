import { response } from "../utils/response.js";
import { RealEstateMasterModel } from "../models/realEstateMaster.model.js";
import { logAudit } from "../utils/auditLog.js";

/** GET /api/:portal/real-estate/:id */
export async function getById(req, res) {
  try {
    const id = Number(req.params.id);
    const row = await RealEstateMasterModel.getById(id);
    if (!row) return response.error(res, "Property not found", 404);
    return response.success(res, "Property fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch property: ${err.message}`);
  }
}

/**
 * GET /api/:portal/real-estate?state=&district=&name=&nameLike=&status=&delStatus=&page=&pageSize=
 * Replaces the ~200 near-duplicate "list properties" SELECT shapes found
 * across the legacy codebase.
 */
export async function search(req, res) {
  try {
    const { state, district, name, nameLike, status } = req.query;
    const delStatus = req.query.delStatus !== undefined ? Number(req.query.delStatus) : undefined;
    const page = req.query.page !== undefined ? Number(req.query.page) : undefined;
    const pageSize = Number(req.query.pageSize) || 10;

    const [rows, total] = await Promise.all([
      RealEstateMasterModel.search({
        state,
        district,
        realEstateName: name,
        nameLike,
        status,
        delStatus,
        page,
        pageSize,
      }),
      RealEstateMasterModel.countSearch({ state, district, realEstateName: name, nameLike, status, delStatus }),
    ]);

    return response.success(res, "Properties fetched", { rows, total, page, pageSize });
  } catch (err) {
    return response.error(res, `Failed to fetch properties: ${err.message}`);
  }
}

/** GET /api/:portal/real-estate/states - distinct states with at least one property */
export async function listDistinctStates(req, res) {
  try {
    const states = await RealEstateMasterModel.listDistinctStates();
    return response.success(res, "Distinct states fetched", states);
  } catch (err) {
    return response.error(res, `Failed to fetch distinct states: ${err.message}`);
  }
}

/** POST /api/:portal/real-estate - the ~80-field registration form */
export async function create(req, res) {
  try {
    const { realEstateName } = req.body;
    if (!realEstateName) return response.error(res, "realEstateName is required", 400);

    const existing = await RealEstateMasterModel.getByName(realEstateName);
    if (existing) {
      return response.error(res, "A property with this name already exists", 409);
    }

    const id = await RealEstateMasterModel.create(req.body);

    await logAudit(req, {
      type: "ADD",
      lnk: "add_real_estate_master_admin.php",
      panel: req.portal.toUpperCase(),
      module: `Add_real_estate_${realEstateName}`,
    });

    return response.success(res, "Property created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create property: ${err.message}`);
  }
}

/** PUT /api/:portal/real-estate/:id - full edit */
export async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await RealEstateMasterModel.update(id, req.body);
    if (!result) return response.error(res, "Property not found", 404);

    await logAudit(req, {
      type: "EDIT",
      lnk: "edit_real_estate_master_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_real_estate_master",
    });

    return response.success(res, "Property updated", result);
  } catch (err) {
    return response.error(res, `Failed to update property: ${err.message}`);
  }
}

/** PATCH /api/:portal/real-estate/:id/status  { status: 'active' | 'inactive' } */
export async function setStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return response.error(res, "status must be 'active' or 'inactive'", 400);
    }

    await RealEstateMasterModel.setStatus(id, status);

    await logAudit(req, {
      type: "EDIT",
      lnk: "real_estate_status_toggle.php",
      panel: req.portal.toUpperCase(),
      module: `Set_status_${status}`,
    });

    return response.success(res, "Property status updated", { id, status });
  } catch (err) {
    return response.error(res, `Failed to update property status: ${err.message}`);
  }
}

/** PATCH /api/:portal/real-estate/:id/geo-location  { location } */
export async function updateGeoLocation(req, res) {
  try {
    const id = Number(req.params.id);
    const { location } = req.body;
    if (!location) return response.error(res, "location is required", 400);

    await RealEstateMasterModel.updateGeoLocation(id, location);
    return response.success(res, "Geo-location updated", { id, location });
  } catch (err) {
    return response.error(res, `Failed to update geo-location: ${err.message}`);
  }
}

/** DELETE /api/:portal/real-estate/:id/gst-doc - clears the uploaded GST doc reference */
export async function clearGstDoc(req, res) {
  try {
    const id = Number(req.params.id);
    await RealEstateMasterModel.clearGstDoc(id);
    return response.success(res, "GST document cleared", { id });
  } catch (err) {
    return response.error(res, `Failed to clear GST document: ${err.message}`);
  }
}

/** DELETE /api/:portal/real-estate/:id/profile-photo */
export async function clearProfilePhoto(req, res) {
  try {
    const id = Number(req.params.id);
    await RealEstateMasterModel.clearProfilePhoto(id);
    return response.success(res, "Profile photo cleared", { id });
  } catch (err) {
    return response.error(res, `Failed to clear profile photo: ${err.message}`);
  }
}

/** PATCH /api/:portal/real-estate/:id/soft-delete  { deleted: true|false } */
export async function setDelStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { deleted } = req.body;

    await RealEstateMasterModel.setDelStatus(id, deleted ? 1 : 0);

    await logAudit(req, {
      type: deleted ? "DELETE" : "EDIT",
      lnk: "real_estate_soft_delete.php",
      panel: req.portal.toUpperCase(),
      module: deleted ? "Soft_delete_real_estate" : "Restore_real_estate",
    });

    return response.success(res, deleted ? "Property soft-deleted" : "Property restored", { id });
  } catch (err) {
    return response.error(res, `Failed to update delete status: ${err.message}`);
  }
}

/** DELETE /api/:portal/real-estate/:id - hard delete */
export async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await RealEstateMasterModel.remove(id);
    if (!existing) return response.error(res, "Property not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "real_estate_master_delete.php",
      panel: req.portal.toUpperCase(),
      module: `Delete_real_estate_${existing.realEstateName}`,
    });

    return response.success(res, "Property deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete property: ${err.message}`);
  }
}
