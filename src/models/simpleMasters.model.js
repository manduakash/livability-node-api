import {
  industryTypeMaster,
  industryCategory,
  clasificationMaster,
  laboratoryMaster,
  industryMaster,
} from "../db/schema.js";
import { createSimpleMasterModel } from "./simpleMasterFactory.js";

/**
 * Each of these replaces an identical set of legacy files (per portal):
 * an "industry_type_*" / "category_*" / "clasification_*" / "lab_*" add,
 * edit, delete, and listing page - all doing the exact same single-field
 * master CRUD against their respective table.
 */
export const IndustryTypeMasterModel = createSimpleMasterModel(
  industryTypeMaster,
  industryTypeMaster.id,
  industryTypeMaster.typeOfIndustry,
  "typeOfIndustry"
);

export const IndustryCategoryModel = createSimpleMasterModel(
  industryCategory,
  industryCategory.id,
  industryCategory.category,
  "category"
);

export const ClasificationMasterModel = createSimpleMasterModel(
  clasificationMaster,
  clasificationMaster.id,
  clasificationMaster.clasificationName,
  "clasificationName"
);

export const LaboratoryMasterModel = createSimpleMasterModel(
  laboratoryMaster,
  laboratoryMaster.id,
  laboratoryMaster.labName,
  "labName"
);

export const IndustryMasterModel = createSimpleMasterModel(
  industryMaster,
  industryMaster.id,
  industryMaster.nameOfIndustry,
  "nameOfIndustry"
);
