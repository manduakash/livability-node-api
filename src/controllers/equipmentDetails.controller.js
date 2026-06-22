import { response } from "../utils/response.js";
import { AnmsDetailsModel, AqmsDetailsModel } from "../models/equipmentDetails.model.js";
import { logAudit } from "../utils/auditLog.js";

function buildEquipmentController(model, { entityLabel, lnkPrefix, auditModuleName }) {
  return {
    async list(req, res) {
      try {
        const realEstateId = Number(req.query.realEstateId);
        if (!realEstateId) return response.error(res, "realEstateId is required", 400);

        const rows = await model.listByRealEstate(realEstateId);
        return response.success(res, `${entityLabel} list fetched`, rows);
      } catch (err) {
        return response.error(res, `Failed to fetch ${entityLabel} list: ${err.message}`);
      }
    },

    async getOne(req, res) {
      try {
        const id = Number(req.params.id);
        const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;

        const row = await model.getById(id, realEstateId);
        if (!row) return response.error(res, `${entityLabel} not found`, 404);
        return response.success(res, `${entityLabel} fetched`, row);
      } catch (err) {
        return response.error(res, `Failed to fetch ${entityLabel}: ${err.message}`);
      }
    },

    async create(req, res) {
      try {
        const { machine, realEstateId } = req.body;
        if (!machine || !realEstateId) {
          return response.error(res, "machine and realEstateId are required", 400);
        }

        const id = await model.create({ ...req.body, realEstateId: Number(realEstateId) });

        await logAudit(req, {
          type: "ADD",
          lnk: `add_${lnkPrefix}.php`,
          panel: req.portal.toUpperCase(),
          module: `Add_${auditModuleName}`,
        });

        return response.success(res, `${entityLabel} created`, { id }, 201);
      } catch (err) {
        return response.error(res, `Failed to create ${entityLabel}: ${err.message}`);
      }
    },

    async update(req, res) {
      try {
        const id = Number(req.params.id);
        const realEstateId = Number(req.body.realEstateId);
        if (!realEstateId) return response.error(res, "realEstateId is required", 400);

        const result = await model.update(id, realEstateId, req.body);
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
        const realEstateId = Number(req.query.realEstateId);
        if (!realEstateId) return response.error(res, "realEstateId is required", 400);

        const existing = await model.remove(id, realEstateId);
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

export const anmsDetailsController = buildEquipmentController(AnmsDetailsModel, {
  entityLabel: "ANMS equipment record",
  lnkPrefix: "anms_details",
  auditModuleName: "anms_details",
});

export const aqmsDetailsController = buildEquipmentController(AqmsDetailsModel, {
  entityLabel: "AQMS equipment record",
  lnkPrefix: "aqms_details",
  auditModuleName: "aqms_details",
});
