import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { waterSensorAll, waterSensor } from "../db/schema.js";
import { parseApiTimestamp } from "../utils/dateTime.js";

/**
 * Mirrors the legacy duplicate-check + manual id increment pattern:
 *
 *   $max = GetResultSet("select max(id) as id from water_sensor_all");
 *   $id = $r_max['id'] + 1;
 *   $chk_duplicate = GetResultSet("select * from water_sensor_all
 *       where timestamp='$ts' and waterdepth='$wd' and real_estate_id='1'");
 *   if (no duplicate) INSERT ...
 */
export const WaterSensorModel = {
  async getNextId() {
    const [row] = await db
      .select({ maxId: sql`MAX(${waterSensorAll.id})` })
      .from(waterSensorAll);
    return (Number(row?.maxId) || 0) + 1;
  },

  async existsReading(timestamp, waterdepth, realEstateId) {
    const ts = parseApiTimestamp(timestamp);
    const rows = await db
      .select({ id: waterSensorAll.id })
      .from(waterSensorAll)
      .where(
        and(
          eq(waterSensorAll.timestamp, ts),
          eq(waterSensorAll.waterdepth, waterdepth),
          eq(waterSensorAll.realEstateId, realEstateId)
        )
      )
      .limit(1);

    return rows.length > 0;
  },

  async insertReading({ device, timestamp, waterdepth, realEstateId }) {
    const id = await this.getNextId();
    await db.insert(waterSensorAll).values({
      id,
      device,
      timestamp: parseApiTimestamp(timestamp),
      waterdepth,
      realEstateId,
    });
    return id;
  },

  /**
   * Syncs every (timestamp, WaterDepth) pair returned by the EnggEnv
   * `data/get/{device}` endpoint, skipping rows that already exist.
   */
  async syncFromApi(apiResponse, realEstateId) {
    const userData = apiResponse?.data;
    const device = apiResponse?.device;
    const timestamps = userData?.timestamp || [];
    const depths = userData?.WaterDepth || [];

    let inserted = 0;
    for (let k = 0; k < timestamps.length; k++) {
      const ts = timestamps[k];
      const wd = depths[k];

      const duplicate = await this.existsReading(ts, wd, realEstateId);
      if (!duplicate) {
        await this.insertReading({ device, timestamp: ts, waterdepth: wd, realEstateId });
        inserted++;
      }
    }

    return { total: timestamps.length, inserted };
  },

  // --- water_sensor (singular table) ---
  // Older/simpler legacy variant found in test_waterapi.php: no dedupe
  // check, single direct insert per API call rather than looping over the
  // full timestamp/WaterDepth arrays. `id` has no AUTO_INCREMENT, so we
  // replicate the same manual-increment approach as water_sensor_all.

  async getNextIdSingle() {
    const [row] = await db.select({ maxId: sql`MAX(${waterSensor.id})` }).from(waterSensor);
    return (Number(row?.maxId) || 0) + 1;
  },

  /**
   * Mirrors test_waterapi.php:
   *   INSERT INTO `water_sensor`(`device`,`timestamp`,`waterdepth`,`real_estate_id`)
   *   values('$user_device','$user_data->timestamp','$user_data->WaterDepth','1')
   */
  async insertSingleReading({ device, timestamp, waterdepth, realEstateId = 1 }) {
    const id = await this.getNextIdSingle();
    await db.insert(waterSensor).values({
      id,
      device,
      timestamp: parseApiTimestamp(timestamp),
      waterdepth,
      realEstateId,
    });
    return id;
  },
};
