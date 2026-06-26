import { db } from "../db/index.js";
import { feedBackReal } from "../db/schema.js";

/**
 * Only INSERT exists for this table in the legacy query set (resident
 * feedback form on the real_estate portal) - write-only model, same as
 * contact_us. Two slightly different column sets were found in the dump
 * ('comments' vs 'comm') - the live schema uses `comm`, so that's what's
 * implemented here.
 */
export const FeedBackRealModel = {
  async create({ feed, rating1, rating2, rating3, rating4, rating5, rating6, list, comm, realEstateId }) {
    const [result] = await db.insert(feedBackReal).values({
      feed,
      rating1,
      rating2,
      rating3,
      rating4,
      rating5,
      rating6,
      list,
      comm,
      realEstateId,
    });
    return result.insertId;
  },
};
