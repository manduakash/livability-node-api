import { response } from "../utils/response.js";
import { DisplayBoardModel, AutocomposterModel, NotificationMessagesModel } from "../models/notifications.model.js";
import { logAudit } from "../utils/auditLog.js";
import { db } from "../db/index.js";
import { aqmsMonitoringMain, noiseDetailsAll } from "../db/schema.js";
import { SolarEnergyModel } from "../models/solar.model.js";
import { GreenModel } from "../models/green.model.js";
import { RainwaterHarvestingModel } from "../models/rainwaterHarvesting.model.js";
import { WasteRelatedModel } from "../models/waste.model.js";
import { StpModel } from "../models/stp.model.js";
import { PortableWaterQualityModel, WaterQualityModel } from "../models/waterQuality.model.js";
import { NoiseDetailsAllModel } from "../models/noiseDetailsAll.model.js";
import { TempLivabilityModel } from "../models/livability.model.js";
import { RealEstateMasterModel } from "../models/realEstateMaster.model.js";
import { desc, eq } from "drizzle-orm";

// --- display_board ---

/** GET /api/:portal/display-board/:realEstateId */
export async function getDisplayBoard(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const row = await DisplayBoardModel.getByRealEstate(realEstateId);
    if (!row) return response.error(res, "No display board config found for this property", 404);

    const solarPower = await SolarEnergyModel.getFlag(realEstateId) || "no";
    const greenData = await GreenModel.getFlags(realEstateId);
    const greenArea = greenData?.flagGreen || "no";
    const rainwaterHarvesting = await RainwaterHarvestingModel.getFlag(realEstateId) || "no";
    
    const wasteRelated = await WasteRelatedModel.getByRealEstate(realEstateId);
    const wasteSegregation = wasteRelated?.segregation || "no";
    const autoComposter = wasteRelated?.auto || "no";

    const stp = await StpModel.getFlag(realEstateId) || "no";
    const waterQualitySensor = await PortableWaterQualityModel.getWaterSensorFlag(realEstateId) || "no";

    const recentWater = await WaterQualityModel.listRecent(realEstateId, 1);
    const waterQualityData = recentWater?.[0] || { ph: 0, tss: 0, tds: 0, temp: 0 };

    const recentAqms = await db.select({ aqi: aqmsMonitoringMain.aqi })
      .from(aqmsMonitoringMain)
      .where(eq(aqmsMonitoringMain.realEstateId, realEstateId))
      .orderBy(desc(aqmsMonitoringMain.id))
      .limit(1);
    const aqms = recentAqms?.[0]?.aqi || 0;

    const recentNoise = await db.select()
      .from(noiseDetailsAll)
      .where(eq(noiseDetailsAll.realEstateId, realEstateId))
      .orderBy(desc(noiseDetailsAll.id))
      .limit(1);
    let anmsValue = 0;
    if (recentNoise?.[0]) {
      const n = recentNoise[0];
      const { db: computedDb } = NoiseDetailsAllModel.computeScore([n.las, n.lcs, n.lzs, n.laeqt, n.lapeakt, n.lceqt, n.lcpeakt, n.lzeqt, n.lzpeakt]);
      anmsValue = computedDb;
    }
    
    const anmsFlagRes = await NoiseDetailsAllModel.getAnmsFlag(realEstateId);
    const anmsInstalled = anmsFlagRes.allowed ? "yes" : "no";

    const livabilityData = await TempLivabilityModel.getByRealEstate(realEstateId);
    const livabilityIndex = livabilityData?.perOfLivability || 0;

    const profileData = await RealEstateMasterModel.getById(realEstateId);

    const extendedRow = {
      ...row,
      projectName: profileData?.realEstateName || "",
      address: profileData?.addrReal || "",
      developerName: profileData?.developerName || "",
      solarPower,
      greenArea,
      rainwaterHarvesting,
      aqms,
      wasteSegregation,
      anms: anmsValue,
      anmsInstalled,
      autoComposter,
      displayBoard: row.status,
      stp,
      waterQualitySensor,
      livabilityIndex,
      waterQuality: {
        ph: waterQualityData.ph,
        tss: waterQualityData.tss,
        tds: waterQualityData.tds,
        temp: waterQualityData.temp,
      }
    };

    return response.success(res, "Display board config fetched", extendedRow);
  } catch (err) {
    return response.error(res, `Failed to fetch display board config: ${err.message}`);
  }
}

/** PUT /api/:portal/display-board/:realEstateId */
export async function upsertDisplayBoard(req, res) {
  try {
    const realEstateId = Number(req.params.realEstateId);
    const id = await DisplayBoardModel.upsert({ ...req.body, realEstateId });

    await logAudit(req, {
      type: "EDIT",
      lnk: "add_display_board_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Edit_display_board",
    });

    return response.success(res, "Display board config saved", { id });
  } catch (err) {
    return response.error(res, `Failed to save display board config: ${err.message}`);
  }
}

// --- autocomposter ---

/** GET /api/:portal/autocomposter?realEstateId=1&from=&to= */
export async function listAutocomposter(req, res) {
  try {
    const realEstateId = Number(req.query.realEstateId);
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const { from, to } = req.query;
    const rows = from && to
      ? await AutocomposterModel.listByDateRange(realEstateId, from, to)
      : await AutocomposterModel.listByRealEstate(realEstateId);

    return response.success(res, "Autocomposter records fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch autocomposter records: ${err.message}`);
  }
}

/** GET /api/:portal/autocomposter/years?realEstateId=1&from=&to= */
export async function listAutocomposterYears(req, res) {
  try {
    const realEstateId = Number(req.query.realEstateId);
    const { from, to } = req.query;
    if (!realEstateId || !from || !to) {
      return response.error(res, "realEstateId, from, and to are required", 400);
    }

    const years = await AutocomposterModel.listDistinctYears(realEstateId, from, to);
    return response.success(res, "Distinct autocomposter years fetched", years);
  } catch (err) {
    return response.error(res, `Failed to fetch autocomposter years: ${err.message}`);
  }
}

/** POST /api/:portal/autocomposter  { dt, totCompostProduction, totHours, realEstateId } */
export async function createAutocomposter(req, res) {
  try {
    const { dt, totCompostProduction, totHours, realEstateId } = req.body;
    if (!dt || !realEstateId) return response.error(res, "dt and realEstateId are required", 400);

    const id = await AutocomposterModel.create({
      dt,
      totCompostProduction: Number(totCompostProduction) || 0,
      totHours: Number(totHours) || 0,
      realEstateId: Number(realEstateId),
    });

    await logAudit(req, {
      type: "ADD",
      lnk: "add_autocomposter_admin.php",
      panel: req.portal.toUpperCase(),
      module: "Add_autocomposter",
    });

    return response.success(res, "Autocomposter record created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create autocomposter record: ${err.message}`);
  }
}

/** DELETE /api/:portal/autocomposter/:id?realEstateId=1 */
export async function removeAutocomposter(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = Number(req.query.realEstateId);
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const existing = await AutocomposterModel.remove(id, realEstateId);
    if (!existing) return response.error(res, "Autocomposter record not found", 404);

    await logAudit(req, {
      type: "DELETE",
      lnk: "autocomposter_delete.php",
      panel: req.portal.toUpperCase(),
      module: "Delete_autocomposter",
    });

    return response.success(res, "Autocomposter record deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete autocomposter record: ${err.message}`);
  }
}

// --- notification_messages ---

/** GET /api/:portal/notifications/unread?userType=real_estate */
export async function listUnreadNotifications(req, res) {
  try {
    const userType = req.query.userType || "real_estate";
    const rows = await NotificationMessagesModel.listUnreadByUserType(userType);
    return response.success(res, "Unread notifications fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch unread notifications: ${err.message}`);
  }
}

/** GET /api/:portal/notifications?realEstateId=1&subject=messages */
export async function listNotifications(req, res) {
  try {
    const realEstateId = Number(req.query.realEstateId);
    const { subject } = req.query;
    if (!realEstateId || !subject) return response.error(res, "realEstateId and subject are required", 400);

    const rows = await NotificationMessagesModel.listByRealEstateAndSubject(realEstateId, subject);
    return response.success(res, "Notifications fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch notifications: ${err.message}`);
  }
}

/** GET /api/:portal/notifications/search?userType=real_estate&name=&subject= */
export async function searchNotifications(req, res) {
  try {
    const userType = req.query.userType || "real_estate";
    const { name, subject } = req.query;

    const rows = await NotificationMessagesModel.searchByPropertyName(userType, name, subject);
    return response.success(res, "Notification search results", rows);
  } catch (err) {
    return response.error(res, `Failed to search notifications: ${err.message}`);
  }
}

/** GET /api/:portal/notifications/unreplied?realEstateId=1 */
export async function listUnrepliedNotifications(req, res) {
  try {
    const realEstateId = Number(req.query.realEstateId);
    if (!realEstateId) return response.error(res, "realEstateId is required", 400);

    const rows = await NotificationMessagesModel.listUnrepliedNotifications(realEstateId);
    return response.success(res, "Unreplied notifications fetched", rows);
  } catch (err) {
    return response.error(res, `Failed to fetch unreplied notifications: ${err.message}`);
  }
}

/** POST /api/:portal/notifications  { description, subject, dateN, timeN, realEstateId, userType } */
export async function createNotification(req, res) {
  try {
    const { description, subject, dateN, timeN, realEstateId, userType } = req.body;
    if (!description || !realEstateId) {
      return response.error(res, "description and realEstateId are required", 400);
    }

    const id = await NotificationMessagesModel.create({
      description,
      subject: subject ?? "",
      dateN,
      timeN,
      realEstateId: Number(realEstateId),
      userType,
    });

    return response.success(res, "Notification created", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to create notification: ${err.message}`);
  }
}

/** POST /api/:portal/notifications/:id/reply  { description, dateN, timeN, realEstateId, userType } */
export async function replyToNotification(req, res) {
  try {
    const replyToId = Number(req.params.id);
    const { description, dateN, timeN, realEstateId, userType } = req.body;
    if (!description || !realEstateId) {
      return response.error(res, "description and realEstateId are required", 400);
    }

    const id = await NotificationMessagesModel.createReply({
      description,
      dateN,
      timeN,
      realEstateId: Number(realEstateId),
      replyToId,
      userType,
    });

    await NotificationMessagesModel.markFlag(replyToId, 1);

    return response.success(res, "Reply sent", { id }, 201);
  } catch (err) {
    return response.error(res, `Failed to send reply: ${err.message}`);
  }
}

/** PATCH /api/:portal/notifications/:id/read */
export async function markNotificationRead(req, res) {
  try {
    const id = Number(req.params.id);
    await NotificationMessagesModel.markFlag(id, 1);
    return response.success(res, "Notification marked as read", { id });
  } catch (err) {
    return response.error(res, `Failed to mark notification as read: ${err.message}`);
  }
}

/** PUT /api/:portal/notifications/:id  { description } */
export async function updateNotification(req, res) {
  try {
    const id = Number(req.params.id);
    const { description } = req.body;
    if (!description) return response.error(res, "description is required", 400);

    const result = await NotificationMessagesModel.update(id, { description });
    if (!result) return response.error(res, "Notification not found", 404);

    return response.success(res, "Notification updated", result);
  } catch (err) {
    return response.error(res, `Failed to update notification: ${err.message}`);
  }
}

/** DELETE /api/:portal/notifications/:id?realEstateId=1 */
export async function removeNotification(req, res) {
  try {
    const id = Number(req.params.id);
    const realEstateId = req.query.realEstateId ? Number(req.query.realEstateId) : undefined;

    const existing = await NotificationMessagesModel.remove(id, realEstateId);
    if (!existing) return response.error(res, "Notification not found", 404);

    return response.success(res, "Notification deleted", existing);
  } catch (err) {
    return response.error(res, `Failed to delete notification: ${err.message}`);
  }
}
