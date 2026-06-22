import { Router } from "express";
import enggenvRoutes from "./enggenv.routes.js";
import wbpcbRoutes from "./wbpcb.routes.js";
import paribeshRoutes from "./paribesh.routes.js";
import distronixRoutes from "./distronix.routes.js";
import authRoutes from "./auth.routes.js";
import treesRoutes from "./trees.routes.js";
import locationRoutes from "./location.routes.js";
import simpleMastersRoutes from "./simpleMasters.routes.js";
import publicRoutes from "./public.routes.js";
import wasteRoutes from "./waste.routes.js";
import stpRoutes from "./stp.routes.js";
import solarRoutes from "./solar.routes.js";
import amcRoutes from "./amc.routes.js";
import rainwaterHarvestingRoutes from "./rainwaterHarvesting.routes.js";
import ecRoutes from "./ec.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import sessionMasterRoutes from "./sessionMaster.routes.js";
import waterQualityRoutes from "./waterQuality.routes.js";
import greenRoutes from "./green.routes.js";
import ecModuleConditionRoutes from "./ecModuleCondition.routes.js";
import ecSubTablesRoutes from "./ecSubTables.routes.js";
import dgSetUsageRoutes from "./dgSetUsage.routes.js";
import industryPollutionListsRoutes from "./industryPollutionLists.routes.js";
import realEstateMasterRoutes from "./realEstateMaster.routes.js";
import auditTrialRoutes from "./auditTrial.routes.js";
import userAccessRoutes from "./userAccess.routes.js";
import userMasterRoutes from "./userMaster.routes.js";
import livabilityRoutes from "./livability.routes.js";
import tempRealMasterRoutes from "./tempRealMaster.routes.js";
import equipmentDetailsRoutes from "./equipmentDetails.routes.js";

import { requireAuth } from "../middleware/auth.js";
import { portalTag } from "../middleware/portalTag.js";

const router = Router();

// --- Auth (no portal prefix) ---
router.use(authRoutes);

// --- Public, unauthenticated endpoints (contact form, feedback) ---
router.use(publicRoutes);

// --- Third-party API integrations (unchanged from earlier migration) ---
router.use(enggenvRoutes);
router.use(wbpcbRoutes);
router.use(paribeshRoutes);
router.use(distronixRoutes);

/**
 * --- Module routes, mirroring the 3 legacy PHP portals ---
 * Each module router (e.g. treesRoutes) is mounted once per portal here.
 * Add new modules to this list as they're migrated.
 */
const portalRouters = [
  treesRoutes,
  locationRoutes,
  simpleMastersRoutes,
  wasteRoutes,
  stpRoutes,
  solarRoutes,
  amcRoutes,
  rainwaterHarvestingRoutes,
  ecRoutes,
  notificationsRoutes,
  sessionMasterRoutes,
  waterQualityRoutes,
  greenRoutes,
  ecModuleConditionRoutes,
  ecSubTablesRoutes,
  dgSetUsageRoutes,
  industryPollutionListsRoutes,
  realEstateMasterRoutes,
  auditTrialRoutes,
  userAccessRoutes,
  userMasterRoutes,
  livabilityRoutes,
  tempRealMasterRoutes,
  equipmentDetailsRoutes,
];

router.use("/admin", requireAuth(["admin"]), portalTag("admin"), ...portalRouters);
router.use("/pcb", requireAuth(["pcb"]), portalTag("pcb"), ...portalRouters);
router.use(
  "/real_estate",
  requireAuth(["real_estate"]),
  portalTag("real_estate"),
  ...portalRouters
);

export default router;
