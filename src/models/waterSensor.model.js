import { and, between, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { waterSensorAll, waterSensor, realEstateMaster } from "../db/schema.js";
import { parseApiTimestamp } from "../utils/dateTime.js";

/** Columns selected in list queries (sensor row + estate name) */
const listColumns = {
  id: waterSensorAll.id,
  device: waterSensorAll.device,
  timestamp: waterSensorAll.timestamp,
  waterdepth: waterSensorAll.waterdepth,
  realEstateId: waterSensorAll.realEstateId,
  realEstateName: realEstateMaster.realEstateName,
};

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

  // --- Query methods for Water Pollution / Water Sensor listing ---

  /**
   * List all sensor readings, optionally filtered by realEstateId.
   * realEstateId = 0 → return all records across all properties.
   */
  async listByRealEstate(realEstateId) {
    const conditions = realEstateId === 0
      ? undefined
      : eq(waterSensorAll.realEstateId, realEstateId);
    return db
      .select(listColumns)
      .from(waterSensorAll)
      .leftJoin(realEstateMaster, eq(waterSensorAll.realEstateId, realEstateMaster.id))
      .where(conditions)
      .orderBy(desc(waterSensorAll.timestamp));
  },

  /**
   * Return only the most recent reading for each property (or for a specific one).
   * realEstateId = 0 → last record for every property.
   */
  async listLastByRealEstate(realEstateId) {
    if (realEstateId === 0) {
      return db
        .select(listColumns)
        .from(waterSensorAll)
        .leftJoin(realEstateMaster, eq(waterSensorAll.realEstateId, realEstateMaster.id))
        .orderBy(desc(waterSensorAll.timestamp))
        .limit(50);
    }
    return db
      .select(listColumns)
      .from(waterSensorAll)
      .leftJoin(realEstateMaster, eq(waterSensorAll.realEstateId, realEstateMaster.id))
      .where(eq(waterSensorAll.realEstateId, realEstateId))
      .orderBy(desc(waterSensorAll.timestamp))
      .limit(1);
  },

  /**
   * List readings within a date range, optionally filtered by realEstateId.
   * from / to should be "YYYY-MM-DD" strings.
   */
  async listByDateRange(realEstateId, fromDate, toDate) {
    const fromDt = new Date(`${fromDate}T00:00:00`);
    const toDt   = new Date(`${toDate}T23:59:59`);

    const conditions = realEstateId === 0
      ? between(waterSensorAll.timestamp, fromDt, toDt)
      : and(
          eq(waterSensorAll.realEstateId, realEstateId),
          between(waterSensorAll.timestamp, fromDt, toDt)
        );

    return db
      .select(listColumns)
      .from(waterSensorAll)
      .leftJoin(realEstateMaster, eq(waterSensorAll.realEstateId, realEstateMaster.id))
      .where(conditions)
      .orderBy(desc(waterSensorAll.timestamp));
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

