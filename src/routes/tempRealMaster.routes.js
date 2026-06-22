import { Router } from "express";
import * as controller from "../controllers/tempRealMaster.controller.js";

const router = Router();

router.get("/real-estate-registration/pending", controller.listPending);
router.get("/real-estate-registration/search", controller.search);
router.get("/real-estate-registration/by-name/:realEstateName", controller.listByRegistrant);
router.get("/real-estate-registration/:id", controller.getById);
router.post("/real-estate-registration/:id/approve", controller.approve);
router.delete("/real-estate-registration/:id", controller.remove);

export default router;
