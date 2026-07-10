import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  ecMonitoringMicroAna,
  ecMonitoringChemAna,
  ecModuleProjectView,
  ecModuleFieldPhotograph,
  ecRemedial,
  ecInterMonTest,
} from "../db/schema.js";

/**
 * ec_monitoring_micro_ana: microbial analysis results, one or more rows
 * per ec_module record, keyed by a `microbial_analysis` type index (1, 2
 * found in legacy queries - presumably "before"/"after" or similar).
 * Mirrors the legacy delete-then-reinsert-per-type pattern.
 */
export const EcMonitoringMicroAnaModel = {
  async listForEcModule(ecModuleId, realEstateId) {
    const conditions = realEstateId
      ? and(eq(ecMonitoringMicroAna.ecModuleId, ecModuleId), eq(ecMonitoringMicroAna.realEstateId, realEstateId))
      : eq(ecMonitoringMicroAna.ecModuleId, ecModuleId);
    return db.select().from(ecMonitoringMicroAna).where(conditions);
  },

  async getByType(ecModuleId, microbialAnalysis) {
    const [row] = await db
      .select()
      .from(ecMonitoringMicroAna)
      .where(
        and(
          eq(ecMonitoringMicroAna.ecModuleId, ecModuleId),
          eq(ecMonitoringMicroAna.microbialAnalysis, microbialAnalysis)
        )
      )
      .limit(1);
    return row ?? null;
  },

  async set({
    realEstateId,
    ecModuleId,
    sampleCollection,
    sampleDrawn,
    microbialAnalysis,
    testParameter,
    limitAsPer,
    result,
    sessionKey,
  }) {
    await db
      .delete(ecMonitoringMicroAna)
      .where(
        and(
          eq(ecMonitoringMicroAna.ecModuleId, ecModuleId),
          eq(ecMonitoringMicroAna.microbialAnalysis, microbialAnalysis)
        )
      );

    const [res] = await db.insert(ecMonitoringMicroAna).values({
      realEstateId,
      ecModuleId,
      sampleCollection: sampleCollection ?? "",
      sampleDrawn: sampleDrawn ?? new Date(),
      microbialAnalysis,
      testParameter: testParameter ?? "",
      limitAsPer: limitAsPer ?? "",
      result: result ?? "",
      sessionKey: sessionKey ?? "",
    });

    return res.insertId;
  },

  async setAll(ecModuleId, realEstateId, microbialAnalysis, sampleCollection, sampleDrawn, sessionKey, items) {
    await db
      .delete(ecMonitoringMicroAna)
      .where(
        and(
          eq(ecMonitoringMicroAna.ecModuleId, ecModuleId),
          eq(ecMonitoringMicroAna.microbialAnalysis, microbialAnalysis)
        )
      );

    const ids = [];
    for (const item of items) {
      const [res] = await db.insert(ecMonitoringMicroAna).values({
        realEstateId,
        ecModuleId,
        sampleCollection: sampleCollection ?? "",
        sampleDrawn: sampleDrawn ? new Date(sampleDrawn) : new Date(),
        microbialAnalysis,
        testParameter: item.test_parameter ?? "",
        limitAsPer: item.limit_is10500_2012 ?? "",
        result: item.result ?? "",
        sessionKey: sessionKey ?? "",
      });
      ids.push(res.insertId);
    }
    return ids;
  },
};

/**
 * ec_monitoring_chem_ana: chemical analysis results - same shape/pattern
 * as ec_monitoring_micro_ana, keyed by `chemical_analysis` type index.
 */
export const EcMonitoringChemAnaModel = {
  async listForEcModule(ecModuleId) {
    return db.select().from(ecMonitoringChemAna).where(eq(ecMonitoringChemAna.ecModuleId, ecModuleId));
  },

  async getByType(ecModuleId, chemicalAnalysis) {
    const [row] = await db
      .select()
      .from(ecMonitoringChemAna)
      .where(
        and(
          eq(ecMonitoringChemAna.ecModuleId, ecModuleId),
          eq(ecMonitoringChemAna.chemicalAnalysis, chemicalAnalysis)
        )
      )
      .limit(1);
    return row ?? null;
  },

  async set({
    realEstateId,
    ecModuleId,
    sampleCollection,
    sampleDrawn,
    chemicalAnalysis,
    testParameter,
    desirableLimit,
    permissibleLimit,
    result,
    sessionKey,
  }) {
    await db
      .delete(ecMonitoringChemAna)
      .where(
        and(
          eq(ecMonitoringChemAna.ecModuleId, ecModuleId),
          eq(ecMonitoringChemAna.chemicalAnalysis, chemicalAnalysis)
        )
      );

    const [res] = await db.insert(ecMonitoringChemAna).values({
      realEstateId,
      ecModuleId,
      sampleCollection: sampleCollection ?? "",
      sampleDrawn: sampleDrawn ?? new Date(),
      chemicalAnalysis,
      testParameter: testParameter ?? "",
      desirableLimit: desirableLimit ?? "",
      permissibleLimit: permissibleLimit ?? "",
      result: result ?? "",
      sessionKey: sessionKey ?? "",
    });

    return res.insertId;
  },

  async setAll(ecModuleId, realEstateId, chemicalAnalysis, sampleCollection, sampleDrawn, sessionKey, items) {
    await db
      .delete(ecMonitoringChemAna)
      .where(
        and(
          eq(ecMonitoringChemAna.ecModuleId, ecModuleId),
          eq(ecMonitoringChemAna.chemicalAnalysis, chemicalAnalysis)
        )
      );

    const ids = [];
    for (const item of items) {
      const [res] = await db.insert(ecMonitoringChemAna).values({
        realEstateId,
        ecModuleId,
        sampleCollection: sampleCollection ?? "",
        sampleDrawn: sampleDrawn ? new Date(sampleDrawn) : new Date(),
        chemicalAnalysis,
        testParameter: item.test_parameter ?? "",
        desirableLimit: item.desirable_limit ?? "",
        permissibleLimit: item.permissible_limit ?? "",
        result: item.result ?? "",
        sessionKey: sessionKey ?? "",
      });
      ids.push(res.insertId);
    }
    return ids;
  },
};

/**
 * ec_module_project_view / ec_module_field_photograph: image galleries,
 * one-to-many per ec_module record. The legacy "edit" flow deletes ALL
 * existing images for the ec_module then re-inserts the full new set
 * (not per-image), so `replaceAll` mirrors that.
 */
export const EcModuleProjectViewModel = {
  async listForEcModule(ecModuleId) {
    return db.select().from(ecModuleProjectView).where(eq(ecModuleProjectView.ecModuleId, ecModuleId));
  },

  async listBySession(sessionKey, realEstateId) {
    return db
      .select()
      .from(ecModuleProjectView)
      .where(
        and(eq(ecModuleProjectView.sessionKey, sessionKey), eq(ecModuleProjectView.realEstateId, realEstateId))
      );
  },

  async replaceAll(ecModuleId, realEstateId, images) {
    await db.delete(ecModuleProjectView).where(eq(ecModuleProjectView.ecModuleId, ecModuleId));

    const ids = [];
    for (const img of images) {
      const [res] = await db.insert(ecModuleProjectView).values({
        realEstateId,
        ecModuleId,
        image: img.image,
        imageTitle: img.imageTitle ?? "",
        sessionKey: img.sessionKey ?? "",
      });
      ids.push(res.insertId);
    }
    return ids;
  },
};

export const EcModuleFieldPhotographModel = {
  async listForEcModule(ecModuleId) {
    return db
      .select()
      .from(ecModuleFieldPhotograph)
      .where(eq(ecModuleFieldPhotograph.ecModuleId, ecModuleId));
  },

  async replaceAll(ecModuleId, realEstateId, images) {
    await db.delete(ecModuleFieldPhotograph).where(eq(ecModuleFieldPhotograph.ecModuleId, ecModuleId));

    const ids = [];
    for (const img of images) {
      const [res] = await db.insert(ecModuleFieldPhotograph).values({
        realEstateId,
        ecModuleId,
        fieldImage: img.fieldImage,
        fieldImageTitle: img.fieldImageTitle ?? "",
        sessionKey: img.sessionKey ?? "",
      });
      ids.push(res.insertId);
    }
    return ids;
  },
};

/**
 * ec_remedial / ec_inter_mon_test: one row per ec_module record (delete +
 * reinsert on save), identical shape - result + air/noise/water quality
 * text fields.
 */
function createEcSingleRecordModel(table) {
  return {
    async getForEcModule(ecModuleId, realEstateId) {
      const conditions = realEstateId
        ? and(eq(table.ecModuleId, ecModuleId), eq(table.realEstateId, realEstateId))
        : eq(table.ecModuleId, ecModuleId);
      const [row] = await db.select().from(table).where(conditions).limit(1);
      return row ?? null;
    },

    async upsert({ realEstateId, ecModuleId, result, airQua, noiseQua, waterQua, sessionKey }) {
      await db.delete(table).where(eq(table.ecModuleId, ecModuleId));

      const [res] = await db.insert(table).values({
        realEstateId,
        ecModuleId,
        result: result ?? "",
        airQua: airQua ?? "",
        noiseQua: noiseQua ?? "",
        waterQua: waterQua ?? "",
        sessionKey: sessionKey ?? "",
      });

      return res.insertId;
    },
  };
}

export const EcRemedialModel = createEcSingleRecordModel(ecRemedial);
export const EcInterMonTestModel = createEcSingleRecordModel(ecInterMonTest);
