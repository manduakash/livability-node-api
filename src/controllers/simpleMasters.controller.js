import { createSimpleMasterController } from "./simpleMasterFactory.controller.js";
import {
  IndustryTypeMasterModel,
  IndustryCategoryModel,
  ClasificationMasterModel,
  LaboratoryMasterModel,
  IndustryMasterModel,
} from "../models/simpleMasters.model.js";

export const industryTypeController = createSimpleMasterController(IndustryTypeMasterModel, {
  entityLabel: "Industry type",
  auditModuleName: "industry_type",
  lnkPrefix: "industry_type",
});

export const industryCategoryController = createSimpleMasterController(IndustryCategoryModel, {
  entityLabel: "Industry category",
  auditModuleName: "industry_category",
  lnkPrefix: "industry_category",
});

export const clasificationController = createSimpleMasterController(ClasificationMasterModel, {
  entityLabel: "Classification",
  auditModuleName: "clasification",
  lnkPrefix: "clasification",
});

export const laboratoryController = createSimpleMasterController(LaboratoryMasterModel, {
  entityLabel: "Laboratory",
  auditModuleName: "laboratory",
  lnkPrefix: "laboratory",
});

export const industryMasterController = createSimpleMasterController(IndustryMasterModel, {
  entityLabel: "Industry",
  auditModuleName: "industry_master",
  lnkPrefix: "industry_master",
});
