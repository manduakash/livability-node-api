import "dotenv/config";
import { httpClient } from "../utils/httpClient.js";

const BASE_URL =
  process.env.PARIBESH_BASE_URL ||
  "https://api.paribesh.wtlprojects.com/api/v1/admin/get_noise_data_by_name";

/**
 * Equivalent of the legacy:
 *   $api_url = 'https://api.paribesh.wtlprojects.com/api/v1/admin/get_noise_data_by_name?name=New Market';
 *   $json_data = file_get_contents($api_url); // or curl in pcb/progress2.php
 *
 * Used by: admin/noise_api_new.php, real_estate/noise_api_new.php, pcb/progress2.php
 *
 * Response shape: { data: [{ header, subheader, zone, date, value }, ...] }
 */
export async function getNoiseDataByName(name) {
  const { data } = await httpClient.get(BASE_URL, {
    params: { name },
  });
  return data;
}
