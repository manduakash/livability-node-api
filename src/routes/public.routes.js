import { Router } from "express";
import { submitContactUs, submitFeedback } from "../controllers/public.controller.js";
import { register } from "../controllers/tempRealMaster.controller.js";

const router = Router();

router.post("/public/contact-us", submitContactUs);
router.post("/public/feedback", submitFeedback);
router.post("/public/real-estate-registration", register);

export default router;
