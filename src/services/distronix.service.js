import { httpClient } from "../utils/httpClient.js";

/**
 * Equivalent of the legacy jQuery $.ajax() calls in
 * admin/real_anms_admin.php and admin/air_quality_moni_sta_admin.php:
 *
 *   $.ajax({
 *     url: "https://anms.<property>.distronix.in/<property>/getlatestdata",
 *     type: "GET",
 *     headers: { "Authorization": "barrier <token>" }
 *   })
 *
 * Works for both the ANMS (noise) and AQI (air quality) feeds - they share
 * the same response envelope, just with different `data` payloads.
 *
 * ANMS `data` shape:
 *   { location, timestamp, las, lcs, lzs, laeqt, lapeakt, lceqt, lcpeakt,
 *     lzeqt, lzpeakt, temperature_degree_celsius }
 *
 * AQI `data` shape:
 *   { ext_humi_avg, ext_humi_max, ..., pm25_avg, pm10_avg, no2_avg, so2_avg,
 *     last_online, aqi, ... }
 */
export async function getLatestData(url, token) {
  const headers = {};
  if (token) headers.Authorization = token;

  const { data } = await httpClient.get(url, { headers });
  return data;
}
