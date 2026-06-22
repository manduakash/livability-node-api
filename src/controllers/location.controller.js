import { response } from "../utils/response.js";
import { LocationModel } from "../models/location.model.js";

/** GET /api/:portal/locations/states */
export async function listStates(req, res) {
  try {
    const rows = await LocationModel.listStates();
    return response.success(res, "States fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch states: ${err.message}`);
  }
}

/** GET /api/:portal/locations/states/:stateId */
export async function getState(req, res) {
  try {
    const row = await LocationModel.getStateById(Number(req.params.stateId));
    if (!row) return response.error(res, "State not found", 404);
    return response.success(res, "State fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch state: ${err.message}`);
  }
}

/** GET /api/:portal/locations/districts?stateId=1 */
export async function listDistricts(req, res) {
  try {
    const { stateId } = req.query;
    const rows = stateId
      ? await LocationModel.listDistrictsByState(Number(stateId))
      : await LocationModel.listDistricts();
    return response.success(res, "Districts fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch districts: ${err.message}`);
  }
}

/** GET /api/:portal/locations/districts/:id */
export async function getDistrict(req, res) {
  try {
    const row = await LocationModel.getDistrictById(Number(req.params.id));
    if (!row) return response.error(res, "District not found", 404);
    return response.success(res, "District fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch district: ${err.message}`);
  }
}

/** GET /api/:portal/locations/cities?districtId=1 OR ?stateId=1 */
export async function listCities(req, res) {
  try {
    const { districtId, stateId } = req.query;

    let rows;
    if (districtId) {
      rows = await LocationModel.listCitiesByDistrict(Number(districtId));
    } else if (stateId) {
      rows = await LocationModel.listCitiesByState(Number(stateId));
    } else {
      rows = await LocationModel.listCities();
    }

    return response.success(res, "Cities fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch cities: ${err.message}`);
  }
}

/** GET /api/:portal/locations/cities/:id */
export async function getCity(req, res) {
  try {
    const row = await LocationModel.getCityById(Number(req.params.id));
    if (!row) return response.error(res, "City not found", 404);
    return response.success(res, "City fetched", row);
  } catch (err) {
    return response.error(res, `Failed to fetch city: ${err.message}`);
  }
}

/**
 * GET /api/:portal/locations/cities/search?term=kol
 * Replaces the jQuery UI autocomplete endpoint:
 *   SELECT * FROM city WHERE city_name LIKE '{term}%' LIMIT 25
 */
export async function searchCities(req, res) {
  try {
    const term = req.query.term || "";
    if (!term) return response.error(res, "term query param is required", 400);

    const rows = await LocationModel.searchCitiesByNamePrefix(term);
    return response.success(res, "City search results", rows);
  } catch (err) {
    return response.error(res, `Failed to search cities: ${err.message}`);
  }
}
