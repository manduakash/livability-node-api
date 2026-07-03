import { Router } from "express";
import * as controller from "../controllers/userMaster.controller.js";

const router = Router();

router.get("/users", controller.listUsers);
router.get("/users/:id", controller.getUser);
router.post("/users", controller.createUser);
router.put("/users/:id", controller.updateUser);
router.get("/users/:userId/profile", controller.getProfile);
router.patch("/users/:userId/profile", controller.updateProfile);
router.patch("/users/:userName/password", controller.changePassword);
router.delete("/users/:id", controller.removeUser);

export default router;
