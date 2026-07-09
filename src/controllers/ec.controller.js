import { response } from "../utils/response.js";
import { EcModuleModel, EcSanctionModel } from "../models/ec.model.js";
import { logAudit } from "../utils/auditLog.js";

// --- ec_module ---

/** GET /api/:portal/ec-module?realEstateId=1 */
export async function listEcModule(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);

    const rows = await EcModuleModel.listByRealEstate(realEstateId);
    return response.success(res, "EC module records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch EC module records: ${err.message}`);
  }
}

/** GET /api/:portal/ec-module/search?state=&district=&name= */
export async function searchEcModule(req, res) {
  try {
    const { state, district, name } = req.query;
    const rows = await EcModuleModel.search({ state, district, nameSearch: name });
    return response.success(res, "EC module search results", rows);
  } catch (err) {
    return response.error(res, `Failed to search EC module records: ${err.message}`);
  }
}

/** GET /api/:portal/ec-module/paginated?page=0&pageSize=10 */
export async function listEcModulePaginated(req, res) {
  try {
    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;

    const [rows, total] = await Promise.all([
      EcModuleModel.listPaginated(page * pageSize, pageSize),
      EcModuleModel.countAll(),
    ]);

    return response.success(res, "EC module records fetched", { rows, total, page, pageSize });
  } catch (err) {
    return response.error(res, `Failed to fetch EC module records: ${err.message}`);
  }
}

/** GET /api/:portal/ec-module/:id?realEstateId=1 */
export async function getEcModule(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;

    const row = await EcModuleModel.getById(id, realEstateId);
    if (!row) return response.error(res, "EC module record not found", 404);
    return response.success(res, "EC module record fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch EC module record: ${err.message}`);
  }
}

/** POST /api/:portal/ec-module */
export async function createEcModule(req, res) {
  try {
    const { realEstateId } = req.body;
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const id = await EcModuleModel.create(req.body);

    await logAudit(req, {
      type: "ADD",
      lnk: "add_ec_module_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_ec_module",
    });

    return response.success(res, "EC module record created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create EC module record: ${err.message}`);
  }
}

/** PATCH /api/:portal/ec-module/:realEstateId/upload  { path } */
export async function setEcModuleUpload(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const { path } = req.body;

    await EcModuleModel.setUploadEc(realEstateId, path ?? "");
    return response.success(res, "EC module upload path updated", { realEstateId, path: path ?? "" });
  } catch (err) {
    return response.error(res, `Failed to update EC module upload path: ${err.message}`);
  }
}

/** DELETE /api/:portal/ec-module/:id?realEstateId=1 */
export async function removeEcModule(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;

    const existing = await EcModuleModel.remove(id, realEstateId);
    if (!existing) return response.error(res, "EC module record not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "ec_module_delete.php",
      panel: req.portal.toUpperCase(),
      module: "Delete_ec_module",
    });

    return response.success(res, "EC module record deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete EC module record: ${err.message}`);
  }
}

// --- ec_sanction ---

/** GET /api/:portal/ec-sanction?realEstateId=1 */
export async function listEcSanction(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId is required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);

    const rows = await EcSanctionModel.listByRealEstate(realEstateId);
    return response.success(res, "EC sanction records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch EC sanction records: ${err.message}`);
  }
}

/** GET /api/:portal/ec-sanction/search?state=&district= */
export async function searchEcSanction(req, res) {
  try {
    const { state, district } = req.query;
    const rows = await EcSanctionModel.search({ state, district });
    return response.success(res, "EC sanction search results", rows);
  } catch (err) {
    return response.error(res, `Failed to search EC sanction records: ${err.message}`);
  }
}

/** POST /api/:portal/ec-sanction  { realEstateId, date1, sancLett, vidLetterNo, projectLocation } */
export async function createEcSanction(req, res) {
  try {
    const { realEstateId, date1, sancLett, vidLetterNo, projectLocation } = req.body;
    if (!realEstateId || !date1) return response.error(res, "realEstateId and date1 are required", 400);

    const id = await EcSanctionModel.create({
      realEstateId: Number(realEstateId),
      date1,
      sancLett: sancLett ?? "",
      vidLetterNo: vidLetterNo ?? "",
      projectLocation: projectLocation ?? "",
    });

    await logAudit(req, {
      type: "ADD",
      lnk: "add_ec_sanction_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_ec_sanction",
    });

    return response.success(res, "EC sanction record created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create EC sanction record: ${err.message}`);
  }
}

/** PUT /api/:portal/ec-sanction/:id?realEstateId=1 */
export async function updateEcSanction(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = Number(req.query.realEstateId);
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const result = await EcSanctionModel.update(id, realEstateId, req.body);
    if (!result) return response.error(res, "EC sanction record not found", 404);

    await logAudit(req, {
      type: "EDIT",
      lnk: "edit_ec_sanction_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_ec_sanction",
    });

    return response.success(res, "EC sanction record updated", result);
  } catch (err) {
    return response.error(res, `Failed to update EC sanction record: ${err.message}`);
  }
}

/** DELETE /api/:portal/ec-sanction/:id?realEstateId=1 */
export async function removeEcSanction(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = Number(req.query.realEstateId);
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const existing = await EcSanctionModel.remove(id, realEstateId);
    if (!existing) return response.error(res, "EC sanction record not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "ec_sanction_delete.php",
      panel: req.portal.toUpperCase(),
      module: "Delete_ec_sanction",
    });

    return response.success(res, "EC sanction record deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete EC sanction record: ${err.message}`);
  }
}
