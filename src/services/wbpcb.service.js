import "dotenv/config";
import { httpClient } from "../utils/httpClient.js";

const BASE_URL =
  process.env.WBPCB_BASE_URL || "http://emis.wbpcb.gov.in/airquality/stndtlsdata";
const DEFAULT_STATION_ID = process.env.WBPCB_DEFAULT_STATION_ID || "01116";

/**
 * Equivalent of the legacy curl call in pcb/aqms_api.php:
 *   $url = "http://emis.wbpcb.gov.in/airquality/stndtlsdata?stnid=01116";
 *
 * Response shape:
 *   {
 *     prompol, status, upddate, stnname, stncode,
 *     data: [{ pollutant, minval, avgval, maxval }, ...],
 *     pastaqi: [{ aqi, date }, ...]
 *   }
 */
export async function getStationDetails(stationId = DEFAULT_STATION_ID) {
  const { data } = await httpClient.get(BASE_URL, {
    params: { stnid: stationId },
  });
  return data;
}
