import { Router } from "express";
import * as locationController from "../controllers/location.controller.js";

const router = Router();

router.get("/locations/states", locationController.listStates);
router.get("/locations/states/:stateId", locationController.getState);
router.get("/locations/districts", locationController.listDistricts);
router.get("/locations/districts/:id", locationController.getDistrict);
router.get("/locations/cities/search", locationController.searchCities);
router.get("/locations/cities", locationController.listCities);
router.get("/locations/cities/:id", locationController.getCity);

export default router;
