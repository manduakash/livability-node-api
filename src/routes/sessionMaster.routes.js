import { Router } from "express";
import * as sessionController from "../controllers/sessionMaster.controller.js";

const router = Router();

router.get("/sessions", sessionController.listSessions);
router.get("/sessions/:id", sessionController.getSession);
router.post("/sessions", sessionController.createSession);
router.put("/sessions/:id", sessionController.updateSession);
router.delete("/sessions/:id", sessionController.removeSession);

export default router;
