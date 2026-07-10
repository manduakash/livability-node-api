import { Router } from "express";
import * as notificationsController from "../controllers/notifications.controller.js";

const router = Router();

router.get("/display-board/:realEstateId", notificationsController.getDisplayBoard);
router.put("/display-board/:realEstateId", notificationsController.upsertDisplayBoard);

router.get("/autocomposter/report", notificationsController.getAutocomposterReport);
router.get("/autocomposter/years", notificationsController.listAutocomposterYears);
router.get("/autocomposter", notificationsController.listAutocomposter);
router.post("/autocomposter", notificationsController.createAutocomposter);
router.delete("/autocomposter/:id", notificationsController.removeAutocomposter);

router.get("/notifications/unread", notificationsController.listUnreadNotifications);
router.get("/notifications/search", notificationsController.searchNotifications);
router.get("/notifications/unreplied", notificationsController.listUnrepliedNotifications);
router.get("/notifications", notificationsController.listNotifications);
router.post("/notifications", notificationsController.createNotification);
router.post("/notifications/:id/reply", notificationsController.replyToNotification);
router.patch("/notifications/:id/read", notificationsController.markNotificationRead);
router.put("/notifications/:id", notificationsController.updateNotification);
router.delete("/notifications/:id", notificationsController.removeNotification);

export default router;
