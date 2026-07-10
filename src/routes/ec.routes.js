import { Router } from "express";
import * as ecController from "../controllers/ec.controller.js";
import { multipartMiddleware } from "../utils/multipart.js";

const router = Router();

router.get("/ec-module/search", ecController.searchEcModule);
router.get("/ec-module/paginated", ecController.listEcModulePaginated);
router.get("/ec-module/:id", ecController.getEcModule);
router.get("/ec-module", ecController.listEcModule);
router.post("/ec-module", ecController.createEcModule);
router.patch("/ec-module/:realEstateId/upload", ecController.setEcModuleUpload);
router.delete("/ec-module/:id", ecController.removeEcModule);

router.get("/ec-sanction/search", ecController.searchEcSanction);
router.get("/ec-sanction", ecController.listEcSanction);
router.post("/ec-sanction", ecController.createEcSanction);
router.put("/ec-sanction/:id", ecController.updateEcSanction);
router.delete("/ec-sanction/:id", ecController.removeEcSanction);

export default router;
