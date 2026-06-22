import "dotenv/config";
import { httpClient } from "../utils/httpClient.js";

const BASE_URL = process.env.ENGGENV_BASE_URL || "https://apis.enggenv.com";
const WATER_DEVICE_ID = process.env.ENGGENV_WATER_DEVICE_ID || "GWR02310";
const AAQ_APP_KEY = process.env.ENGGENV_AAQ_APP_KEY;

/**
 * Equivalent of the legacy:
 *   $api_url = 'https://apis.enggenv.com/data/get/GWR02310';
 *   $json_data = file_get_contents($api_url);
 *
 * Used by: admin/api_data_for_water_pollution(_api).php, pcb/*, real_estate/*
 *
 * Response shape: { device: "...", data: { timestamp: [...], WaterDepth: [...] } }
 */
export async function getWaterDepth(deviceId = WATER_DEVICE_ID) {
  const { data } = await httpClient.get(`${BASE_URL}/data/get/${deviceId}`);
  return data;
}

/**
 * Equivalent of the legacy:
 *   $api_url = 'https://apis.enggenv.com/data/get/GWR02310/hourly';
 *
 * Used by: api_for_water.php, test_waterapi.php, test_waterapi1.php
 */
export async function getWaterDepthHourly(deviceId = WATER_DEVICE_ID) {
  const { data } = await httpClient.get(`${BASE_URL}/data/get/${deviceId}/hourly`);
  return data;
}

/**
 * Equivalent of the legacy:
 *   $api_url = 'https://apis.enggenv.com/api/aaq/v2/fetchAll?app-key=...';
 *
 * Used by: admin/api_new(_admin).php, pcb/api_new_pcb.php, real_estate/api_new.php
 *
 * Response shape: an array of station objects, each with
 *   { site, device_id, location: { place, lat, lon },
 *     data: { ph, tds, temp, ts_server, cod, bod, tss, id, date, time, read } }
 */
export async function getAaqFetchAll(appKey = AAQ_APP_KEY) {
  const { data } = await httpClient.get(`${BASE_URL}/api/aaq/v2/fetchAll`, {
    params: { "app-key": appKey },
  });
  return data;
}
