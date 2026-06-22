import { response } from "../utils/response.js";
import {
  EcMonitoringMicroAnaModel,
  EcMonitoringChemAnaModel,
  EcModuleProjectViewModel,
  EcModuleFieldPhotographModel,
  EcRemedialModel,
  EcInterMonTestModel,
} from "../models/ecSubTables.model.js";
import { logAudit } from "../utils/auditLog.js";

// --- microbial analysis ---

export async function listMicroAna(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;
    const rows = await EcMonitoringMicroAnaModel.listForEcModule(ecModuleId, realEstateId);
    return response.success(res, "Microbial analysis records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch microbial analysis records: ${err.message}`);
  }
}

export async function setMicroAna(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const microbialAnalysis = Number(req.params.type);
    const { realEstateId, ...rest } = req.body;
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const id = await EcMonitoringMicroAnaModel.set({
      ...rest,
      realEstateId: Number(realEstateId),
      ecModuleId,
      microbialAnalysis,
    });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_ec_monitoring_micro_ana_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_ec_monitoring_micro_ana",
    });

    return response.success(res, "Microbial analysis record saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save microbial analysis record: ${err.message}`);
  }
}

// --- chemical analysis ---

export async function listChemAna(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const rows = await EcMonitoringChemAnaModel.listForEcModule(ecModuleId);
    return response.success(res, "Chemical analysis records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch chemical analysis records: ${err.message}`);
  }
}

export async function setChemAna(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const chemicalAnalysis = Number(req.params.type);
    const { realEstateId, ...rest } = req.body;
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const id = await EcMonitoringChemAnaModel.set({
      ...rest,
      realEstateId: Number(realEstateId),
      ecModuleId,
      chemicalAnalysis,
    });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_ec_monitoring_chem_ana_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_ec_monitoring_chem_ana",
    });

    return response.success(res, "Chemical analysis record saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save chemical analysis record: ${err.message}`);
  }
}

// --- project view / field photograph image galleries ---

export async function listProjectViewImages(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const rows = await EcModuleProjectViewModel.listForEcModule(ecModuleId);
    return response.success(res, "Project view images fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch project view images: ${err.message}`);
  }
}

export async function replaceProjectViewImages(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const { realEstateId, images } = req.body;
    if (!realEstateId || !Array.isArray(images)) {
      return response.error(res, "realEstateId and an images array are required", 400);
    }

    const ids = await EcModuleProjectViewModel.replaceAll(ecModuleId, Number(realEstateId), images);

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_ec_module_project_view_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_ec_module_project_view",
    });

    return response.success(res, "Project view images saved", { ids });
  } catch (err) {
    return response.error(res, `Failed to save project view images: ${err.message}`);
  }
}

export async function listFieldPhotographs(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const rows = await EcModuleFieldPhotographModel.listForEcModule(ecModuleId);
    return response.success(res, "Field photographs fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch field photographs: ${err.message}`);
  }
}

export async function replaceFieldPhotographs(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const { realEstateId, images } = req.body;
    if (!realEstateId || !Array.isArray(images)) {
      return response.error(res, "realEstateId and an images array are required", 400);
    }

    const ids = await EcModuleFieldPhotographModel.replaceAll(ecModuleId, Number(realEstateId), images);

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_ec_module_field_photograph_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_ec_module_field_photograph",
    });

    return response.success(res, "Field photographs saved", { ids });
  } catch (err) {
    return response.error(res, `Failed to save field photographs: ${err.message}`);
  }
}

// --- remedial / inter-monitoring test ---

export async function getRemedial(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;

    const row = await EcRemedialModel.getForEcModule(ecModuleId, realEstateId);
    if (!row) return response.error(res, "No remedial record found", 404);
    return response.success(res, "Remedial record fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch remedial record: ${err.message}`);
  }
}

export async function upsertRemedial(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const id = await EcRemedialModel.upsert({ ...req.body, ecModuleId });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_ec_remedial_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_ec_remedial",
    });

    return response.success(res, "Remedial record saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save remedial record: ${err.message}`);
  }
}

export async function getInterMonTest(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;

    const row = await EcInterMonTestModel.getForEcModule(ecModuleId, realEstateId);
    if (!row) return response.error(res, "No inter-monitoring test record found", 404);
    return response.success(res, "Inter-monitoring test record fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch inter-monitoring test record: ${err.message}`);
  }
}

export async function upsertInterMonTest(req, res) {
  try {
    const ecModuleId = Number(req.params.ecModuleId);
    const id = await EcInterMonTestModel.upsert({ ...req.body, ecModuleId });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_ec_inter_mon_test_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_ec_inter_mon_test",
    });

    return response.success(res, "Inter-monitoring test record saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save inter-monitoring test record: ${err.message}`);
  }
}
