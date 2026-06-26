import { Router } from "express";
import * as controller from "../controllers/userMaster.controller.js";

const router = Router();

router.get("/users", controller.listUsers);
router.get("/users/:id", controller.getUser);
router.post("/users", controller.createUser);
router.put("/users/:id", controller.updateUser);
router.patch("/users/:userName/profile", controller.updateProfile);
router.patch("/users/:userName/password", controller.changePassword);
router.delete("/users/:id", controller.removeUser);

export default router;
