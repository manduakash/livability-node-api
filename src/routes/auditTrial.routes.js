import { Router } from "express";
import { search } from "../controllers/auditTrial.controller.js";

const router = Router();

router.get("/audit-trail", search);

export default router;
