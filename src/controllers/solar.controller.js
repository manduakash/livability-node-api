import { response } from "../utils/response.js";
import { SolarEnergyModel, SolarGenerationModel } from "../models/solar.model.js";
import { logAudit } from "../utils/auditLog.js";

// --- solar_energy (device config) ---

/** GET /api/:portal/solar-energy/:realEstateId */
export async function getSolarEnergy(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const row = await SolarEnergyModel.getByRealEstate(realEstateId);
    if (!row) return response.error(res, "No solar energy config found for this property", 404);
    return response.success(res, "Solar energy config fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch solar energy config: ${err.message}`);
  }
}

/** PUT /api/:portal/solar-energy/:realEstateId */
export async function upsertSolarEnergy(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const id = await SolarEnergyModel.upsert({ ...req.body, realEstateId });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_solar_energy_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_solar_energy",
    });

    return response.success(res, "Solar energy config saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save solar energy config: ${err.message}`);
  }
}

/** PATCH /api/:portal/solar-energy/:realEstateId/points  { points } */
export async function updateSolarEnergyPoints(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const { points } = req.body;
    if (points === undefined) return response.error(res, "points is required", 400);

    await SolarEnergyModel.updatePoints(realEstateId, Number(points));
    return response.success(res, "Solar energy points updated", { realEstateId, points: Number(points) });
  } catch (err) {
    return response.error(res, `Failed to update solar energy points: ${err.message}`);
  }
}

// --- solar_generation (readings log) ---

/** GET /api/:portal/solar-generation?realEstateId=1&from=...&to=... */
export async function listSolarGeneration(req, res) {
  try {
    const realEstateId = Number(req.query.realEstateId);
    const { from, to } = req.query;
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const rows = from && to
      ? await SolarGenerationModel.listByDateRange(realEstateId, from, to)
      : await SolarGenerationModel.listByRealEstate(realEstateId);

    return response.success(res, "Solar generation readings fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch solar generation readings: ${err.message}`);
  }
}

/** GET /api/:portal/solar-generation/chart?realEstateId=1&limit=10 */
export async function listSolarGenerationChart(req, res) {
  try {
    const realEstateId = Number(req.query.realEstateId);
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const limit = Number(req.query.limit) || 10;
    const rows = await SolarGenerationModel.listRecentForChart(realEstateId, limit);
    return response.success(res, "Solar generation chart data fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch solar generation chart data: ${err.message}`);
  }
}

/** POST /api/:portal/solar-generation  { dt, solarReadings, realEstateId } */
export async function createSolarGeneration(req, res) {
  try {
    const { dt, solarReadings, realEstateId } = req.body;
    if (!dt || !solarReadings || !realEstateId) {
      return response.error(res, "dt, solarReadings, and realEstateId are required", 400);
    }

    const id = await SolarGenerationModel.create({ dt, solarReadings, realEstateId: Number(realEstateId) });

    await logAudit(req, {
      type: "ADD",
      lnk: "add_solar_generation_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_solar_generation",
    });

    return response.success(res, "Solar generation reading created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create solar generation reading: ${err.message}`);
  }
}

/** PUT /api/:portal/solar-generation/:id  { dt, solarReadings, realEstateId } */
export async function updateSolarGeneration(req, res) {
  try {
    const id = Number(req.params.id);
    const { dt, solarReadings, realEstateId } = req.body;
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const result = await SolarGenerationModel.update(id, Number(realEstateId), { dt, solarReadings });
    if (!result) return response.error(res, "Solar generation reading not found", 404);

    await logAudit(req, {
      type: "EDIT",
      lnk: "edit_solar_generation_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_solar_generation",
    });

    return response.success(res, "Solar generation reading updated", result);
  } catch (err) {
    return response.error(res, `Failed to update solar generation reading: ${err.message}`);
  }
}

/** DELETE /api/:portal/solar-generation/:id?realEstateId=1 */
export async function removeSolarGeneration(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;

    const existing = await SolarGenerationModel.remove(id, realEstateId);
    if (!existing) return response.error(res, "Solar generation reading not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "solar_generation_delete.php",
      panel: req.portal.toUpperCase(),
      module: "Delete_solar_generation",
    });

    return response.success(res, "Solar generation reading deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete solar generation reading: ${err.message}`);
  }
}
