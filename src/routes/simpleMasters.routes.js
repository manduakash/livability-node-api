import { Router } from "express";
import {
  industryTypeController,
  industryCategoryController,
  clasificationController,
  laboratoryController,
  industryMasterController,
} from "../controllers/simpleMasters.controller.js";

const router = Router();

function mount(path, controller) {
  router.get(`/${path}`, controller.list);
  router.get(`/${path}/:id`, controller.getOne);
  router.post(`/${path}`, controller.create);
  router.put(`/${path}/:id`, controller.update);
  router.delete(`/${path}/:id`, controller.remove);
}

mount("industry-types", industryTypeController);
mount("industry-categories", industryCategoryController);
mount("classifications", clasificationController);
mount("laboratories", laboratoryController);
mount("industry-masters", industryMasterController);

export default router;
