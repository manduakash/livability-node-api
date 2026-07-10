import { response } from "../utils/response.js";
import { EcModuleModel, EcSanctionModel } from "../models/ec.model.js";
import { RealEstateMasterModel } from "../models/realEstateMaster.model.js";
import { SessionMasterModel } from "../models/sessionMaster.model.js";
import { EcModuleConditionModel } from "../models/ecModuleCondition.model.js";
import {
  EcMonitoringMicroAnaModel,
  EcMonitoringChemAnaModel,
  EcRemedialModel,
  EcInterMonTestModel,
  EcModuleProjectViewModel,
  EcModuleFieldPhotographModel
} from "../models/ecSubTables.model.js";
import { logAudit } from "../utils/auditLog.js";

const CONSTRUCTION_CATEGORIES = [
  "facility_of_labourers",
  "steps_to_avoid_disturbance",
  "selection_of_materials_energy_efficiency",
  "water_body_conservation",
  "plantation_proposal",
  "water_supply",
  "sewage_treatment_plant",
  "storm_water_management",
  "rainwater_harvesting_scheme",
  "solid_waste_management",
  "transport_management"
];

const OPERATIONAL_CATEGORIES = [
  "water_supply",
  "sewerage_treatment_plant",
  "emission_from_dg_set",
  "ensure_energy_efficiency",
  "transport_management",
  "solid_waste_management",
  "others"
];

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
    const { real_estate_name, project_session } = req.body;
    if (!real_estate_name || !project_session) {
      return response.error(res, "real_estate_name and project_session are required", 400);
    }

    // Lookup real estate by name
    const realEstate = await RealEstateMasterModel.getByName(real_estate_name);
    if (!realEstate) {
      return response.error(res, `Real estate property not found: ${real_estate_name}`, 404);
    }
    const realEstateId = realEstate.id;

    // Split session info
    let fromSession = project_session;
    let toSession = project_session;
    if (project_session.includes("-")) {
      const parts = project_session.split("-");
      fromSession = parts[0].trim();
      toSession = parts[1].trim();
    } else if (project_session.includes("/")) {
      const parts = project_session.split("/");
      fromSession = parts[0].trim();
      toSession = parts[1].trim();
    }

    // Get or create session master to get sessionKey
    const sessionRes = await SessionMasterModel.create({
      realEstateId,
      fromSession,
      toSession
    });
    const sessionKey = sessionRes.row.sessionKey;

    // Handle files
    const proponentFile = req.files?.project_proponent_file?.path || req.body.project_proponent || "-";
    const googleMapFile = req.files?.location_google_map_file?.path || req.body.location_google_map || "-";
    const googleSatelliteFile = req.files?.location_google_satellite_file?.path || req.body.location_google_satellite || "-";

    // Insert to ec_module
    const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
    const ecModuleData = {
      realEstateId,
      session: project_session,
      monthOfSubmittion: currentMonth,
      videLetterNo: req.body.vide_letter_no || "-",
      projectProponent: proponentFile,
      projectLocation: req.body.project_location || "-",
      purposeReport: req.body.purpose_of_report || "-",
      methodReport: req.body.methodology_for_preparation || "-",
      abbreviations: req.body.abbreviations_symbols_used || "-",
      projectDetail: req.body.project_details || "-",
      consStatus: req.body.status_of_construction || "-",
      healthOccupation: req.body.health_occupational_safety_aspects || "-",
      locGmap: googleMapFile,
      locGsat: googleSatelliteFile,
      ecClear: req.body.environmental_clearance_letter_no || "-",
      waterQua: req.body.water_quality_report || "-",
      contactPp: req.body.contact_person_name_designation || "-",
      addPp: req.body.contact_address || "-",
      emailP: req.body.contact_email || "-",
      telFaxP: req.body.contact_telephone_fax || "-",
      envp: req.body.environmental_consultant_name || "-",
      uploadEc: req.body.upload_ec || "-",
      sessionKey
    };

    const ecModuleId = await EcModuleModel.create(ecModuleData);

    // Save Specific Conditions: Construction Phase
    if (Array.isArray(req.body.construction_phase_conditions)) {
      for (const cond of req.body.construction_phase_conditions) {
        const catIdx = CONSTRUCTION_CATEGORIES.indexOf(cond.category);
        if (catIdx !== -1) {
          await EcModuleConditionModel.set({
            realEstateId,
            ecModuleId,
            condition: 1,
            subCondition: 1,
            head: catIdx + 1,
            subHead1: cond.stipulated_condition,
            subHead2: cond.compliance_statement,
            sessionKey
          });
        }
      }
    }

    // Save Specific Conditions: Operational Phase
    if (Array.isArray(req.body.operational_phase_conditions)) {
      for (const cond of req.body.operational_phase_conditions) {
        const catIdx = OPERATIONAL_CATEGORIES.indexOf(cond.category);
        if (catIdx !== -1) {
          await EcModuleConditionModel.set({
            realEstateId,
            ecModuleId,
            condition: 1,
            subCondition: 2,
            head: catIdx + 1,
            subHead1: cond.stipulated_condition,
            subHead2: cond.compliance_statement,
            sessionKey
          });
        }
      }
    }

    // Save General Conditions
    if (Array.isArray(req.body.general_conditions)) {
      for (let i = 0; i < req.body.general_conditions.length; i++) {
        const cond = req.body.general_conditions[i];
        await EcModuleConditionModel.set({
          realEstateId,
          ecModuleId,
          condition: 2,
          subCondition: 0,
          head: i + 1,
          subHead1: cond.stipulated_condition,
          subHead2: cond.compliance_statement,
          sessionKey
        });
      }
    }

    // Save Other Conditions
    if (Array.isArray(req.body.other_conditions)) {
      for (let i = 0; i < req.body.other_conditions.length; i++) {
        const cond = req.body.other_conditions[i];
        await EcModuleConditionModel.set({
          realEstateId,
          ecModuleId,
          condition: 3,
          subCondition: 0,
          head: i + 1,
          subHead1: cond.stipulated_condition,
          subHead2: cond.compliance_statement,
          sessionKey
        });
      }
    }

    // Save Ground Water microbial/chemical datasets
    if (Array.isArray(req.body.microbial_analysis_10a)) {
      await EcMonitoringMicroAnaModel.setAll(
        ecModuleId,
        realEstateId,
        1,
        req.body.sample_location,
        req.body.sample_drawn_on,
        sessionKey,
        req.body.microbial_analysis_10a
      );
    }
    if (Array.isArray(req.body.microbial_analysis_11a_gw2)) {
      await EcMonitoringMicroAnaModel.setAll(
        ecModuleId,
        realEstateId,
        2,
        req.body.sample_location_2,
        req.body.sample_drawn_on_2,
        sessionKey,
        req.body.microbial_analysis_11a_gw2
      );
    }
    if (Array.isArray(req.body.chemical_analysis_10b)) {
      await EcMonitoringChemAnaModel.setAll(
        ecModuleId,
        realEstateId,
        1,
        req.body.sample_location,
        req.body.sample_drawn_on,
        sessionKey,
        req.body.chemical_analysis_10b
      );
    }
    if (Array.isArray(req.body.chemical_analysis_11b_gw2)) {
      await EcMonitoringChemAnaModel.setAll(
        ecModuleId,
        realEstateId,
        2,
        req.body.sample_location_2,
        req.body.sample_drawn_on_2,
        sessionKey,
        req.body.chemical_analysis_11b_gw2
      );
    }

    // Save Remedial Measures
    await EcRemedialModel.upsert({
      realEstateId,
      ecModuleId,
      result: req.body.remedial_measures_action || "",
      airQua: req.body.remedial_air_quality || "",
      noiseQua: req.body.remedial_noise_quality || "",
      waterQua: req.body.remedial_water_quality || "",
      sessionKey
    });

    // Save Inter Monitoring Test
    await EcInterMonTestModel.upsert({
      realEstateId,
      ecModuleId,
      result: req.body.interpretation_of_monitored_results || "",
      airQua: req.body.air_quality_interpretation || "",
      noiseQua: req.body.noise_quality_interpretation || "",
      waterQua: req.body.water_quality_interpretation || "",
      sessionKey
    });

    // Save current project views
    const projectViews = [];
    if (req.files) {
      for (let i = 0; i < 30; i++) {
        const fileKey = `current_project_views[${i}][project_image_file]`;
        const titleKey = `current_project_views[${i}][image_title]`;
        const fileObj = req.files[fileKey];
        const title = req.body[`current_project_views[${i}][image_title]`] || req.body[titleKey] || "";
        if (fileObj) {
          projectViews.push({
            image: fileObj.path,
            imageTitle: title,
            sessionKey
          });
        }
      }
    }
    if (projectViews.length > 0) {
      await EcModuleProjectViewModel.replaceAll(ecModuleId, realEstateId, projectViews);
    }

    // Save field photographs
    const fieldPhotographs = [];
    if (req.files) {
      for (let i = 0; i < 30; i++) {
        const fileKey = `field_photographs[${i}][photo_file]`;
        const titleKey = `field_photographs[${i}][field_title]`;
        const fileObj = req.files[fileKey];
        const title = req.body[`field_photographs[${i}][field_title]`] || req.body[titleKey] || "";
        if (fileObj) {
          fieldPhotographs.push({
            fieldImage: fileObj.path,
            fieldImageTitle: title,
            sessionKey
          });
        }
      }
    }
    if (fieldPhotographs.length > 0) {
      await EcModuleFieldPhotographModel.replaceAll(ecModuleId, realEstateId, fieldPhotographs);
    }

    await logAudit(req, {
      type: "ADD",
      lnk: "add_ec_module_admin.php",
      panel: req.portal.toUpperCase(),
      module: `Add_ec_module_${real_estate_name}`,
    });

    return response.success(res, "EC module record created successfully", { id: ecModuleId }, 201);
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
