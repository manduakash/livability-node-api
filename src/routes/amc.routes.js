import { Router } from "express";
import * as amcController from "../controllers/amc.controller.js";

const router = Router();

router.get("/amc/:realEstateId", amcController.getAllAmc);
router.get("/amc/:realEstateId/:factSheet", amcController.getAmc);
router.put("/amc/:realEstateId/:factSheet", amcController.upsertAmc);

export default router;
