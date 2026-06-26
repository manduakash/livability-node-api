import { Router } from "express";
import * as wasteController from "../controllers/waste.controller.js";

const router = Router();

router.get("/waste-collection", wasteController.listWasteCollection);
router.post("/waste-collection", wasteController.createWasteCollection);
router.delete("/waste-collection/:id", wasteController.removeWasteCollection);

router.get("/waste-details/by-category", wasteController.listWasteDetailsByCategory);
router.get("/waste-details", wasteController.listWasteDetails);
router.post("/waste-details", wasteController.createWasteDetails);
router.delete("/waste-details/:id", wasteController.removeWasteDetails);

router.get("/waste-related/:realEstateId", wasteController.getWasteRelated);
router.put("/waste-related/:realEstateId", wasteController.upsertWasteRelated);

export default router;
