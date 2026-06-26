import {
  bigint,
  date,
  datetime,
  double,
  float,
  int,
  mysqlTable,
  text,
  time,
  timestamp,
  tinyint,
  varchar
} from "drizzle-orm/mysql-core";

// ---------------------------------------------------------------------------
// AUTO-GENERATED from libility.sql - do not hand edit table-by-table.
// Re-run `node scripts/gen-schema` (or the python generator) if the dump changes.
// ---------------------------------------------------------------------------

export const airPolutionList = mysqlTable("air_polution_list", {
  id: int("id").notNull(),
  airEmmition: int("air_emmition").notNull(),
  airPollutionParameters: int("air_pollution_parameters").notNull(),
  reading: int("reading").notNull(),
  sampleDate: varchar("sample_date", { length: 10 }).notNull(),
  reportDate: varchar("report_date", { length: 10 }).notNull(),
  laboratory: varchar("laboratory", { length: 30 }).notNull(),
  airDate: date("air_date").notNull(),
  industryMs: int("industry_ms").notNull(),
});

export const amc = mysqlTable("amc", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 30 }).notNull(),
  address: text("address").notNull(),
  phone: bigint("phone", { mode: "number" }).notNull(),
  emailid: text("emailid").notNull(),
  gst: varchar("gst", { length: 30 }).notNull(),
  factSheet: varchar("fact_sheet", { length: 20 }).notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const anmsDetail = mysqlTable("anms_detail", {
  id: int("id").primaryKey(),
  realEstateId: int("real_estate_id").notNull(),
  parameters: text("parameters").notNull(),
  warranty: date("warranty").notNull(),
  mfgName: varchar("mfg_name", { length: 30 }).notNull(),
  address: text("address").notNull(),
  gst: varchar("gst", { length: 30 }).notNull(),
  contactPerson: varchar("contact_person", { length: 30 }).notNull(),
  mobile: varchar("mobile", { length: 15 }).notNull(),
  email: text("email").notNull(),
  flagAnms: text("flag_anms").notNull(),
  pointsAn: int("points_an").notNull(),
  remarksAn: varchar("remarks_an", { length: 20 }).notNull(),
  installDate: date("install_date").notNull(),
});

export const anmsDetails = mysqlTable("anms_details", {
  id: int("id").notNull(),
  machine: text("machine").notNull(),
  nameOfManufacturer: varchar("name_of_manufacturer", { length: 50 }).notNull(),
  dateManufacture: date("date_manufacture").notNull(),
  dateInstall: date("date_install").notNull(),
  parameters: text("parameters").notNull(),
  dateWaranty: date("date_waranty").notNull(),
  warantyPerson: varchar("waranty_person", { length: 50 }).notNull(),
  addressOfWarantyPerson: text("address_of_waranty_person").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const aqiForPcb = mysqlTable("aqi_for_pcb", {
  id: int("id").primaryKey().autoincrement(),
  pollutants: varchar("pollutants", { length: 100 }).notNull(),
  concentration: float("concentration").notNull(),
  subIndex: float("sub_index").notNull(),
  checkVal: int("check_val").notNull(),
  realEstateId: int("real_estate_id").notNull(),
  upddate: timestamp("upddate").notNull().defaultNow().onUpdateNow(),
});

export const aqmsDetail = mysqlTable("aqms_detail", {
  id: int("id").primaryKey(),
  realEstateId: int("real_estate_id").notNull(),
  parameters: text("parameters").notNull(),
  warranty: date("warranty").notNull(),
  mfgName: varchar("mfg_name", { length: 30 }).notNull(),
  address: text("address").notNull(),
  gst: varchar("gst", { length: 20 }).notNull(),
  contactPerson: varchar("contact_person", { length: 30 }).notNull(),
  mobile: varchar("mobile", { length: 15 }).notNull(),
  email: text("email").notNull(),
  flagAqms: text("flag_aqms").notNull(),
  pointsAq: int("points_aq").notNull(),
  remarksAq: int("remarks_aq").notNull(),
  installDate: date("install_date").notNull(),
});

export const aqmsDetails = mysqlTable("aqms_details", {
  id: int("id").notNull(),
  machine: text("machine").notNull(),
  nameOfManufacturer: varchar("name_of_manufacturer", { length: 50 }).notNull(),
  dateManufacture: date("date_manufacture").notNull(),
  dateInstall: date("date_install").notNull(),
  parameters: text("parameters").notNull(),
  dateWaranty: date("date_waranty").notNull(),
  warantyPerson: varchar("waranty_person", { length: 50 }).notNull(),
  addressOfWarantyPerson: text("address_of_waranty_person").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const aqmsMonitoring = mysqlTable("aqms_monitoring", {
  id: int("id").primaryKey().autoincrement(),
  mainId: int("main_id").notNull(),
  extHumiAvg: double("ext_humi_avg").notNull(),
  extHumiMax: double("ext_humi_max").notNull(),
  extHumiMin: double("ext_humi_min").notNull(),
  extTempAvg: double("ext_temp_avg").notNull(),
  extTempMax: double("ext_temp_max").notNull(),
  extTempMin: double("ext_temp_min").notNull(),
  intHumiAvg: double("int_humi_avg").notNull(),
  intHumiMax: double("int_humi_max").notNull(),
  intHumiMin: double("int_humi_min").notNull(),
  intTempAvg: double("int_temp_avg").notNull(),
  intTempMax: double("int_temp_max").notNull(),
  intTempMin: double("int_temp_min").notNull(),
  lastOnline: text("last_online").notNull(),
  no2Avg: double("no2_avg").notNull(),
  no2Max: double("no2_max").notNull(),
  no2Min: double("no2_min").notNull(),
  pm1Avg: double("pm1_avg").notNull(),
  pm1Max: double("pm1_max").notNull(),
  pm1Min: double("pm1_min").notNull(),
  pm10Avg: double("pm10_avg").notNull(),
  pm10Max: double("pm10_max").notNull(),
  pm10Min: double("pm10_min").notNull(),
  pm25Avg: double("pm25_avg").notNull(),
  pm25Max: double("pm25_max").notNull(),
  pm25Min: double("pm25_min").notNull(),
  pmHumiAvg: double("pm_humi_avg").notNull(),
  pmHumiMax: double("pm_humi_max").notNull(),
  pmHumiMin: double("pm_humi_min").notNull(),
  pmTempAvg: double("pm_temp_avg").notNull(),
  pmTempMax: double("pm_temp_max").notNull(),
  pmTempMin: double("pm_temp_min").notNull(),
  so2Avg: double("so2_avg").notNull(),
  so2Max: double("so2_max").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const aqmsMonitoringAqi = mysqlTable("aqms_monitoring_aqi", {
  id: int("id").notNull(),
  mainId: int("main_id").notNull(),
  aqi: int("aqi").notNull().unique(),
  aqiDate: date("aqi_date").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const aqmsMonitoringMain = mysqlTable("aqms_monitoring_main", {
  id: int("id").primaryKey().autoincrement(),
  aqDetailsId: int("aq_details_id").notNull(),
  promptPol: varchar("prompt_pol", { length: 20 }).notNull(),
  location: varchar("location", { length: 30 }).notNull(),
  district: varchar("district", { length: 50 }).notNull(),
  dateAqms: date("date_aqms").notNull(),
  hour: int("hour").notNull(),
  aqi: double("aqi").notNull(),
  pointsAqms: int("points_aqms").notNull(),
  remarksAqms: varchar("remarks_aqms", { length: 30 }).notNull(),
  realEstateId: int("real_estate_id").notNull(),
  timeAir: time("time_air").notNull(),
});

export const auditTrial = mysqlTable("audit_trial", {
  id: int("id").primaryKey().autoincrement(),
  date1: datetime("date1").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  userId: varchar("user_id", { length: 50 }).notNull(),
  lnk: varchar("lnk", { length: 100 }).notNull(),
  ip: varchar("ip", { length: 50 }).notNull(),
  panel: varchar("panel", { length: 20 }).notNull(),
  module: varchar("module", { length: 250 }).notNull(),
  realEstateName: varchar("real_estate_name", { length: 30 }).notNull(),
  browser: varchar("browser", { length: 250 }).notNull(),
  device: varchar("device", { length: 250 }).notNull(),
});

export const autocomposter = mysqlTable("autocomposter", {
  id: int("id").notNull(),
  dt: date("dt").notNull(),
  totCompostProduction: float("tot_compost_production").notNull(),
  totHours: int("tot_hours").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const city = mysqlTable("city", {
  id: int("id").primaryKey().autoincrement(),
  cityName: varchar("city_name", { length: 255 }).notNull(),
  districtid: int("districtid").notNull(),
  stateId: varchar("state_id", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 10 }).notNull(),
});

export const clasificationMaster = mysqlTable("clasification_master", {
  id: int("id").notNull(),
  clasificationName: varchar("clasification_name", { length: 50 }).notNull(),
});

export const comparisonChart = mysqlTable("comparison_chart", {
  id: int("id").primaryKey().autoincrement(),
  projectName: text("project_name").notNull(),
  aqms: varchar("aqms", { length: 5 }).notNull(),
  anms: varchar("anms", { length: 5 }).notNull(),
  solarEnergy: varchar("solar_energy", { length: 5 }).notNull(),
  stp: varchar("stp", { length: 5 }).notNull(),
  rainwaterHarvesting: varchar("rainwater_harvesting", { length: 5 }).notNull(),
  drinkingWater: varchar("drinking_water", { length: 5 }).notNull(),
  wasteRelated: varchar("waste_related", { length: 5 }).notNull(),
  displayBoard: varchar("display_board", { length: 5 }).notNull(),
  greenArea: varchar("green_area", { length: 5 }).notNull(),
});

export const contactUs = mysqlTable("contact_us", {
  id: int("id").primaryKey().autoincrement(),
  fname: varchar("fname", { length: 255 }).notNull(),
  lname: varchar("lname", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  district: varchar("district", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  pinNo: varchar("pin_no", { length: 255 }).notNull(),
  profile: varchar("profile", { length: 255 }).notNull(),
  docPath: text("doc_path").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const dateWiseAqiData = mysqlTable("date_wise_aqi_data", {
  id: int("id").primaryKey().autoincrement(),
  realEstateId: int("real_estate_id").notNull(),
  upddate: timestamp("upddate").notNull().defaultNow().onUpdateNow(),
  aqi: bigint("aqi", { mode: "number" }).notNull(),
  pollutants: varchar("pollutants", { length: 255 }).notNull(),
});

export const dgSetUsage = mysqlTable("dg_set_usage", {
  id: int("id").primaryKey().autoincrement(),
  hoursUsed: int("hours_used").notNull(),
  electricity: int("electricity").notNull(),
  oilConsumption: double("oil_consumption").notNull(),
  wasteGenerated: int("waste_generated").notNull(),
  realEstateId: int("real_estate_id").notNull(),
  dateOfDg: date("date_of_dg").notNull(),
});

export const displayBoard = mysqlTable("display_board", {
  id: int("id").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  pointsDis: int("points_dis").notNull(),
  remarksDis: varchar("remarks_dis", { length: 20 }).notNull(),
  realEstateId: int("real_estate_id").notNull(),
  installDate: date("install_date").notNull(),
});

export const district = mysqlTable("district", {
  id: int("id").primaryKey().autoincrement(),
  districtName: varchar("district_name", { length: 100 }).notNull(),
  stateId: int("state_id").notNull(),
  districtDescription: text("district_description").notNull(),
  districtStatus: varchar("district_status", { length: 10 }).notNull(),
});

export const ecInterMonTest = mysqlTable("ec_inter_mon_test", {
  id: int("id").primaryKey().autoincrement(),
  realEstateId: int("real_estate_id").notNull(),
  ecModuleId: int("ec_module_id").notNull(),
  result: varchar("result", { length: 255 }).notNull(),
  airQua: varchar("air_qua", { length: 255 }).notNull(),
  noiseQua: varchar("noise_qua", { length: 255 }).notNull(),
  waterQua: varchar("water_qua", { length: 255 }).notNull(),
  sessionKey: varchar("session_key", { length: 255 }).notNull(),
});

export const ecModule = mysqlTable("ec_module", {
  id: int("id").notNull(),
  realEstateId: int("real_estate_id").notNull(),
  session: varchar("session", { length: 255 }).notNull(),
  monthOfSubmittion: varchar("month_of_submittion", { length: 255 }).notNull().default("-"),
  videLetterNo: text("vide_letter_no").notNull(),
  projectProponent: varchar("project_proponent", { length: 255 }).notNull(),
  projectLocation: text("project_location").notNull(),
  purposeReport: text("purpose_report").notNull(),
  methodReport: text("method_report").notNull(),
  abbreviations: text("abbreviations").notNull(),
  projectDetail: text("project_detail").notNull(),
  consStatus: text("cons_status").notNull(),
  healthOccupation: text("health_occupation").notNull(),
  locGmap: varchar("loc_gmap", { length: 255 }).notNull(),
  locGsat: varchar("loc_gsat", { length: 255 }).notNull(),
  ecClear: text("ec_clear").notNull(),
  waterQua: text("water_qua").notNull(),
  contactPp: text("contact_pp").notNull(),
  addPp: text("add_pp").notNull(),
  emailP: varchar("email_p", { length: 255 }).notNull(),
  telFaxP: varchar("tel_fax_p", { length: 255 }).notNull(),
  envp: text("envp").notNull(),
  uploadEc: text("upload_ec").notNull(),
  sessionKey: varchar("session_key", { length: 255 }).notNull(),
});

export const ecModuleCondition = mysqlTable("ec_module_condition", {
  id: int("id").primaryKey().autoincrement(),
  realEstateId: int("real_estate_id").notNull(),
  ecModuleId: int("ec_module_id").notNull(),
  condition: int("condition").notNull(),
  subCondition: int("sub_condition").notNull(),
  head: int("head").notNull(),
  subHead1: text("sub_head1").notNull(),
  subHead2: text("sub_head2").notNull(),
  sessionKey: varchar("session_key", { length: 255 }).notNull(),
});

export const ecModuleFieldPhotograph = mysqlTable("ec_module_field_photograph", {
  id: int("id").primaryKey().autoincrement(),
  realEstateId: int("real_estate_id").notNull(),
  ecModuleId: int("ec_module_id").notNull(),
  fieldImage: varchar("field_image", { length: 255 }).notNull(),
  fieldImageTitle: varchar("field_image_title", { length: 255 }).notNull(),
  sessionKey: varchar("session_key", { length: 255 }).notNull(),
});

export const ecModuleProjectView = mysqlTable("ec_module_project_view", {
  id: int("id").primaryKey().autoincrement(),
  realEstateId: int("real_estate_id").notNull(),
  ecModuleId: int("ec_module_id").notNull(),
  image: varchar("image", { length: 255 }).notNull(),
  imageTitle: varchar("image_title", { length: 255 }).notNull(),
  sessionKey: varchar("session_key", { length: 255 }).notNull(),
});

export const ecMonitoringChemAna = mysqlTable("ec_monitoring_chem_ana", {
  id: int("id").primaryKey().autoincrement(),
  realEstateId: int("real_estate_id").notNull(),
  ecModuleId: int("ec_module_id").notNull(),
  sampleCollection: varchar("sample_collection", { length: 255 }).notNull(),
  sampleDrawn: date("sample_drawn").notNull(),
  chemicalAnalysis: int("chemical_analysis").notNull(),
  testParameter: varchar("test_parameter", { length: 255 }).notNull(),
  desirableLimit: varchar("desirable_limit", { length: 255 }).notNull(),
  permissibleLimit: varchar("permissible_limit", { length: 255 }).notNull(),
  result: varchar("result", { length: 255 }).notNull(),
  sessionKey: varchar("session_key", { length: 255 }).notNull(),
});

export const ecMonitoringMicroAna = mysqlTable("ec_monitoring_micro_ana", {
  id: int("id").primaryKey().autoincrement(),
  realEstateId: int("real_estate_id").notNull(),
  ecModuleId: int("ec_module_id").notNull(),
  sampleCollection: varchar("sample_collection", { length: 50 }).notNull(),
  sampleDrawn: date("sample_drawn").notNull(),
  microbialAnalysis: int("microbial_analysis").notNull(),
  testParameter: varchar("test_parameter", { length: 255 }).notNull(),
  limitAsPer: varchar("limit_as_per", { length: 255 }).notNull(),
  result: varchar("result", { length: 255 }).notNull(),
  sessionKey: varchar("session_key", { length: 255 }).notNull(),
});

export const ecRemedial = mysqlTable("ec_remedial", {
  id: int("id").primaryKey().autoincrement(),
  realEstateId: int("real_estate_id").notNull(),
  ecModuleId: int("ec_module_id").notNull(),
  result: varchar("result", { length: 255 }).notNull(),
  airQua: varchar("air_qua", { length: 255 }).notNull(),
  noiseQua: varchar("noise_qua", { length: 255 }).notNull(),
  waterQua: varchar("water_qua", { length: 255 }).notNull(),
  sessionKey: varchar("session_key", { length: 255 }).notNull(),
});

export const ecSanction = mysqlTable("ec_sanction", {
  id: int("id").primaryKey().autoincrement(),
  realEstateId: int("real_estate_id").notNull(),
  date1: date("date1").notNull(),
  sancLett: varchar("sanc_lett", { length: 255 }).notNull(),
  vidLetterNo: varchar("vid_letter_no", { length: 255 }).notNull(),
  projectLocation: varchar("project_location", { length: 255 }).notNull(),
});

export const feedBackReal = mysqlTable("feed_back_real", {
  id: int("id").primaryKey().autoincrement(),
  feed: varchar("feed", { length: 11 }).notNull(),
  rating1: varchar("rating1", { length: 11 }).notNull(),
  rating2: varchar("rating2", { length: 11 }).notNull(),
  rating3: varchar("rating3", { length: 11 }).notNull(),
  rating4: varchar("rating4", { length: 11 }).notNull(),
  rating5: varchar("rating5", { length: 11 }).notNull(),
  rating6: varchar("rating6", { length: 11 }).notNull(),
  list: varchar("list", { length: 11 }).notNull(),
  comm: varchar("comm", { length: 11 }).notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const green = mysqlTable("green", {
  id: int("id").primaryKey().autoincrement(),
  totArea: text("tot_area").notNull(),
  mandatedArea: text("mandated_area").notNull(),
  actualArea: text("actual_area").notNull(),
  trees: varchar("trees", { length: 11 }).notNull(),
  type: varchar("type", { length: 11 }).notNull(),
  dt: date("dt").notNull(),
  pointsGreen: int("points_green").notNull(),
  pointsTree: int("points_tree").notNull(),
  remarksGreen: varchar("remarks_green", { length: 30 }).notNull(),
  remarksTree: varchar("remarks_tree", { length: 30 }).notNull(),
  flagGreen: text("flag_green").notNull(),
  flagTree: text("flag_tree").notNull(),
  realEstateId: int("real_estate_id").notNull(),
  actualTrees: varchar("actual_trees", { length: 5 }).notNull(),
  installDate: date("install_date").notNull(),
});

export const industryCategory = mysqlTable("industry_category", {
  id: int("id").notNull(),
  category: varchar("category", { length: 30 }).notNull(),
});

export const industryMaster = mysqlTable("industry_master", {
  id: int("id").notNull(),
  nameOfIndustry: varchar("name_of_industry", { length: 100 }).notNull(),
});

export const industryTypeMaster = mysqlTable("industry_type_master", {
  id: int("id").notNull(),
  typeOfIndustry: varchar("type_of_industry", { length: 100 }).notNull(),
});

export const laboratoryMaster = mysqlTable("laboratory_master", {
  id: int("id").notNull(),
  labName: varchar("lab_name", { length: 50 }).notNull(),
});

export const livability = mysqlTable("livability", {
  id: int("id").primaryKey().autoincrement(),
  date1: date("date1").notNull(),
  realEstateId: int("real_estate_id").notNull(),
  livabilityId: int("livability_id").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  remarks: varchar("remarks", { length: 50 }).notNull(),
});

export const livabilityIndexMaster = mysqlTable("livability_index_master", {
  id: int("id").notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  points: int("points").notNull(),
  dateOfLiv: date("date_of_liv").notNull(),
  remarks: varchar("remarks", { length: 30 }).notNull(),
});

export const noiseDetailsAll = mysqlTable("noise_details_all", {
  id: int("id").primaryKey(),
  anDetailsId: int("an_details_id").notNull(),
  location: text("location").notNull(),
  timeS: datetime("time_s").notNull(),
  las: double("las").notNull(),
  lcs: double("lcs").notNull(),
  lzs: double("lzs").notNull(),
  laeqt: double("laeqt").notNull(),
  lapeakt: double("lapeakt").notNull(),
  lceqt: double("lceqt").notNull(),
  lcpeakt: double("lcpeakt").notNull(),
  lzeqt: double("lzeqt").notNull(),
  lzpeakt: double("lzpeakt").notNull(),
  pointsAnms: int("points_anms").notNull(),
  remarksAnms: varchar("remarks_anms", { length: 30 }).notNull(),
  temperatureDegreeCelsius: double("temperature_degree_celsius").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const notificationMessages = mysqlTable("notification_messages", {
  id: int("id").notNull(),
  description: text("description").notNull(),
  subject: varchar("subject", { length: 30 }).notNull(),
  flag: tinyint("flag").notNull(),
  dateN: date("date_n").notNull(),
  timeN: time("time_n").notNull(),
  realEstateId: int("real_estate_id").notNull(),
  extraa: int("extraa").notNull(),
  userType: varchar("user_type", { length: 250 }).notNull(),
});

export const paginationTable = mysqlTable("pagination_table", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 250 }).notNull(),
  age: int("age").notNull(),
  dept: varchar("dept", { length: 250 }).notNull(),
});

export const portableWaterQuality = mysqlTable("portable_water_quality", {
  id: int("id").notNull(),
  portable: text("portable").notNull(),
  fromOutside: varchar("from_outside", { length: 40 }).notNull(),
  received: text("received").notNull(),
  waterQuality: int("water_quality").notNull(),
  dt: date("dt").notNull(),
  flagDrinking: text("flag_drinking").notNull(),
  waterSensor: text("water_sensor").notNull(),
  pointsOfSensor: int("points_of_sensor").notNull(),
  realEstateId: int("real_estate_id").notNull(),
  installDate: date("install_date").notNull(),
});

export const rainwaterHarvesting = mysqlTable("rainwater_harvesting", {
  id: int("id").notNull(),
  capacityHarvesting: text("capacity_harvesting").notNull(),
  warrantyHarvesting: date("warranty_harvesting").notNull(),
  mfgHarvesting: text("mfg_harvesting").notNull(),
  addressHarvesting: text("address_harvesting").notNull(),
  gstHarvesting: varchar("gst_harvesting", { length: 20 }).notNull(),
  contactHarvesting: text("contact_harvesting").notNull(),
  mobileHarvesting: varchar("mobile_harvesting", { length: 20 }).notNull(),
  emailHarvesting: text("email_harvesting").notNull(),
  points: int("points").notNull(),
  remarks: varchar("remarks", { length: 30 }).notNull(),
  flag: text("flag").notNull(),
  realEstateId: int("real_estate_id").notNull(),
  installDate: date("install_date").notNull(),
});

export const realEstateMaster = mysqlTable("real_estate_master", {
  id: int("id").notNull(),
  date1: date("date1").notNull(),
  realEstateName: varchar("real_estate_name", { length: 200 }).notNull(),
  profilePhoto: varchar("profile_photo", { length: 255 }).notNull(),
  industryType: int("industry_type").notNull(),
  industryClassification: int("industry_classification").notNull(),
  categoriesIndustry: int("categories_industry").notNull(),
  registrationNo: varchar("registration_no", { length: 100 }).notNull(),
  scale: varchar("scale", { length: 100 }).notNull(),
  dateOffComm: date("date_off_comm").notNull(),
  powerSupply: varchar("power_supply", { length: 100 }).notNull(),
  noOfStaff: int("no_of_staff").notNull(),
  tradeLicense: varchar("trade_license", { length: 100 }).notNull(),
  tradeLicenseIssBy: varchar("trade_license_iss_by", { length: 100 }).notNull(),
  issDate: date("iss_date").notNull(),
  validUpto: date("valid_upto").notNull(),
  gstinDetail: varchar("gstin_detail", { length: 100 }).notNull(),
  gstDoc: text("gst_doc").notNull(),
  addrFactory: text("addr_factory").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  comEmailId: varchar("com_email_id", { length: 100 }).notNull(),
  landNo: varchar("land_no", { length: 255 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  district: varchar("district", { length: 50 }).notNull(),
  city: varchar("city", { length: 50 }).notNull(),
  pinCode: int("pin_code").notNull(),
  postOffice: varchar("post_office", { length: 100 }).notNull(),
  policeStation: varchar("police_station", { length: 100 }).notNull(),
  localBody: varchar("local_body", { length: 100 }).notNull(),
  wordNo: varchar("word_no", { length: 100 }).notNull(),
  jlNo: varchar("jl_no", { length: 100 }).notNull(),
  plotNo: varchar("plot_no", { length: 100 }).notNull(),
  dagNo: varchar("dag_no", { length: 100 }).notNull(),
  developerName: varchar("developer_name", { length: 50 }).notNull(),
  addrOff: text("addr_off").notNull(),
  addrReal: text("addr_real").notNull(),
  telephone: varchar("telephone", { length: 20 }).notNull(),
  faxNo: varchar("fax_no", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  website: text("website").notNull(),
  pcbOffice: varchar("pcb_office", { length: 100 }).notNull(),
  addressOfResident: text("address_of_resident").notNull(),
  areaResidential: text("area_residential").notNull(),
  block: text("block").notNull(),
  blockType: text("block_type").notNull(),
  block1: text("block1").notNull(),
  blockType1: text("block_type1").notNull(),
  projectArea: text("project_area").notNull(),
  dwellingUnit: text("dwelling_unit").notNull(),
  dateOfEc: date("Date_of_Ec").notNull(),
  nodalPerson: varchar("Nodal_Person", { length: 50 }).notNull(),
  dateOfInstallationAqms: date("Date_of_Installation_AQMS").notNull(),
  dateOfInstallationWqms: date("Date_of_Installation_WQMS").notNull(),
  dateOfInstallationAnms: date("Date_of_Installation_ANMS").notNull(),
  dateOfInstallationNoise: date("Date_of_Installation_Noise").notNull(),
  dateOfAutoComposter: date("Date_of_Auto_Composter").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  expPopulation: text("exp_population").notNull(),
  totalWater: text("total_water").notNull(),
  freshWater: text("fresh_water").notNull(),
  wasteWater: text("waste_water").notNull(),
  treatedWaterRecycled: text("treated_water_recycled").notNull(),
  treatedWaterDischarged: text("treated_water_discharged").notNull(),
  solid: text("solid").notNull(),
  noOfStory: text("no_of_story").notNull(),
  ground: text("ground").notNull(),
  pavedArea: text("paved_area").notNull(),
  greenArea: text("green_area").notNull(),
  exclusive: text("exclusive").notNull(),
  noOfPlantation: text("no_of_plantation").notNull(),
  services: text("services").notNull(),
  noOfParking: text("no_of_parking").notNull(),
  totalPower: text("total_power").notNull(),
  backUp: text("back_up").notNull(),
  solarStreet: text("solar_street").notNull(),
  solarDetails: text("solar_details").notNull(),
  noOfFlats: text("no_of_flats").notNull(),
  noOfBunglows: text("no_of_bunglows").notNull(),
  noOfCommercials: text("no_of_commercials").notNull(),
  status: varchar("status", { length: 30 }).notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  delStatus: int("del_status").notNull(),
  geoLocation: varchar("geo_location", { length: 1000 }).notNull(),
});

export const sessionMaster = mysqlTable("session_master", {
  id: int("id").primaryKey().autoincrement(),
  realEstateId: int("real_estate_id").notNull(),
  fromSession: varchar("from_session", { length: 50 }).notNull(),
  toSession: varchar("to_session", { length: 50 }).notNull(),
  sessionKey: varchar("session_key", { length: 255 }).notNull(),
});

export const solarEnergy = mysqlTable("solar_energy", {
  id: int("id").notNull(),
  capacity: text("capacity").notNull(),
  warrantyValidity: text("warranty_validity").notNull(),
  mfg: varchar("mfg", { length: 20 }).notNull(),
  address: text("address").notNull(),
  gst: varchar("gst", { length: 30 }).notNull(),
  contactName: varchar("contact_name", { length: 30 }).notNull(),
  mobile: text("mobile").notNull(),
  email: text("email").notNull(),
  period: date("period").notNull(),
  points: int("points").notNull(),
  remarks: varchar("remarks", { length: 30 }).notNull(),
  flag: text("flag").notNull(),
  realEstateId: int("real_estate_id").notNull(),
  installDate: date("install_date").notNull(),
});

export const solarGeneration = mysqlTable("solar_generation", {
  id: int("id").primaryKey().autoincrement(),
  dt: date("dt").notNull(),
  solarReadings: text("solar_readings").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const state = mysqlTable("state", {
  stateId: int("state_id").notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  stateDescription: text("state_description").notNull(),
  status: varchar("status", { length: 10 }).notNull(),
});

export const stp = mysqlTable("stp", {
  id: int("id").notNull(),
  capacityStp: text("capacity_stp").notNull(),
  warrantyValidity: date("warranty_validity").notNull(),
  mfgName: text("mfg_name").notNull(),
  address: text("address").notNull(),
  gst: text("gst").notNull(),
  contactPerson: varchar("contact_person", { length: 30 }).notNull(),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  email: text("email").notNull(),
  pointsStp: int("points_stp").notNull(),
  remarksStp: varchar("remarks_stp", { length: 30 }).notNull(),
  flagStp: text("flag_stp").notNull(),
  realEstateId: int("real_estate_id").notNull(),
  installDate: date("install_date").notNull(),
});

export const stpReading = mysqlTable("stp_reading", {
  id: int("id").primaryKey().autoincrement(),
  inlet: double("inlet").notNull(),
  outlet: double("outlet").notNull(),
  bod: double("bod").notNull(),
  ph: double("ph").notNull(),
  tss: double("tss").notNull(),
  nitrogen: double("nitrogen").notNull(),
  cod: double("cod").notNull(),
  feedal: double("feedal").notNull(),
  coliform: double("coliform").notNull(),
  readingDate: date("reading_date").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const tempAqiData = mysqlTable("temp_aqi_data", {
  id: int("id").primaryKey().autoincrement(),
  upddate: timestamp("upddate").notNull().defaultNow().onUpdateNow(),
  pollutants: varchar("pollutants", { length: 100 }).notNull(),
  concentration: float("concentration").notNull(),
  subIndex: float("sub_index").notNull(),
  checkVal: int("check_val").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const tempLivability = mysqlTable("temp_livability", {
  id: int("id").primaryKey().autoincrement(),
  realEstateId: int("real_estate_id").notNull(),
  perOfLivability: int("per_of_livability").notNull(),
});

export const tempRealMaster = mysqlTable("temp_real_master", {
  id: int("id").notNull(),
  date1: date("date1").notNull(),
  time1: time("time1").notNull(),
  realEstateName: varchar("real_estate_name", { length: 200 }).notNull().unique(),
  profilePhoto: varchar("profile_photo", { length: 255 }).notNull(),
  industryType: int("industry_type").notNull(),
  industryClassification: int("industry_classification").notNull(),
  categoriesIndustry: int("categories_industry").notNull(),
  registrationNo: varchar("registration_no", { length: 100 }).notNull(),
  scale: varchar("scale", { length: 100 }).notNull(),
  dateOffComm: date("date_off_comm").notNull(),
  powerSupply: varchar("power_supply", { length: 100 }).notNull(),
  noOfStaff: int("no_of_staff").notNull(),
  tradeLicense: varchar("trade_license", { length: 100 }).notNull(),
  tradeLicenseIssBy: varchar("trade_license_iss_by", { length: 100 }).notNull(),
  issDate: date("iss_date").notNull(),
  validUpto: date("valid_upto").notNull(),
  gstinDetail: varchar("gstin_detail", { length: 100 }).notNull(),
  gstDoc: text("gst_doc").notNull(),
  addrFactory: text("addr_factory").notNull(),
  phone: bigint("phone", { mode: "number" }).notNull(),
  comEmailId: varchar("com_email_id", { length: 100 }).notNull(),
  landNo: varchar("land_no", { length: 255 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  district: varchar("district", { length: 50 }).notNull(),
  city: varchar("city", { length: 50 }).notNull(),
  pinCode: int("pin_code").notNull(),
  postOffice: varchar("post_office", { length: 100 }).notNull(),
  policeStation: varchar("police_station", { length: 100 }).notNull(),
  localBody: varchar("local_body", { length: 100 }).notNull(),
  wordNo: varchar("word_no", { length: 100 }).notNull(),
  jlNo: varchar("jl_no", { length: 100 }).notNull(),
  plotNo: varchar("plot_no", { length: 100 }).notNull(),
  dagNo: varchar("dag_no", { length: 100 }).notNull(),
  developerName: varchar("developer_name", { length: 50 }).notNull(),
  addrOff: varchar("addr_off", { length: 100 }).notNull(),
  addrReal: text("addr_real").notNull(),
  telephone: bigint("telephone", { mode: "number" }).notNull(),
  faxNo: varchar("fax_no", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  website: text("website").notNull(),
  pcbOffice: varchar("pcb_office", { length: 100 }).notNull(),
  addressOfResident: varchar("address_of_resident", { length: 100 }).notNull(),
  areaResidential: float("area_residential").notNull(),
  block: int("block").notNull(),
  blockType: varchar("block_type", { length: 30 }).notNull(),
  block1: int("block1").notNull(),
  blockType1: varchar("block_type1", { length: 20 }).notNull(),
  projectArea: text("project_area").notNull(),
  dwellingUnit: int("dwelling_unit").notNull(),
  dateOfEc: date("Date_of_Ec").notNull(),
  nodalPerson: varchar("Nodal_Person", { length: 50 }).notNull(),
  dateOfInstallationAqms: date("Date_of_Installation_AQMS").notNull(),
  dateOfInstallationWqms: date("Date_of_Installation_WQMS").notNull(),
  dateOfInstallationAnms: date("Date_of_Installation_ANMS").notNull(),
  dateOfInstallationNoise: date("Date_of_Installation_Noise").notNull(),
  dateOfAutoComposter: date("Date_of_Auto_Composter").notNull(),
  approval: int("approval").notNull(),
  approveBy: varchar("approve_by", { length: 100 }).notNull(),
  approveDateTime: timestamp("approve_date_time").notNull().defaultNow().onUpdateNow(),
  latitude: varchar("latitude", { length: 200 }).notNull(),
  expPopulation: text("exp_population").notNull(),
  totalWater: text("total_water").notNull(),
  freshWater: text("fresh_water").notNull(),
  wasteWater: text("waste_water").notNull(),
  treatedWaterRecycled: text("treated_water_recycled").notNull(),
  treatedWaterDischarged: text("treated_water_discharged").notNull(),
  solid: text("solid").notNull(),
  noOfStory: text("no_of_story").notNull(),
  ground: text("ground").notNull(),
  pavedArea: text("paved_area").notNull(),
  greenArea: text("green_area").notNull(),
  exclusive: text("exclusive").notNull(),
  noOfPlantation: text("no_of_plantation").notNull(),
  services: text("services").notNull(),
  noOfParking: text("no_of_parking").notNull(),
  totalPower: text("total_power").notNull(),
  backUp: text("back_up").notNull(),
  solarStreet: text("solar_street").notNull(),
  solarDetails: text("solar_details").notNull(),
  noOfFlats: int("no_of_flats").notNull(),
  noOfBunglows: int("no_of_bunglows").notNull(),
  noOfCommercials: int("no_of_commercials").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
});

export const trees = mysqlTable("trees", {
  id: int("id").notNull(),
  botName: text("bot_name").notNull(),
  comName: text("com_name").notNull(),
  quantity: int("quantity").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const userAccess = mysqlTable("user_access", {
  id: int("id").notNull(),
  menu: varchar("menu", { length: 50 }).notNull(),
  submenu: varchar("submenu", { length: 50 }).notNull(),
  fullControl: int("full_control").notNull(),
  entryOnly: int("entry_only").notNull(),
  readOnly: int("read_only").notNull(),
  updateDelete: int("update_delete").notNull(),
  exceptDelete: int("except_delete").notNull(),
  noControl: int("no_control").notNull(),
});

export const userMaster = mysqlTable("user_master", {
  id: int("id").notNull(),
  userName: varchar("user_name", { length: 30 }).notNull(),
  userId: varchar("user_id", { length: 30 }).notNull().unique(),
  password: varchar("password", { length: 30 }).notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(),
  status: int("status").notNull(),
  createdon: date("createdon").notNull(),
  updatedon: date("updatedon").notNull(),
  stateId: int("state_id").notNull(),
  phone: bigint("phone", { mode: "number" }).notNull(),
  website: varchar("website", { length: 250 }).notNull(),
  email: varchar("email", { length: 250 }).notNull(),
});

export const wasteCollection = mysqlTable("waste_collection", {
  id: int("id").notNull(),
  wasteGen: double("waste_gen").notNull(),
  wasteTreat: double("waste_treat").notNull(),
  wasteDateCollec: date("waste_date_collec").notNull(),
  ulb: int("ulb").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const wasteDetails = mysqlTable("waste_details", {
  id: int("id").notNull(),
  wasteName: text("waste_name").notNull(),
  wasteDate: date("waste_date").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const wasteRelated = mysqlTable("waste_related", {
  id: int("id").notNull(),
  door: text("door").notNull(),
  auto: text("auto").notNull(),
  segregation: text("segregation").notNull(),
  pointsWaste: int("points_waste").notNull(),
  pointsSegregation: int("points_segregation").notNull(),
  remarksWaste: varchar("remarks_waste", { length: 30 }).notNull(),
  remarksSegre: varchar("remarks_segre", { length: 30 }).notNull(),
  flagWaste: text("flag_waste").notNull(),
  realEstateId: int("real_estate_id").notNull(),
  installDate: date("install_date").notNull(),
});

export const waterConsumptionList = mysqlTable("water_consumption_list", {
  id: int("id").notNull(),
  waterConsumptionQuantity: int("water_consumption_quantity").notNull(),
  uomWaterconsumption: varchar("UOM_waterconsumption", { length: 20 }).notNull(),
  dischargeQuantity: int("discharge_quantity").notNull(),
  uomDischarge: varchar("UOM_discharge", { length: 20 }).notNull(),
  treatmentQuantity: int("treatment_quantity").notNull(),
  uomTreatment: varchar("UOM_treatment", { length: 20 }).notNull(),
  airDate: date("air_date").notNull(),
  industryMs: varchar("industry_ms", { length: 40 }).notNull(),
});

export const waterPolutionList = mysqlTable("water_polution_list", {
  id: int("id").notNull(),
  waterPolution: varchar("water_polution", { length: 50 }).notNull(),
  inlet: varchar("inlet", { length: 10 }).notNull(),
  outlet: varchar("outlet", { length: 10 }).notNull(),
  sampleDate: date("sample_date").notNull(),
  reportDate: date("report_date").notNull(),
  readingTime: varchar("reading_time", { length: 20 }).notNull(),
  laboratory: varchar("laboratory", { length: 50 }).notNull(),
  airDate: date("air_date").notNull(),
  industryMs: varchar("industry_ms", { length: 20 }).notNull(),
});

export const waterQuality = mysqlTable("water_quality", {
  id: int("id").primaryKey().autoincrement(),
  tss: varchar("tss", { length: 30 }).notNull(),
  tds: varchar("tds", { length: 30 }).notNull(),
  temp: varchar("temp", { length: 30 }).notNull(),
  ph: bigint("ph", { mode: "number" }).notNull(),
  bod: varchar("bod", { length: 50 }).notNull(),
  cod: varchar("cod", { length: 50 }).notNull(),
  readingDate: date("reading_date").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const waterSensor = mysqlTable("water_sensor", {
  id: bigint("id", { mode: "number" }).notNull(),
  device: text("device").notNull(),
  timestamp: datetime("timestamp").notNull(),
  waterdepth: text("waterdepth").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

export const waterSensorAll = mysqlTable("water_sensor_all", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  device: text("device").notNull(),
  timestamp: datetime("timestamp").notNull(),
  waterdepth: text("waterdepth").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});


// ---------------------------------------------------------------------------
// NEW TABLES (did not exist in libility.sql) — required by the migrated
// third-party API integrations. Run `npm run db:generate && npm run db:migrate`
// after reviewing these to add them to the database.
// ---------------------------------------------------------------------------

// Stores per-reading rows pulled from the EnggEnv AAQ "fetchAll" endpoint
// (replaces the old `sensor_water` inserts in admin/pcb/real_estate api_new*.php)
export const sensorWater = mysqlTable("sensor_water", {
  id: int("id").primaryKey().autoincrement(),
  site: varchar("site", { length: 100 }).notNull(),
  deviceId: varchar("device_id", { length: 100 }).notNull(),
  place: varchar("place", { length: 150 }).notNull(),
  lat: varchar("lat", { length: 30 }).notNull(),
  lon: varchar("lon", { length: 30 }).notNull(),
  ph: varchar("ph", { length: 30 }).notNull(),
  tds: varchar("tds", { length: 30 }).notNull(),
  temp: varchar("temp", { length: 30 }).notNull(),
  tsServer: varchar("ts_server", { length: 50 }).notNull(),
  cod: varchar("cod", { length: 30 }).notNull(),
  bod: varchar("bod", { length: 30 }).notNull(),
  tss: varchar("tss", { length: 30 }).notNull(),
  curdttime: datetime("curdttime").notNull(),
  realEstateId: int("real_estate_id").notNull(),
});

// Stores rows pulled from the Paribesh noise API
// (replaces the old `noise_details` inserts in pcb/progress2.php)
export const noiseDetails = mysqlTable("noise_details", {
  id: int("id").primaryKey().autoincrement(),
  header: varchar("header", { length: 255 }).notNull(),
  subheader: varchar("subheader", { length: 255 }).notNull(),
  zone: varchar("zone", { length: 150 }).notNull(),
  dateApi: varchar("date_api", { length: 50 }).notNull(),
  value: varchar("value", { length: 50 }).notNull(),
  dateForNoise: varchar("date_for_noise", { length: 30 }).notNull(),
  realEstateId: int("real_estate_id").notNull(),
});
