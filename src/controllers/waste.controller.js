import { response } from "../utils/response.js";
import { WasteCollectionModel, WasteDetailsModel, WasteRelatedModel } from "../models/waste.model.js";
import { logAudit } from "../utils/auditLog.js";

// --- waste_collection ---

/** GET /api/:portal/waste-collection?realEstateId=1&from=2026-01-01&to=2026-06-01 */
export async function listWasteCollection(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId, from, and to are required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);
    const { from, to } = req.query;
    if (!from || !to) {
      return response.error(res, "from and to are required", 400);
    }

    const rows = await WasteCollectionModel.listByDateRange(realEstateId, from, to);
    return response.success(res, "Waste collection records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch waste collection records: ${err.message}`);
  }
}

/** POST /api/:portal/waste-collection  { wasteGen, wasteTreat, wasteDateCollec, ulb, realEstateId } */
export async function createWasteCollection(req, res) {
  try {
    const { wasteGen, wasteTreat, wasteDateCollec, ulb, realEstateId } = req.body;
    if (!wasteDateCollec || !realEstateId) {
      return response.error(res, "wasteDateCollec and realEstateId are required", 400);
    }

    const id = await WasteCollectionModel.create({
      wasteGen: Number(wasteGen) || 0,
      wasteTreat: Number(wasteTreat) || 0,
      wasteDateCollec,
      ulb: Number(ulb) || 0,
      realEstateId: Number(realEstateId),
    });

    await logAudit(req, {
      type: "ADD",
      lnk: "add_waste_collection_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_waste_collection",
    });

    return response.success(res, "Waste collection record created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create waste collection record: ${err.message}`);
  }
}

/** DELETE /api/:portal/waste-collection/:id?realEstateId=1 */
export async function removeWasteCollection(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;

    const existing = await WasteCollectionModel.remove(id, realEstateId);
    if (!existing) return response.error(res, "Waste collection record not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "waste_collection_delete.php",
      panel: req.portal.toUpperCase(),
      module: "Delete_waste_collection",
    });

    return response.success(res, "Waste collection record deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete waste collection record: ${err.message}`);
  }
}

// --- waste_details ---

/** GET /api/:portal/waste-details?realEstateId=1&date=2026-06-01 */
export async function listWasteDetails(req, res) {
  try {
    if (req.query.realEstateId === undefined || req.query.realEstateId === "") {
      return response.error(res, "realEstateId and date are required", 400);
    }
    const realEstateId = Number(req.query.realEstateId);
    const { date } = req.query;
    if (!date) {
      return response.error(res, "date is required", 400);
    }

    const rows = await WasteDetailsModel.listByDate(realEstateId, date);
    return response.success(res, "Waste detail records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch waste detail records: ${err.message}`);
  }
}

/**
 * GET /api/:portal/waste-details/by-category?category=Solid Waste&from=2026-01-01&to=2026-06-01
 * Replaces the 5 near-identical legacy report queries (Solid/Hazardous/
 * Bio-Medical/Pollution/Const & Downward Waste) with one parameterized route.
 */
export async function listWasteDetailsByCategory(req, res) {
  try {
    const { category, from, to } = req.query;
    if (!category || !from || !to) {
      return response.error(res, "category, from, and to are required", 400);
    }

    const rows = await WasteDetailsModel.listByDateRangeAndCategory(category, from, to);
    return response.success(res, "Waste detail records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch waste detail records: ${err.message}`);
  }
}

/** POST /api/:portal/waste-details  { wasteName, wasteDate, realEstateId } */
export async function createWasteDetails(req, res) {
  try {
    const { wasteName, wasteDate, realEstateId } = req.body;
    if (!wasteName || !wasteDate || !realEstateId) {
      return response.error(res, "wasteName, wasteDate, and realEstateId are required", 400);
    }

    const id = await WasteDetailsModel.create({ wasteName, wasteDate, realEstateId: Number(realEstateId) });

    await logAudit(req, {
      type: "ADD",
      lnk: "add_waste_details_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_waste_details",
    });

    return response.success(res, "Waste detail record created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create waste detail record: ${err.message}`);
  }
}

/** DELETE /api/:portal/waste-details/:id */
export async function removeWasteDetails(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await WasteDetailsModel.remove(id);
    if (!existing) return response.error(res, "Waste detail record not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "waste_details_delete.php",
      panel: req.portal.toUpperCase(),
      module: "Delete_waste_details",
    });

    return response.success(res, "Waste detail record deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete waste detail record: ${err.message}`);
  }
}

// --- waste_related ---

/** GET /api/:portal/waste-related/:realEstateId */
export async function getWasteRelated(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const result = await WasteRelatedModel.getByRealEstate(realEstateId);
    if (!result) return response.error(res, "No waste-related config found for this property", 404);
    return response.success(res, "Waste-related config fetched", result);
  } catch (err) {
    return response.error(res, `Failed to fetch waste-related config: ${err.message}`);
  }
}

/**
 * PUT /api/:portal/waste-related/:realEstateId
 * Replaces add_waste_related*.php (delete-then-reinsert pattern preserved
 * from the legacy code - see WasteRelatedModel.upsert).
 */
export async function upsertWasteRelated(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const {
      door,
      auto,
      segregation,
      pointsWaste,
      pointsSegregation,
      remarksWaste,
      remarksSegre,
      flagWaste,
      installDate,
    } = req.body;

    const id = await WasteRelatedModel.upsert({
      door,
      auto,
      segregation,
      pointsWaste,
      pointsSegregation,
      remarksWaste,
      remarksSegre,
      flagWaste,
      realEstateId,
      installDate,
    });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_waste_related.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_waste_related",
    });

    return response.success(res, "Waste-related config saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save waste-related config: ${err.message}`);
  }
}
