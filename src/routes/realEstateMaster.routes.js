import { Router } from "express";
import * as controller from "../controllers/realEstateMaster.controller.js";

const router = Router();

router.get("/real-estate/states", controller.listDistinctStates);
router.get("/real-estate/:id", controller.getById);
router.get("/real-estate", controller.search);
router.post("/real-estate", controller.create);
router.put("/real-estate/:id", controller.update);
router.patch("/real-estate/:id/status", controller.setStatus);
router.patch("/real-estate/:id/geo-location", controller.updateGeoLocation);
router.patch("/real-estate/:id/soft-delete", controller.setDelStatus);
router.delete("/real-estate/:id/gst-doc", controller.clearGstDoc);
router.delete("/real-estate/:id/profile-photo", controller.clearProfilePhoto);
router.delete("/real-estate/:id", controller.remove);

export default router;
