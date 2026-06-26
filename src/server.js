import "dotenv/config";
import cron from "node-cron";
import app from "./app.js";
import * as enggenvService from "./services/enggenv.service.js";
import { WaterSensorModel } from "./models/waterSensor.model.js";
import { SensorWaterModel } from "./models/sensorWater.model.js";
import { NoiseDetailsAllModel } from "./models/noiseDetailsAll.model.js";
import { AqmsMonitoringModel } from "./models/aqmsMonitoring.model.js";
import * as distronixService from "./services/distronix.service.js";
import { properties } from "./config/properties.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Livability third-party API service listening on port ${PORT}`);
});

/**
 * Scheduled jobs - equivalent to the old `Script/autorun_*.php` files that
 * were presumably hit by a cron-driven HTTP request or browser refresh.
 * Enable/adjust schedules as needed; disabled by default via env flag.
 */
if (process.env.ENABLE_CRON_JOBS === "true") {
  // EnggEnv water depth - every 15 minutes (autorun_swan_display.php style)
  cron.schedule("*/15 * * * *", async () => {
    try {
      const apiResponse = await enggenvService.getWaterDepth();
      await WaterSensorModel.syncFromApi(apiResponse, 1);
    } catch (err) {
      console.error("[cron] water-depth sync failed:", err.message);
    }
  });

  // EnggEnv AAQ - every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    try {
      const apiResponse = await enggenvService.getAaqFetchAll();
      await SensorWaterModel.syncFirstTwo(apiResponse, 1);
    } catch (err) {
      console.error("[cron] AAQ sync failed:", err.message);
    }
  });

  // Distronix ANMS (noise) - every 30 minutes (autorun_noise_all.php style)
  cron.schedule("*/30 * * * *", async () => {
    for (const property of properties) {
      if (!property.anms) continue;
      try {
        const apiResponse = await distronixService.getLatestData(
          property.anms.url,
          property.anms.token
        );
        await NoiseDetailsAllModel.syncFromApi(apiResponse, property.realEstateId);
      } catch (err) {
        console.error(`[cron] ANMS sync failed for ${property.key}:`, err.message);
      }
    }
  });

  // Distronix AQI - every 30 minutes (autorun_aqi_all.php style)
  cron.schedule("*/30 * * * *", async () => {
    for (const property of properties) {
      if (!property.aqi) continue;
      try {
        const apiResponse = await distronixService.getLatestData(
          property.aqi.url,
          property.aqi.token
        );
        await AqmsMonitoringModel.syncFromApi(apiResponse, property.realEstateId);
      } catch (err) {
        console.error(`[cron] AQI sync failed for ${property.key}:`, err.message);
      }
    }
  });

  console.log("Cron jobs enabled (water-depth, AAQ, ANMS, AQI).");
}
