import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { anmsDetail, noiseDetailsAll } from "../db/schema.js";
import { parseApiTimestamp } from "../utils/dateTime.js";

/**
 * Mirrors admin/save_anms_data_admin.php:
 *
 *   $db = round((las+lcs+lzs+laeqt+lapeakt+lceqt+lcpeakt+lzeqt+lzpeakt)/9);
 *   points/remarks derived from $db (vgood / good / poor)
 *   $id = max(id)+1
 *   INSERT INTO noise_details_all (...)
 */
export const NoiseDetailsAllModel = {
  /**
   * The legacy code only proceeds if the property's `anms_detail.flag_anms`
   * row says "yes" - returns { allowed, anDetailsId }.
   */
  async getAnmsFlag(realEstateId) {
    const [row] = await db
      .select({ id: anmsDetail.id, flagAnms: anmsDetail.flagAnms })
      .from(anmsDetail)
      .where(eq(anmsDetail.realEstateId, realEstateId))
      .orderBy(desc(anmsDetail.id))
      .limit(1);

    return {
      allowed: row?.flagAnms === "yes",
      anDetailsId: row?.id ?? null,
    };
  },

  async getNextId() {
    const [row] = await db
      .select({ maxId: sql`MAX(${noiseDetailsAll.id})` })
      .from(noiseDetailsAll);
    return (Number(row?.maxId) || 0) + 1;
  },

  computeScore(values) {
    const sum = values.reduce((acc, v) => acc + (Number(v) || 0), 0);
    const db_ = Math.round(sum / values.length);

    let points = 0;
    let remarks = "poor";
    if (db_ > 0 && db_ <= 60) {
      points = 10;
      remarks = "vgood";
    } else if (db_ >= 61 && db_ <= 90) {
      points = 5;
      remarks = "good";
    } else if (db_ >= 91) {
      points = 0;
      remarks = "poor";
    }

    return { db: db_, points, remarks };
  },

  async insertReading(reading) {
    const id = await this.getNextId();
    await db.insert(noiseDetailsAll).values({ id, ...reading });
    return id;
  },

  /**
   * Full sync, mirroring the ANMS branch of admin/real_anms_admin.php +
   * admin/save_anms_data_admin.php.
   */
  async syncFromApi(apiResponse, realEstateId) {
    const { allowed, anDetailsId } = await this.getAnmsFlag(realEstateId);
    if (!allowed) {
      return { skipped: true, reason: "anms_detail.flag_anms is not 'yes' for this property" };
    }

    const res = apiResponse?.data;
    if (!res) {
      return { skipped: true, reason: "API response had no `data` payload" };
    }

    const las = res.las;
    const lcs = res.lcs;
    const lzs = res.lzs;
    const laeqt = res.laeqt;
    const lapeakt = res.lapeakt;
    const lceqt = res.lceqt;
    const lcpeakt = res.lcpeakt;
    const lzeqt = res.lzeqt;
    const lzpeakt = res.lzpeakt;

    const { points, remarks } = this.computeScore([
      las,
      lcs,
      lzs,
      laeqt,
      lapeakt,
      lceqt,
      lcpeakt,
      lzeqt,
      lzpeakt,
    ]);

    const id = await this.insertReading({
      anDetailsId: anDetailsId ?? realEstateId,
      location: String(res.location ?? ""),
      timeS: parseApiTimestamp(res.timestamp),
      las: Number(las) || 0,
      lcs: Number(lcs) || 0,
      lzs: Number(lzs) || 0,
      laeqt: Number(laeqt) || 0,
      lapeakt: Number(lapeakt) || 0,
      lceqt: Number(lceqt) || 0,
      lcpeakt: Number(lcpeakt) || 0,
      lzeqt: Number(lzeqt) || 0,
      lzpeakt: Number(lzpeakt) || 0,
      pointsAnms: points,
      remarksAnms: remarks,
      temperatureDegreeCelsius: Number(res.temperature_degree_celsius) || 0,
      realEstateId,
    });

    return { inserted: 1, id, points, remarks };
  },
};
