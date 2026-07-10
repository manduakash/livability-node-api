import { and, between, eq, like, sql, desc, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { solarEnergy, solarGeneration, realEstateMaster } from "../db/schema.js";

/**
 * solar_energy: one config/status row per property for solar installation
 * - same delete+reinsert / flag yes-no pattern as stp, waste_related, etc.
 * Has one extra wrinkle: a standalone `points` UPDATE used by the
 * livability-index scoring pass (kept separate from the full upsert since
 * the legacy code calls it independently in several places).
 */
export const SolarEnergyModel = {
  async getNextId() {
    const [row] = await db.select({ maxId: sql`MAX(${solarEnergy.id})` }).from(solarEnergy);
    return (Number(row?.maxId) || 0) + 1;
  },

  async getByRealEstate(realEstateId) {
    const rows = await db
      .select()
      .from(solarEnergy)
      .where(eq(solarEnergy.realEstateId, realEstateId))
      .orderBy(desc(solarEnergy.id));
    return rows[0] ?? null;
  },

  async getFlag(realEstateId) {
    const [row] = await db
      .select({ flag: solarEnergy.flag })
      .from(solarEnergy)
      .where(eq(solarEnergy.realEstateId, realEstateId))
      .limit(1);
    return row?.flag ?? null;
  },

  async getCapacity(realEstateId) {
    const [row] = await db
      .select({ capacity: solarEnergy.capacity })
      .from(solarEnergy)
      .where(eq(solarEnergy.realEstateId, realEstateId))
      .limit(1);
    return row?.capacity ?? null;
  },

  /** update solar_energy set points='$points' where real_estate_id='$id' */
  async updatePoints(realEstateId, points) {
    await db.update(solarEnergy).set({ points }).where(eq(solarEnergy.realEstateId, realEstateId));
  },

  async upsert({
    capacity,
    warrantyValidity,
    mfg,
    address,
    gst,
    contactName,
    mobile,
    email,
    period,
    points,
    remarks,
    flag,
    realEstateId,
    installDate,
  }) {
    await db.delete(solarEnergy).where(eq(solarEnergy.realEstateId, realEstateId));

    const id = await this.getNextId();
    await db.insert(solarEnergy).values({
      id,
      capacity: capacity ?? "",
      warrantyValidity: warrantyValidity ?? "",
      mfg: mfg ?? "",
      address: address ?? "",
      gst: gst ?? "",
      contactName: contactName ?? "",
      mobile: mobile ?? "",
      email: email ?? "",
      period: period ?? new Date(),
      points: points ?? 0,
      remarks: remarks ?? "",
      flag: flag ?? "no",
      realEstateId,
      installDate: installDate ?? new Date(),
    });

    return id;
  },
};

/**
 * solar_generation: per-date solar output readings. `id` is a genuine
 * AUTO_INCREMENT column, supports full CRUD (unlike most device-config
 * tables which only delete+reinsert).
 */
export const SolarGenerationModel = {
  async create({ dt, solarReadings, realEstateId }) {
    const [result] = await db.insert(solarGeneration).values({ dt, solarReadings, realEstateId });
    return result.insertId;
  },

  async getById(id, realEstateId) {
    const [row] = await db
      .select()
      .from(solarGeneration)
      .where(and(eq(solarGeneration.id, id), eq(solarGeneration.realEstateId, realEstateId)))
      .limit(1);
    return row ?? null;
  },

  async update(id, realEstateId, { dt, solarReadings }) {
    const existing = await this.getById(id, realEstateId);
    if (!existing) return null;

    await db
      .update(solarGeneration)
      .set({ dt, solarReadings })
      .where(and(eq(solarGeneration.id, id), eq(solarGeneration.realEstateId, realEstateId)));

    return { id, dt, solarReadings, realEstateId };
  },

  async remove(id, realEstateId) {
    const existing = realEstateId
      ? await this.getById(id, realEstateId)
      : (await db.select().from(solarGeneration).where(eq(solarGeneration.id, id)).limit(1))[0];

    if (!existing) return null;

    const conditions = realEstateId
      ? and(eq(solarGeneration.id, id), eq(solarGeneration.realEstateId, realEstateId))
      : eq(solarGeneration.id, id);

    await db.delete(solarGeneration).where(conditions);
    return existing;
  },

  async listByRealEstate(realEstateId) {
    return db
      .select()
      .from(solarGeneration)
      .where(eq(solarGeneration.realEstateId, realEstateId))
      .orderBy(desc(solarGeneration.dt));
  },

  /** select * from solar_generation where dt between '$dd1' and '$dd2' and real_estate_id='$real_estate_id' */
  async listByDateRange(realEstateId, fromDate, toDate) {
    return db
      .select()
      .from(solarGeneration)
      .where(
        and(eq(solarGeneration.realEstateId, realEstateId), between(solarGeneration.dt, fromDate, toDate))
      );
  },

  /** select * from solar_generation where dt like '%$dd%' and real_estate_id='$real_estate_id' */
  async listByDateLike(realEstateId, datePattern) {
    return db
      .select()
      .from(solarGeneration)
      .where(
        and(eq(solarGeneration.realEstateId, realEstateId), like(solarGeneration.dt, `%${datePattern}%`))
      );
  },

  /**
   * SELECT solar_readings,dt from solar_generation where real_estate_id='$id'
   * group by dt order by dt DESC limit 10
   * (legacy "last 10 readings" chart query)
   */
  async listRecentForChart(realEstateId, limit = 10) {
    return db
      .select({
        dt: solarGeneration.dt,
        solarReadings: solarGeneration.solarReadings,
      })
      .from(solarGeneration)
      .where(eq(solarGeneration.realEstateId, realEstateId))
      .orderBy(desc(solarGeneration.dt))
      .limit(limit);
  },

  async getSolarGenerationReport(realEstateId, fromDate, toDate) {
    const conditions = [];

    if (Number(realEstateId) !== 0) {
      conditions.push(eq(solarGeneration.realEstateId, Number(realEstateId)));
    }
    if (fromDate) {
      conditions.push(sql`${solarGeneration.dt} >= ${fromDate}`);
    }
    if (toDate) {
      conditions.push(sql`${solarGeneration.dt} <= ${toDate}`);
    }

    const rows = await db
      .select({
        id: solarGeneration.id,
        realEstateId: solarGeneration.realEstateId,
        realEstateName: realEstateMaster.realEstateName,
        dt: solarGeneration.dt,
        solarReadings: solarGeneration.solarReadings,
        capacity: solarEnergy.capacity,
      })
      .from(solarGeneration)
      .leftJoin(realEstateMaster, eq(solarGeneration.realEstateId, realEstateMaster.id))
      .leftJoin(solarEnergy, eq(solarGeneration.realEstateId, solarEnergy.realEstateId))
      .where(and(...conditions))
      .orderBy(asc(solarGeneration.dt));

    return rows.map((r, i) => {
      const numericReadings = parseFloat(r.solarReadings) || 0;
      const numericCapacity = parseFloat(r.capacity) || 0;
      let percentOfInstalledTarget = 0;
      if (numericCapacity > 0) {
        percentOfInstalledTarget = Number(((numericReadings / numericCapacity) * 100).toFixed(2));
      }

      let year = "";
      let formattedDate = "";
      if (r.dt) {
        const dateObj = new Date(r.dt);
        if (!isNaN(dateObj.getTime())) {
          year = String(dateObj.getFullYear());
          const d = String(dateObj.getDate()).padStart(2, '0');
          const m = String(dateObj.getMonth() + 1).padStart(2, '0');
          const y = dateObj.getFullYear();
          formattedDate = `${d}-${m}-${y}`;
        }
      }

      return {
        slNo: i + 1,
        sl: i + 1,
        realEstateId: r.realEstateId,
        realEstateName: r.realEstateName,
        estate: r.realEstateName,
        year,
        date: formattedDate,
        totalUnitGenerated: r.solarReadings,
        generated: r.solarReadings,
        installedTarget: r.capacity || "0 KW",
        percentOfInstalledTarget,
        targetPct: percentOfInstalledTarget,
      };
    });
  },
};
