import { Router } from "express";
import * as controller from "../controllers/userAccess.controller.js";

const router = Router();

router.get("/user-access", controller.listAccess);
router.put("/user-access", controller.setManyAccess);
router.get("/user-access/:menu/:submenu", controller.getAccess);
router.put("/user-access/:menu/:submenu", controller.setAccess);
router.delete("/user-access/:menu/:submenu", controller.removeAccess);

export default router;
