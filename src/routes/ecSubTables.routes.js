import { Router } from "express";
import * as ecSubController from "../controllers/ecSubTables.controller.js";

const router = Router();

router.get("/ec-module/:ecModuleId/micro-ana", ecSubController.listMicroAna);
router.put("/ec-module/:ecModuleId/micro-ana/:type", ecSubController.setMicroAna);

router.get("/ec-module/:ecModuleId/chem-ana", ecSubController.listChemAna);
router.put("/ec-module/:ecModuleId/chem-ana/:type", ecSubController.setChemAna);

router.get("/ec-module/:ecModuleId/project-view-images", ecSubController.listProjectViewImages);
router.put("/ec-module/:ecModuleId/project-view-images", ecSubController.replaceProjectViewImages);

router.get("/ec-module/:ecModuleId/field-photographs", ecSubController.listFieldPhotographs);
router.put("/ec-module/:ecModuleId/field-photographs", ecSubController.replaceFieldPhotographs);

router.get("/ec-module/:ecModuleId/remedial", ecSubController.getRemedial);
router.put("/ec-module/:ecModuleId/remedial", ecSubController.upsertRemedial);

router.get("/ec-module/:ecModuleId/inter-mon-test", ecSubController.getInterMonTest);
router.put("/ec-module/:ecModuleId/inter-mon-test", ecSubController.upsertInterMonTest);

export default router;
