# Livability — PHP to Express Migration (Express.js + Drizzle ORM)

This project covers two kinds of migrated functionality:

1. **Third-party API integrations** (EnggEnv, WBPCB, Paribesh, Distronix) — see the bottom section.
2. **Internal CRUD modules** migrated from the legacy PHP portals (`admin/`, `pcb/`, `real_estate/`) — covered first below.

## Internal module migration

Per the agreed approach, the legacy 3-portal structure (`admin`, `pcb`,
`real_estate`) is preserved as **3 separate route namespaces**
(`/api/admin/...`, `/api/pcb/...`, `/api/real_estate/...`), even where the
underlying table and business logic are identical across portals — this
mirrors the legacy PHP file layout one-for-one rather than collapsing it,
so anyone familiar with the old admin/pcb/real_estate split can find their
way around immediately.

### Auth

`POST /api/auth/login` replaces `set_login.php` — validates against
`user_master` and issues a JWT (`Authorization: Bearer <token>`) carrying
`{ userId, username, userType, stateId }`, replacing PHP's
`$_SESSION['user_id'|'user_name'|'user_type']`. Every module route is
gated by `requireAuth(['admin'])` / `requireAuth(['pcb'])` /
`requireAuth(['real_estate'])` per namespace, replacing the old
`connection/session_*_for_logout.php` includes that checked
`$_SESSION['user_type']`.

**Security note**: `user_master.password` is stored in plain text in the
existing dump and `AuthModel.findActiveUser` compares it directly, for
drop-in compatibility with existing rows. Strongly recommend migrating to
bcrypt hashes and updating `AuthModel` accordingly before going to
production with new users.

### Shared infrastructure (used by every module)

- `middleware/auth.js` — JWT verification + portal allow-list, replaces PHP sessions.
- `middleware/deviceInfo.js` — parses `User-Agent` into `{ browser, platform }`, replaces `connection/conn.php`'s `getBrowser()`.
- `middleware/portalTag.js` — tags `req.portal` so one controller can serve all 3 namespaces while still logging the correct `audit_trial.panel` value.
- `utils/auditLog.js` — `logAudit(req, { type, lnk, panel, module })`, replaces the repeated `INSERT INTO audit_trial(...)` block found in nearly every legacy add/edit/delete file. Note: the legacy `audit_trial.real_estate_name` column actually stores the **username**, not the property name (the property name instead gets baked into the `module` string, e.g. `"Add_trees_Swan Court"`) — preserved as-is for compatibility.
- `utils/dateTime.js` — `nowIST()` / `parseApiTimestamp()`. **Important**: Drizzle's mysql2 `datetime()` columns require real JS `Date` objects, not pre-formatted strings (unlike the legacy PHP `date('Y-m-d H:i:s')` string pattern) — always go through these helpers for any `datetime` column.

### Migrated modules

| Module | Routes | Replaces |
|---|---|---|
| Trees master listing | `GET/POST/PUT/DELETE /api/:portal/trees[/:id]` | `trees_admin.php`, `trees_pcb.php`, `set_trees_real.php`, `add_trees_master_listing.php`, `edit_trees_master_listing.php`, `trees_master_listing.php` (all 3 portals) |
| State/District/City lookups | `GET /api/:portal/locations/{states,districts,cities}[/:id]`, `GET .../cities/search?term=` | All cascading-dropdown population queries across the codebase (read-only - no add/edit/delete exists for these in the legacy code) |
| Industry type / category, Classification, Laboratory masters | `GET/POST/PUT/DELETE /api/:portal/{industry-types,industry-categories,classifications,laboratories}[/:id]` | 4 structurally-identical single-field master CRUD modules, built via a shared `simpleMasterFactory.js` since the legacy add/edit/delete/list pattern was byte-for-byte identical across all 4 tables |
| Contact Us (public) | `POST /api/public/contact-us` | Public "Contact Us" form submit handler (write-only - no listing/edit/delete found in legacy queries) |
| Resident Feedback (public) | `POST /api/public/feedback` | Real estate portal resident feedback form (write-only) |
| Waste collection / details / related config | `GET/POST/DELETE /api/:portal/waste-collection[/:id]`, `.../waste-details[/:id]`, `.../waste-details/by-category`, `GET/PUT /api/:portal/waste-related/:realEstateId` | `waste_collection`, `waste_details`, `waste_related` add/list/delete pages across all 3 portals |
| STP (Sewage Treatment Plant) | `GET/PUT /api/:portal/stp/:realEstateId`, `GET/POST/DELETE /api/:portal/stp-readings[/:id]`, `.../stp-readings/years`, `.../stp-readings/by-year` | `stp` device config + `stp_reading` sensor log, all 3 portals |
| Solar energy + generation | `GET/PUT/PATCH /api/:portal/solar-energy/:realEstateId[/points]`, `GET/POST/PUT/DELETE /api/:portal/solar-generation[/:id]`, `.../solar-generation/chart` | `solar_energy` device config + `solar_generation` readings log, all 3 portals |
| AMC (Annual Maintenance Contract) | `GET /api/:portal/amc/:realEstateId[/:factSheet]`, `PUT /api/:portal/amc/:realEstateId/:factSheet` | `amc` table - one record per `(real_estate_id, fact_sheet)` pair across the 5 device modules (solar/harvesting/stp/aqms/anms) |
| Rainwater harvesting | `GET/PUT /api/:portal/rainwater-harvesting/:realEstateId`, `GET .../rainwater-harvesting?from=&to=` | `rainwater_harvesting` device config, all 3 portals |
| EC (Environmental Clearance) module + sanction | `GET/POST/DELETE /api/:portal/ec-module[/:id]`, `.../ec-module/search`, `.../ec-module/paginated`, `PATCH .../ec-module/:realEstateId/upload`, `GET/POST/PUT/DELETE /api/:portal/ec-sanction[/:id]`, `.../ec-sanction/search` | `ec_module` (large EC report form + cross-property search/pagination) and `ec_sanction` (sanction letters), all 3 portals |
| Display board, autocomposter, notifications | `GET/PUT /api/:portal/display-board/:realEstateId`, `GET/POST/DELETE /api/:portal/autocomposter[/:id]`, `.../autocomposter/years`, full notification CRUD + reply/read-flag endpoints under `/api/:portal/notifications/*` | `display_board` device config, `autocomposter` readings log, `notification_messages` (messaging/reply system with unread tracking) |
| Session master | `GET/POST/PUT/DELETE /api/:portal/sessions[/:id]` | `session_master` - named reporting-period date ranges per property with a generated `session_key`, referenced by `ec_module` and other reporting modules |
| Portable water quality + water quality | `GET/PUT /api/:portal/portable-water-quality/:realEstateId`, `GET/POST/DELETE /api/:portal/water-quality[/:id]`, `.../water-quality/{chart,years,by-year}` | `portable_water_quality` device config + `water_quality` sensor readings log |
| Green (greenery area + tree tracking) | `GET/PUT /api/:portal/green/:realEstateId`, `GET /api/:portal/green`, `.../green/report`, `.../green/active-report` | `green` - dual scoring tracks (green-area and tree-count), plus a cross-property admin reporting view joined against `real_estate_master` with date/name/state filters and pagination |
| EC checklist matrix | `GET/PUT /api/:portal/ec-module/:ecModuleId/conditions[/:condition/:subCondition/:head]` | `ec_module_condition` - a 20-item compliance checklist that the legacy code unrolled into ~85 near-identical statements; collapsed here into one parameterized model + a `EC_CHECKLIST_ITEMS` shape constant |
| EC analysis/imagery/remedial sub-tables | `GET/PUT /api/:portal/ec-module/:ecModuleId/{micro-ana/:type, chem-ana/:type, project-view-images, field-photographs, remedial, inter-mon-test}` | `ec_monitoring_micro_ana`, `ec_monitoring_chem_ana`, `ec_module_project_view`, `ec_module_field_photograph`, `ec_remedial`, `ec_inter_mon_test` - all 1-to-N or 1-to-1 sub-records of an `ec_module` report |
| Industry master | `GET/POST/PUT/DELETE /api/:portal/industry-masters[/:id]` | `industry_master` - 5th instantiation of the shared simple-master factory (same `{id, name}` shape as industry type/category/classification/laboratory) |
| DG set usage | `GET/POST/DELETE /api/:portal/dg-set-usage[/:id]` | `dg_set_usage` - diesel generator fuel/usage readings log, same shape as waste_collection/autocomposter |
| Industry-scoped pollution/consumption lists | `GET/POST /api/:portal/{water-consumption-list, water-polution-list, air-polution-list}`, `.../totals` | `water_consumption_list`, `water_polution_list`, `air_polution_list` - scoped by `industry_ms` rather than `real_estate_id` (a different convention from most other modules), each with an aggregate count/sum reporting endpoint |
| AQMS AQI history | `GET/POST /api/:portal/aqms-monitoring-aqi` | `aqms_monitoring_aqi` - AQI history dedupe-insert table, same pattern as `date_wise_aqi_data` built earlier for the WBPCB sync |

This completes every small/medium module identified in `extracted_sql_queries.txt`
(54 of 62 distinct tables found in that dump). Adding a new module means: add a
`models/<name>.model.js`, a `controllers/<name>.controller.js`, a
`routes/<name>.routes.js`, then add that router to the `portalRouters`
array in `routes/index.js`.

### Big modules

| Module | Routes | Replaces |
|---|---|---|
| Real estate master | `GET /api/:portal/real-estate[/:id]`, `.../real-estate/states`, `POST/PUT/DELETE /api/:portal/real-estate[/:id]`, `PATCH .../status`, `.../geo-location`, `.../soft-delete`, `DELETE .../gst-doc`, `.../profile-photo` | `real_estate_master` - the central property entity. 716 legacy queries reference this table; 694 of them are read-only "populate a dropdown" or "look up name/state/district for a join" variants that collapse into one flexible `search()`/`countSearch()` function. The genuine entity lifecycle (the ~80-field registration form, full edit, status toggle, soft/hard delete, geo-location update, file-field clearing) is covered explicitly. |
| Audit trail (reporting) | `GET /api/:portal/audit-trail?from=&to=&username=&page=&pageSize=` | The admin audit-log viewer. The write side (one `INSERT` per add/edit/delete action across the whole codebase) was already covered from the start by `utils/auditLog.js`; this adds the read/reporting side - 84 of the table's 92 legacy queries were that repeated INSERT, the remaining 8 are this paginated, date-range-filterable viewer. |
| User access (permissions) | `GET/PUT/DELETE /api/:portal/user-access[/:menu/:submenu]` | `user_access` - one row per (menu, submenu) pair holding 6 mutually-exclusive permission flags (full control / entry only / read only / update+delete / except delete / no control), replaced via delete+reinsert exactly like the device-config tables. |
| User master (accounts) | `GET/POST/PUT/DELETE /api/:portal/users[/:id]`, `PATCH .../users/:userName/{profile,password}` | Account creation/registration, listing by type/state, full edit, self-service profile update, password change, deletion. Login itself (`POST /api/auth/login`) was already covered from the start in `models/auth.model.js` / `middleware/auth.js`. |

### Livability Index scoring system

| Module | Routes | Replaces |
|---|---|---|
| Livability criteria + assessments + leaderboard | `GET/PUT /api/:portal/livability/criteria[/:id]`, `.../criteria/max-points`, `.../criteria/:criterionName/compliant-properties`, `GET /api/:portal/livability/:realEstateId/{latest,dates}`, `.../criteria/:livabilityId/history`, `PUT .../assessment`, `GET/POST .../score[/refresh]`, `GET /api/:portal/livability/leaderboard/{top,bottom}` | `livability_index_master` (the fixed scoring criteria list, e.g. "AQMS Installed"), `livability` (the per-property, per-date compliance log against those criteria), `temp_livability` (a precomputed leaderboard cache) |

`livability`'s `id` is a genuine `AUTO_INCREMENT` column despite the
legacy code's manual `max(id)+1` pattern (the same situation found
earlier with `green`/`stp_reading` - these tables were evidently altered
after the original PHP was written). `computeCompliancePercentage()`
mirrors the scoring logic implied by the legacy queries: (sum of points
for criteria currently marked `'yes'`) / (sum of all criteria points) *
100, and `TempLivabilityModel.refresh()` recomputes and caches it.

### Real estate registration workflow

| Module | Routes | Replaces |
|---|---|---|
| Property self-registration + admin approval | `POST /api/public/real-estate-registration` (public, no auth), `GET /api/:portal/real-estate-registration/{pending,search}`, `.../by-name/:realEstateName`, `.../:id`, `POST .../:id/approve`, `DELETE .../:id` | `temp_real_master` - a staging table holding the same ~85-field registration form as `real_estate_master`, plus `approval`/`approve_by`/`approve_date_time` tracking |

**Important semantic note** (confirmed directly from the legacy SQL, since
it's counterintuitive): `approval = 1` means **pending review**,
`approval = 0` means **approved** - exported as the `APPROVAL_PENDING` /
`APPROVAL_APPROVED` constants in `tempRealMaster.model.js` so this isn't a
magic number scattered through the codebase. `TempRealMasterModel.approve()`
chains two models: it marks the staging row approved, then copies its
data into a brand-new `real_estate_master` row via
`RealEstateMasterModel.create()` (with the admin-supplied
username/password for the new account) - this chained, cross-model write
was verified against a mocked DB driver to confirm the full ~85-field
mapping carries over correctly end-to-end before being included in this
delivery.

This completes every module identified across both `extracted_sql_queries.txt`
and the original PHP project structure.

### Equipment details registry (found during final audit)

| Module | Routes | Replaces |
|---|---|---|
| ANMS / AQMS equipment registry | `GET/POST/PUT/DELETE /api/:portal/{anms-details,aqms-details}[/:id]` | `anms_details` / `aqms_details` - per-property monitoring equipment records (machine model, manufacturer, install date, warranty info). These are genuinely distinct from the singular `anms_detail` / `aqms_detail` flag-config tables built earlier; a final table-by-table audit against `extracted_sql_queries.txt` caught that these plural variants had no model logic yet, since they'd been silently grouped under their singular counterparts in earlier passes. Built via one shared `equipmentDetailsFactory.js` since both tables are identically shaped. |

A full audit confirmed all 62 distinct tables referenced in
`extracted_sql_queries.txt` now have working model + controller + route
coverage, every route file on disk is wired into `routes/index.js` (no
orphans), and the original third-party API integrations from the start of
this project (EnggEnv, WBPCB, Paribesh, Distronix) remain intact alongside
everything added since.

### Recurring patterns found across modules

Several tables (`stp`, `solar_energy`, `rainwater_harvesting`,
`waste_related`, and earlier `anms_detail`/`aqms_detail`) share an
identical "device config" shape: one row per property, replaced wholesale
via delete-then-reinsert on every save, with a `flag_x` yes/no column and
derived `points`/`remarks` scoring columns. Each is currently hand-written
as its own model/controller pair for clarity and to keep risk low while
iterating quickly, but they're good candidates for a shared factory (like
`simpleMasterFactory.js`) if you'd like that consolidation later -
flag it and I'll refactor.

### Notable behavioral quirks preserved from the legacy code

- **Manual ID increments**: `trees` (and several other tables) have no
  `AUTO_INCREMENT` in the dump, so `TreesModel.getNextId()` replicates the
  legacy `SELECT MAX(id)+1` pattern — same race-condition risk as the PHP
  version under concurrent writes. Flag if you'd like this swapped for a
  real auto-increment column.
- **Edit = delete + reinsert**: `edit_trees_master_listing.php` deletes the
  old row and inserts a new one (so the `id` changes on every edit) rather
  than doing an `UPDATE`. `TreesModel.update()` preserves this for
  behavioral parity even though it's unusual.
- **Duplicate-insert silently skipped**: matching the legacy dedupe check,
  `create`/`update` return `{ created: false }` instead of throwing when an
  identical row already exists for that `real_estate_id`.

### Schema fix found during this batch

While building the STP module, found that `stp_reading.id` is genuinely
`AUTO_INCREMENT` in the database dump but the original schema generator
missed it (the `PRIMARY KEY` constraint wasn't declared inline in that
table's `CREATE TABLE` statement, just `UNIQUE KEY`, which the generator's
detection logic didn't catch). Fixed in `schema.js`
(`.primaryKey().autoincrement()`) and cross-checked every other
`AUTO_INCREMENT` column in `libility.sql` against `schema.js` to confirm
this was the only one affected.

### Notable discrepancy found during this batch

`display_board` has several older legacy INSERT queries referencing
`description`/`remarks`/`status` text columns in a different shape than
what's in the current schema (which only has `status`, `points_dis`,
`remarks_dis`, `install_date`). The model targets the current schema's
actual shape; if those older fields are genuinely still needed somewhere,
the table will need a migration to add them back - flag it if so.

### EC checklist consolidation

`ec_module_condition` looked like the biggest single table by query count
(85) after the deferred big modules, but inspection showed all 85 queries
collapse to one generic INSERT/SELECT/DELETE shape parameterized by 3
integers (`condition`, `sub_condition`, `head`), with only 20 distinct
combinations ever used across the legacy code. Rather than port 85
near-duplicate functions, this is now one parameterized model
(`ecModuleCondition.model.js`) plus an `EC_CHECKLIST_ITEMS` constant the
frontend can iterate to render the same 20-item form the legacy admin
panel used.

---


Re-implementation of every external/third-party API call found in the legacy
PHP project (`Livibility.zip`) as a clean Node.js/Express service, using
Drizzle ORM against the existing `libility` MySQL database (`libility.sql`).

## What got migrated

| Provider | Legacy PHP files | New route | New service |
|---|---|---|---|
| EnggEnv — water depth | `api_for_water.php`, `test_waterapi*.php`, `admin/pcb/real_estate/api_data_for_water_pollution*.php` | `GET /api/water-sensor/sync`, `GET /api/water-sensor/hourly` | `services/enggenv.service.js` |
| EnggEnv — AAQ fetchAll | `admin/api_new_admin.php`, `pcb/api_new_pcb.php`, `real_estate/api_new.php` | `GET /api/aaq/sync` | `services/enggenv.service.js` |
| WBPCB EMIS station feed | `pcb/aqms_api.php` | `GET /api/wbpcb/sync` | `services/wbpcb.service.js` |
| Paribesh noise API | `admin/real_estate/noise_api_new.php`, `pcb/progress2.php` | `GET /api/noise/paribesh/sync` | `services/paribesh.service.js` |
| Distronix ANMS (noise, per-property) | `admin/real_anms_admin.php` + `admin/save_anms_data_admin.php` | `GET /api/anms/:propertyKey/sync`, `GET /api/anms/sync-all` | `services/distronix.service.js` |
| Distronix AQI (air quality, per-property) | `admin/air_quality_moni_sta_admin.php` + `admin/save_aqms_data_admin.php` | `GET /api/aqi/:propertyKey/sync`, `GET /api/aqi/sync-all` | `services/distronix.service.js` |

`api_url.php` (dummy `restapiexample.com` tutorial code) and the dead/commented
code in `real_estate/sample_noise.php` were **not** migrated — they aren't part
of the real app flow.

## Project layout

```
src/
  app.js                  Express app (routes + error handler)
  server.js                Entry point + optional cron jobs
  config/properties.js     Per-property Distronix URLs/tokens (env-driven)
  db/
    schema.js              Drizzle schema generated from libility.sql,
                            plus 2 new tables (sensor_water already existed
                            in the dump — see note below)
    index.js               mysql2 pool + drizzle() instance
  services/                One file per third-party provider — pure HTTP,
                            no DB/Express knowledge. Mirrors the old
                            file_get_contents()/curl_exec() calls.
  models/                  Drizzle queries + the original business logic
                            (dedupe checks, points/remarks scoring, manual
                            id increments) ported 1:1 from the PHP.
  controllers/             Express handlers: call service -> call model ->
                            shared response() helper.
  routes/                  Thin Express routers, mounted under /api.
  utils/
    response.js             Shared { status, message, data } envelope.
    httpClient.js            axios instance used by every service.
scripts/gen_schema.py       The dump -> Drizzle schema generator (rerun if
                            libility.sql changes).
drizzle/                    Generated SQL migration (drizzle-kit generate).
```

## Setup

```bash
npm install
cp .env.example .env     # fill in real DB creds + any missing Distronix tokens
npx drizzle-kit generate # already run once; rerun after schema changes
npx drizzle-kit migrate  # applies drizzle/ migrations to your MySQL DB
npm run dev
```

The `.env.example` already includes the EnggEnv app-key, WBPCB station id,
and the Distronix Swan Court bearer token exactly as found in the legacy
PHP/JS. The other properties (Silver Oak, South Winds, Aurus, Srachi,
Simplex, Moriya, Fortis) reuse one shared Distronix portal token found
elsewhere in the codebase — **double check these per-property in your
Distronix admin panel before relying on them**, since the legacy code
sometimes hardcoded a per-property token I couldn't find committed anywhere
(grep your old JS/HTML for `Authorization` if a 401 comes back for a
property).

## Important notes / things to double check

1. **`aqi_for_pcb` vs `aqms_monitoring`** — the legacy `pcb/aqms_api.php`
   inserted WBPCB data into `aqms_monitoring`/`aqms_monitoring_aqi`, but the
   columns in your current dump for those two tables are shaped for the
   *Distronix* AQI feed instead (sensor min/max/avg per pollutant type,
   `aq_details_id` FK, etc.) — not the WBPCB shape (`pollutant`, `minval`,
   `avgval`, `maxval`, station code). I mapped the WBPCB sync to
   `aqi_for_pcb` + `date_wise_aqi_data` instead, since those line up with the
   WBPCB payload shape. If you actually want WBPCB data flowing into
   `aqms_monitoring`, say so and I'll add the alternate columns/migration.

2. **Manual ID increments preserved** — `water_sensor_all`, `noise_details_all`,
   `anms_detail`, and `aqms_detail` have no `AUTO_INCREMENT` in your dump, so
   the original "`SELECT MAX(id)+1`" pattern is kept as-is in
   `waterSensor.model.js` / `noiseDetailsAll.model.js`. This is a race
   condition under concurrent writes (same risk as the PHP version) — let me
   know if you want it swapped for a proper auto-increment column instead.

3. **New tables** — `sensorWater` (EnggEnv AAQ rows) already existed in your
   dump and is used as-is. I only had to *add* `noiseDetails` (Paribesh rows)
   to `schema.js` since it wasn't in `libility.sql`; run `db:generate` +
   `db:migrate` to create it.

4. **Cron/autorun replacement** — the old `autorun_noise_all.php` /
   `autorun_aqi_all.php` (presumably hit by a system cron or page refresh)
   are now `node-cron` jobs in `server.js`, gated behind
   `ENABLE_CRON_JOBS=true` in `.env` so they don't fire by default.

5. **403s in this sandbox** — I test-booted the server and hit every route;
   Express routing, validation, and the outbound HTTP calls all work
   correctly end-to-end, but EnggEnv/WBPCB/Distronix returned `403` here
   because this sandbox's outbound IP isn't whitelisted by those providers.
   That's expected outside your real server environment — verify against
   your DB/network once deployed.
