import { and, eq, like, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { state, district, city } from "../db/schema.js";

/**
 * Read-only reference/lookup data (state -> district -> city cascade).
 * No add/edit/delete exists anywhere in the legacy query set for these
 * tables - they're seeded once and only ever SELECTed to populate
 * dropdowns, so this model is intentionally read-only.
 *
 * Covers every distinct query pattern found in extracted_sql_queries.txt
 * referencing `state`, `district`, `city` (cascading dropdown fetches used
 * across nearly every admin/pcb/real_estate form: state -> district ->
 * city, plus a few direct id/name lookups and counts).
 */
export const LocationModel = {
  // --- State ---

  async listStates() {
    // SELECT * FROM state order by state
    return db.select().from(state).orderBy(state.state);
  },

  async getStateById(stateId) {
    // select * from state where state_id='$state_id'
    const [row] = await db.select().from(state).where(eq(state.stateId, stateId)).limit(1);
    return row ?? null;
  },

  async getStateByName(name) {
    // select * from state where state='$state_id' / state='West Bengal'
    const [row] = await db.select().from(state).where(eq(state.state, name)).limit(1);
    return row ?? null;
  },

  async countStates() {
    // select count(state_id) as id from state
    const [row] = await db.select({ count: sql`COUNT(${state.stateId})` }).from(state);
    return Number(row?.count) || 0;
  },

  // --- District ---

  async listDistricts() {
    // SELECT * FROM district
    return db.select().from(district);
  },

  async listDistrictsByState(stateId) {
    // select * from district where state_id='$state_id' order by district_name
    return db
      .select()
      .from(district)
      .where(eq(district.stateId, stateId))
      .orderBy(district.districtName);
  },

  async listDistrictNamesByState(stateId) {
    // select id,district_name from district where state_id='$state' order by district_name
    return db
      .select({ id: district.id, districtName: district.districtName })
      .from(district)
      .where(eq(district.stateId, stateId))
      .orderBy(district.districtName);
  },

  async listDistrictsOrderedByName() {
    // select id,district_name from district order by district_name
    return db
      .select({ id: district.id, districtName: district.districtName })
      .from(district)
      .orderBy(district.districtName);
  },

  async getDistrictById(id) {
    // SELECT * from district where id='$row2[district]' / select id,district_name from district where id='$ds'
    const [row] = await db.select().from(district).where(eq(district.id, id)).limit(1);
    return row ?? null;
  },

  async countDistrictsByState(stateId) {
    // select count(id) as id from district where state_id='$state_id'
    const [row] = await db
      .select({ count: sql`COUNT(${district.id})` })
      .from(district)
      .where(eq(district.stateId, stateId));
    return Number(row?.count) || 0;
  },

  /**
   * select count(d.id) as id from district as d,state as s
   * where d.state_id=s.state_id and s.state='West Bengal'
   */
  async countDistrictsByStateName(stateName) {
    const [row] = await db
      .select({ count: sql`COUNT(${district.id})` })
      .from(district)
      .innerJoin(state, eq(district.stateId, state.stateId))
      .where(eq(state.state, stateName));
    return Number(row?.count) || 0;
  },

  /**
   * select d.id,d.district_name from district as d,state as s
   * where d.state_id=s.state_id and s.state='West Bengal' order by d.district_name
   */
  async listDistrictsByStateName(stateName) {
    return db
      .select({ id: district.id, districtName: district.districtName })
      .from(district)
      .innerJoin(state, eq(district.stateId, state.stateId))
      .where(eq(state.state, stateName))
      .orderBy(district.districtName);
  },

  // --- City ---

  async listCities() {
    // SELECT * FROM city
    return db.select().from(city);
  },

  async listCitiesByDistrict(districtId) {
    // SELECT id,city_name FROM city where districtid='$district' order by city_name
    return db
      .select({ id: city.id, cityName: city.cityName })
      .from(city)
      .where(eq(city.districtid, districtId))
      .orderBy(city.cityName);
  },

  async listCitiesByState(stateId) {
    // SELECT * FROM city where state_id='$state_id'
    return db.select().from(city).where(eq(city.stateId, String(stateId)));
  },

  async getCityById(id) {
    // select * from city where id='$city_id' / select id,city_name from city where id='$cty'
    const [row] = await db.select().from(city).where(eq(city.id, id)).limit(1);
    return row ?? null;
  },

  /**
   * SELECT * FROM city WHERE city_name LIKE '{$_GET['term']}%' LIMIT 25
   * (legacy autocomplete endpoint)
   */
  async searchCitiesByNamePrefix(term, limit = 25) {
    return db
      .select()
      .from(city)
      .where(like(city.cityName, `${term}%`))
      .limit(limit);
  },

  /**
   * select count(re.id) as id,c.city from city as c,real_estate_master as re
   * where c.id=re.city group by re.city
   *
   * NOTE: kept here for completeness since it was found alongside the
   * other `city` queries, but it actually counts real_estate_master rows
   * grouped by city - properly belongs in the real estate module once
   * that's migrated. Left as a thin pass-through for now.
   */
};
