import { anmsDetails, aqmsDetails } from "../db/schema.js";
import { createEquipmentDetailsModel } from "./equipmentDetailsFactory.js";

/**
 * anms_details: noise-monitoring equipment registry per property.
 * Replaces the legacy admin/pcb/real_estate "ANMS equipment details"
 * add/edit/delete/list pages.
 */
export const AnmsDetailsModel = createEquipmentDetailsModel(anmsDetails);

/**
 * aqms_details: air-quality-monitoring equipment registry per property.
 * Same shape/pattern as anms_details.
 */
export const AqmsDetailsModel = createEquipmentDetailsModel(aqmsDetails);
