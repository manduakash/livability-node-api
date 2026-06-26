import { Router } from "express";
import { anmsDetailsController, aqmsDetailsController } from "../controllers/equipmentDetails.controller.js";

const router = Router();

router.get("/anms-details", anmsDetailsController.list);
router.get("/anms-details/:id", anmsDetailsController.getOne);
router.post("/anms-details", anmsDetailsController.create);
router.put("/anms-details/:id", anmsDetailsController.update);
router.delete("/anms-details/:id", anmsDetailsController.remove);

router.get("/aqms-details", aqmsDetailsController.list);
router.get("/aqms-details/:id", aqmsDetailsController.getOne);
router.post("/aqms-details", aqmsDetailsController.create);
router.put("/aqms-details/:id", aqmsDetailsController.update);
router.delete("/aqms-details/:id", aqmsDetailsController.remove);

export default router;
