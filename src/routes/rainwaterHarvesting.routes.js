import { Router } from "express";
import * as rainwaterController from "../controllers/rainwaterHarvesting.controller.js";

const router = Router();

router.get("/rainwater-harvesting", rainwaterController.listRainwaterHarvestingByWarranty);
router.get("/rainwater-harvesting/:realEstateId", rainwaterController.getRainwaterHarvesting);
router.put("/rainwater-harvesting/:realEstateId", rainwaterController.upsertRainwaterHarvesting);
router.get("/rainwater-collection-report", rainwaterController.getRainwaterCollectionReport);

export default router;
