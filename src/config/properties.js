import "dotenv/config";

/**
 * One entry per real-estate property that has Distronix ANMS (noise) and/or
 * AQI (air quality) monitors.
 *
 * `key`            - short slug used in the route, e.g. /anms/swancourt/sync
 * `realEstateId`   - FK into `real_estate_master.id`
 * `anDetailsId`    - FK into `anms_details.id` used for `noise_details_all.an_details_id`
 *                     (set to the same value as realEstateId by default - adjust per property)
 * `aqDetailsId`    - FK into `aqms_details.id` used for `aqms_monitoring_main.aq_details_id`
 * `anms`           - { url, token } for the noise ("getlatestdata") feed
 * `aqi`            - { url, token } for the air-quality ("getlatestdata") feed
 *
 * All values are sourced from environment variables so secrets/tokens never
 * live in source control - see .env.example.
 */
function envInt(name, fallback = 0) {
  const v = process.env[name];
  return v ? parseInt(v, 10) : fallback;
}

function endpoint(prefix) {
  const url = process.env[`${prefix}_URL`];
  const token = process.env[`${prefix}_TOKEN`];
  return url ? { url, token } : null;
}

export const properties = [
  {
    key: "swancourt",
    name: "Swan Court",
    realEstateId: envInt("DISTRONIX_SWANCOURT_REAL_ESTATE_ID", 1),
    anDetailsId: envInt("DISTRONIX_SWANCOURT_REAL_ESTATE_ID", 1),
    aqDetailsId: envInt("DISTRONIX_SWANCOURT_REAL_ESTATE_ID", 1),
    anms: endpoint("DISTRONIX_SWANCOURT_ANMS"),
    aqi: endpoint("DISTRONIX_SWANCOURT_AQI"),
  },
  {
    key: "silverokepvt",
    name: "Silver Oak Estate",
    realEstateId: envInt("DISTRONIX_SILVEROKEPVT_REAL_ESTATE_ID", 2),
    anDetailsId: envInt("DISTRONIX_SILVEROKEPVT_REAL_ESTATE_ID", 2),
    aqDetailsId: envInt("DISTRONIX_SILVEROKEPVT_REAL_ESTATE_ID", 2),
    anms: endpoint("DISTRONIX_SILVEROKEPVT_ANMS"),
    aqi: endpoint("DISTRONIX_SILVEROKEPVT_AQI"),
  },
  {
    key: "southwinds",
    name: "South Winds",
    realEstateId: envInt("DISTRONIX_SOUTHWINDS_REAL_ESTATE_ID", 3),
    anDetailsId: envInt("DISTRONIX_SOUTHWINDS_REAL_ESTATE_ID", 3),
    aqDetailsId: envInt("DISTRONIX_SOUTHWINDS_REAL_ESTATE_ID", 3),
    anms: endpoint("DISTRONIX_SOUTHWINDS_ANMS"),
    aqi: endpoint("DISTRONIX_SOUTHWINDS_AQI"),
  },
  {
    key: "aurus",
    name: "Aurus",
    realEstateId: envInt("DISTRONIX_AURUS_REAL_ESTATE_ID", 4),
    anDetailsId: envInt("DISTRONIX_AURUS_REAL_ESTATE_ID", 4),
    aqDetailsId: envInt("DISTRONIX_AURUS_REAL_ESTATE_ID", 4),
    anms: endpoint("DISTRONIX_AURUS_ANMS"),
    aqi: endpoint("DISTRONIX_AURUS_AQI"),
  },
  {
    key: "srachi",
    name: "Srachi",
    realEstateId: envInt("DISTRONIX_SRACHI_REAL_ESTATE_ID", 5),
    anDetailsId: envInt("DISTRONIX_SRACHI_REAL_ESTATE_ID", 5),
    aqDetailsId: envInt("DISTRONIX_SRACHI_REAL_ESTATE_ID", 5),
    anms: endpoint("DISTRONIX_SRACHI_ANMS"),
    aqi: endpoint("DISTRONIX_SRACHI_AQI"),
  },
  {
    key: "simplex",
    name: "Simplex",
    realEstateId: envInt("DISTRONIX_SIMPLEX_REAL_ESTATE_ID", 6),
    anDetailsId: envInt("DISTRONIX_SIMPLEX_REAL_ESTATE_ID", 6),
    aqDetailsId: envInt("DISTRONIX_SIMPLEX_REAL_ESTATE_ID", 6),
    anms: endpoint("DISTRONIX_SIMPLEX_ANMS"),
    aqi: endpoint("DISTRONIX_SIMPLEX_AQI"),
  },
  {
    key: "moriya",
    name: "Moriya",
    realEstateId: envInt("DISTRONIX_MORIYA_REAL_ESTATE_ID", 7),
    anDetailsId: envInt("DISTRONIX_MORIYA_REAL_ESTATE_ID", 7),
    aqDetailsId: envInt("DISTRONIX_MORIYA_REAL_ESTATE_ID", 7),
    anms: null, // no ANMS (noise) feed for this property in the legacy code
    aqi: endpoint("DISTRONIX_MORIYA_AQI"),
  },
  {
    key: "fortis",
    name: "Fortis",
    realEstateId: envInt("DISTRONIX_FORTIS_REAL_ESTATE_ID", 8),
    anDetailsId: envInt("DISTRONIX_FORTIS_REAL_ESTATE_ID", 8),
    aqDetailsId: envInt("DISTRONIX_FORTIS_REAL_ESTATE_ID", 8),
    anms: null, // no ANMS (noise) feed for this property in the legacy code
    aqi: endpoint("DISTRONIX_FORTIS_AQI"),
  },
];

export function getPropertyByKey(key) {
  return properties.find((p) => p.key === key.toLowerCase());
}
