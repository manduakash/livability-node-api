CREATE TABLE `air_polution_list` (
	`id` int NOT NULL,
	`air_emmition` int NOT NULL,
	`air_pollution_parameters` int NOT NULL,
	`reading` int NOT NULL,
	`sample_date` varchar(10) NOT NULL,
	`report_date` varchar(10) NOT NULL,
	`laboratory` varchar(30) NOT NULL,
	`air_date` date NOT NULL,
	`industry_ms` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `amc` (
	`id` int NOT NULL,
	`name` varchar(30) NOT NULL,
	`address` text NOT NULL,
	`phone` bigint NOT NULL,
	`emailid` text NOT NULL,
	`gst` varchar(30) NOT NULL,
	`fact_sheet` varchar(20) NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `amc_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anms_detail` (
	`id` int NOT NULL,
	`real_estate_id` int NOT NULL,
	`parameters` text NOT NULL,
	`warranty` date NOT NULL,
	`mfg_name` varchar(30) NOT NULL,
	`address` text NOT NULL,
	`gst` varchar(30) NOT NULL,
	`contact_person` varchar(30) NOT NULL,
	`mobile` varchar(15) NOT NULL,
	`email` text NOT NULL,
	`flag_anms` text NOT NULL,
	`points_an` int NOT NULL,
	`remarks_an` varchar(20) NOT NULL,
	`install_date` date NOT NULL,
	CONSTRAINT `anms_detail_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anms_details` (
	`id` int NOT NULL,
	`machine` text NOT NULL,
	`name_of_manufacturer` varchar(50) NOT NULL,
	`date_manufacture` date NOT NULL,
	`date_install` date NOT NULL,
	`parameters` text NOT NULL,
	`date_waranty` date NOT NULL,
	`waranty_person` varchar(50) NOT NULL,
	`address_of_waranty_person` text NOT NULL,
	`real_estate_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `aqi_for_pcb` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pollutants` varchar(100) NOT NULL,
	`concentration` float NOT NULL,
	`sub_index` float NOT NULL,
	`check_val` int NOT NULL,
	`real_estate_id` int NOT NULL,
	`upddate` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aqi_for_pcb_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aqms_detail` (
	`id` int NOT NULL,
	`real_estate_id` int NOT NULL,
	`parameters` text NOT NULL,
	`warranty` date NOT NULL,
	`mfg_name` varchar(30) NOT NULL,
	`address` text NOT NULL,
	`gst` varchar(20) NOT NULL,
	`contact_person` varchar(30) NOT NULL,
	`mobile` varchar(15) NOT NULL,
	`email` text NOT NULL,
	`flag_aqms` text NOT NULL,
	`points_aq` int NOT NULL,
	`remarks_aq` int NOT NULL,
	`install_date` date NOT NULL,
	CONSTRAINT `aqms_detail_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aqms_details` (
	`id` int NOT NULL,
	`machine` text NOT NULL,
	`name_of_manufacturer` varchar(50) NOT NULL,
	`date_manufacture` date NOT NULL,
	`date_install` date NOT NULL,
	`parameters` text NOT NULL,
	`date_waranty` date NOT NULL,
	`waranty_person` varchar(50) NOT NULL,
	`address_of_waranty_person` text NOT NULL,
	`real_estate_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `aqms_monitoring` (
	`id` int AUTO_INCREMENT NOT NULL,
	`main_id` int NOT NULL,
	`ext_humi_avg` double NOT NULL,
	`ext_humi_max` double NOT NULL,
	`ext_humi_min` double NOT NULL,
	`ext_temp_avg` double NOT NULL,
	`ext_temp_max` double NOT NULL,
	`ext_temp_min` double NOT NULL,
	`int_humi_avg` double NOT NULL,
	`int_humi_max` double NOT NULL,
	`int_humi_min` double NOT NULL,
	`int_temp_avg` double NOT NULL,
	`int_temp_max` double NOT NULL,
	`int_temp_min` double NOT NULL,
	`last_online` text NOT NULL,
	`no2_avg` double NOT NULL,
	`no2_max` double NOT NULL,
	`no2_min` double NOT NULL,
	`pm1_avg` double NOT NULL,
	`pm1_max` double NOT NULL,
	`pm1_min` double NOT NULL,
	`pm10_avg` double NOT NULL,
	`pm10_max` double NOT NULL,
	`pm10_min` double NOT NULL,
	`pm25_avg` double NOT NULL,
	`pm25_max` double NOT NULL,
	`pm25_min` double NOT NULL,
	`pm_humi_avg` double NOT NULL,
	`pm_humi_max` double NOT NULL,
	`pm_humi_min` double NOT NULL,
	`pm_temp_avg` double NOT NULL,
	`pm_temp_max` double NOT NULL,
	`pm_temp_min` double NOT NULL,
	`so2_avg` double NOT NULL,
	`so2_max` double NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `aqms_monitoring_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aqms_monitoring_aqi` (
	`id` int NOT NULL,
	`main_id` int NOT NULL,
	`aqi` int NOT NULL,
	`aqi_date` date NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `aqms_monitoring_aqi_aqi_unique` UNIQUE(`aqi`)
);
--> statement-breakpoint
CREATE TABLE `aqms_monitoring_main` (
	`id` int AUTO_INCREMENT NOT NULL,
	`aq_details_id` int NOT NULL,
	`prompt_pol` varchar(20) NOT NULL,
	`location` varchar(30) NOT NULL,
	`district` varchar(50) NOT NULL,
	`date_aqms` date NOT NULL,
	`hour` int NOT NULL,
	`aqi` double NOT NULL,
	`points_aqms` int NOT NULL,
	`remarks_aqms` varchar(30) NOT NULL,
	`real_estate_id` int NOT NULL,
	`time_air` time NOT NULL,
	CONSTRAINT `aqms_monitoring_main_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_trial` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date1` datetime NOT NULL,
	`type` varchar(100) NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`lnk` varchar(100) NOT NULL,
	`ip` varchar(50) NOT NULL,
	`panel` varchar(20) NOT NULL,
	`module` varchar(250) NOT NULL,
	`real_estate_name` varchar(30) NOT NULL,
	`browser` varchar(250) NOT NULL,
	`device` varchar(250) NOT NULL,
	CONSTRAINT `audit_trial_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autocomposter` (
	`id` int NOT NULL,
	`dt` date NOT NULL,
	`tot_compost_production` float NOT NULL,
	`tot_hours` int NOT NULL,
	`real_estate_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `city` (
	`id` int AUTO_INCREMENT NOT NULL,
	`city_name` varchar(255) NOT NULL,
	`districtid` int NOT NULL,
	`state_id` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`status` varchar(10) NOT NULL,
	CONSTRAINT `city_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clasification_master` (
	`id` int NOT NULL,
	`clasification_name` varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comparison_chart` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_name` text NOT NULL,
	`aqms` varchar(5) NOT NULL,
	`anms` varchar(5) NOT NULL,
	`solar_energy` varchar(5) NOT NULL,
	`stp` varchar(5) NOT NULL,
	`rainwater_harvesting` varchar(5) NOT NULL,
	`drinking_water` varchar(5) NOT NULL,
	`waste_related` varchar(5) NOT NULL,
	`display_board` varchar(5) NOT NULL,
	`green_area` varchar(5) NOT NULL,
	CONSTRAINT `comparison_chart_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_us` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fname` varchar(255) NOT NULL,
	`lname` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`district` varchar(255) NOT NULL,
	`city` varchar(255) NOT NULL,
	`pin_no` varchar(255) NOT NULL,
	`profile` varchar(255) NOT NULL,
	`doc_path` text NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `contact_us_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `date_wise_aqi_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_estate_id` int NOT NULL,
	`upddate` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`aqi` bigint NOT NULL,
	`pollutants` varchar(255) NOT NULL,
	CONSTRAINT `date_wise_aqi_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dg_set_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hours_used` int NOT NULL,
	`electricity` int NOT NULL,
	`oil_consumption` double NOT NULL,
	`waste_generated` int NOT NULL,
	`real_estate_id` int NOT NULL,
	`date_of_dg` date NOT NULL,
	CONSTRAINT `dg_set_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `display_board` (
	`id` int NOT NULL,
	`status` varchar(20) NOT NULL,
	`points_dis` int NOT NULL,
	`remarks_dis` varchar(20) NOT NULL,
	`real_estate_id` int NOT NULL,
	`install_date` date NOT NULL
);
--> statement-breakpoint
CREATE TABLE `district` (
	`id` int AUTO_INCREMENT NOT NULL,
	`district_name` varchar(100) NOT NULL,
	`state_id` int NOT NULL,
	`district_description` text NOT NULL,
	`district_status` varchar(10) NOT NULL,
	CONSTRAINT `district_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ec_inter_mon_test` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_estate_id` int NOT NULL,
	`ec_module_id` int NOT NULL,
	`result` varchar(255) NOT NULL,
	`air_qua` varchar(255) NOT NULL,
	`noise_qua` varchar(255) NOT NULL,
	`water_qua` varchar(255) NOT NULL,
	`session_key` varchar(255) NOT NULL,
	CONSTRAINT `ec_inter_mon_test_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ec_module` (
	`id` int NOT NULL,
	`real_estate_id` int NOT NULL,
	`session` varchar(255) NOT NULL,
	`month_of_submittion` varchar(255) NOT NULL,
	`vide_letter_no` text NOT NULL,
	`project_proponent` varchar(255) NOT NULL,
	`project_location` text NOT NULL,
	`purpose_report` text NOT NULL,
	`method_report` text NOT NULL,
	`abbreviations` text NOT NULL,
	`project_detail` text NOT NULL,
	`cons_status` text NOT NULL,
	`health_occupation` text NOT NULL,
	`loc_gmap` varchar(255) NOT NULL,
	`loc_gsat` varchar(255) NOT NULL,
	`ec_clear` text NOT NULL,
	`water_qua` text NOT NULL,
	`contact_pp` text NOT NULL,
	`add_pp` text NOT NULL,
	`email_p` varchar(255) NOT NULL,
	`tel_fax_p` varchar(255) NOT NULL,
	`envp` text NOT NULL,
	`upload_ec` text NOT NULL,
	`session_key` varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ec_module_condition` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_estate_id` int NOT NULL,
	`ec_module_id` int NOT NULL,
	`condition` int NOT NULL,
	`sub_condition` int NOT NULL,
	`head` int NOT NULL,
	`sub_head1` text NOT NULL,
	`sub_head2` text NOT NULL,
	`session_key` varchar(255) NOT NULL,
	CONSTRAINT `ec_module_condition_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ec_module_field_photograph` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_estate_id` int NOT NULL,
	`ec_module_id` int NOT NULL,
	`field_image` varchar(255) NOT NULL,
	`field_image_title` varchar(255) NOT NULL,
	`session_key` varchar(255) NOT NULL,
	CONSTRAINT `ec_module_field_photograph_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ec_module_project_view` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_estate_id` int NOT NULL,
	`ec_module_id` int NOT NULL,
	`image` varchar(255) NOT NULL,
	`image_title` varchar(255) NOT NULL,
	`session_key` varchar(255) NOT NULL,
	CONSTRAINT `ec_module_project_view_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ec_monitoring_chem_ana` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_estate_id` int NOT NULL,
	`ec_module_id` int NOT NULL,
	`sample_collection` varchar(255) NOT NULL,
	`sample_drawn` date NOT NULL,
	`chemical_analysis` int NOT NULL,
	`test_parameter` varchar(255) NOT NULL,
	`desirable_limit` varchar(255) NOT NULL,
	`permissible_limit` varchar(255) NOT NULL,
	`result` varchar(255) NOT NULL,
	`session_key` varchar(255) NOT NULL,
	CONSTRAINT `ec_monitoring_chem_ana_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ec_monitoring_micro_ana` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_estate_id` int NOT NULL,
	`ec_module_id` int NOT NULL,
	`sample_collection` varchar(50) NOT NULL,
	`sample_drawn` date NOT NULL,
	`microbial_analysis` int NOT NULL,
	`test_parameter` varchar(255) NOT NULL,
	`limit_as_per` varchar(255) NOT NULL,
	`result` varchar(255) NOT NULL,
	`session_key` varchar(255) NOT NULL,
	CONSTRAINT `ec_monitoring_micro_ana_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ec_remedial` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_estate_id` int NOT NULL,
	`ec_module_id` int NOT NULL,
	`result` varchar(255) NOT NULL,
	`air_qua` varchar(255) NOT NULL,
	`noise_qua` varchar(255) NOT NULL,
	`water_qua` varchar(255) NOT NULL,
	`session_key` varchar(255) NOT NULL,
	CONSTRAINT `ec_remedial_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ec_sanction` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_estate_id` int NOT NULL,
	`date1` date NOT NULL,
	`sanc_lett` varchar(255) NOT NULL,
	`vid_letter_no` varchar(255) NOT NULL,
	`project_location` varchar(255) NOT NULL,
	CONSTRAINT `ec_sanction_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feed_back_real` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feed` varchar(11) NOT NULL,
	`rating1` varchar(11) NOT NULL,
	`rating2` varchar(11) NOT NULL,
	`rating3` varchar(11) NOT NULL,
	`rating4` varchar(11) NOT NULL,
	`rating5` varchar(11) NOT NULL,
	`rating6` varchar(11) NOT NULL,
	`list` varchar(11) NOT NULL,
	`comm` varchar(11) NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `feed_back_real_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `green` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tot_area` text NOT NULL,
	`mandated_area` text NOT NULL,
	`actual_area` text NOT NULL,
	`trees` varchar(11) NOT NULL,
	`type` varchar(11) NOT NULL,
	`dt` date NOT NULL,
	`points_green` int NOT NULL,
	`points_tree` int NOT NULL,
	`remarks_green` varchar(30) NOT NULL,
	`remarks_tree` varchar(30) NOT NULL,
	`flag_green` text NOT NULL,
	`flag_tree` text NOT NULL,
	`real_estate_id` int NOT NULL,
	`actual_trees` varchar(5) NOT NULL,
	`install_date` date NOT NULL,
	CONSTRAINT `green_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `industry_category` (
	`id` int NOT NULL,
	`category` varchar(30) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `industry_master` (
	`id` int NOT NULL,
	`name_of_industry` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `industry_type_master` (
	`id` int NOT NULL,
	`type_of_industry` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `laboratory_master` (
	`id` int NOT NULL,
	`lab_name` varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `livability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date1` date NOT NULL,
	`real_estate_id` int NOT NULL,
	`livability_id` int NOT NULL,
	`status` varchar(50) NOT NULL,
	`remarks` varchar(50) NOT NULL,
	CONSTRAINT `livability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `livability_index_master` (
	`id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`points` int NOT NULL,
	`date_of_liv` date NOT NULL,
	`remarks` varchar(30) NOT NULL,
	CONSTRAINT `livability_index_master_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `noise_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`header` varchar(255) NOT NULL,
	`subheader` varchar(255) NOT NULL,
	`zone` varchar(150) NOT NULL,
	`date_api` varchar(50) NOT NULL,
	`value` varchar(50) NOT NULL,
	`date_for_noise` varchar(30) NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `noise_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `noise_details_all` (
	`id` int NOT NULL,
	`an_details_id` int NOT NULL,
	`location` text NOT NULL,
	`time_s` datetime NOT NULL,
	`las` double NOT NULL,
	`lcs` double NOT NULL,
	`lzs` double NOT NULL,
	`laeqt` double NOT NULL,
	`lapeakt` double NOT NULL,
	`lceqt` double NOT NULL,
	`lcpeakt` double NOT NULL,
	`lzeqt` double NOT NULL,
	`lzpeakt` double NOT NULL,
	`points_anms` int NOT NULL,
	`remarks_anms` varchar(30) NOT NULL,
	`temperature_degree_celsius` double NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `noise_details_all_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_messages` (
	`id` int NOT NULL,
	`description` text NOT NULL,
	`subject` varchar(30) NOT NULL,
	`flag` tinyint NOT NULL,
	`date_n` date NOT NULL,
	`time_n` time NOT NULL,
	`real_estate_id` int NOT NULL,
	`extraa` int NOT NULL,
	`user_type` varchar(250) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pagination_table` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(250) NOT NULL,
	`age` int NOT NULL,
	`dept` varchar(250) NOT NULL,
	CONSTRAINT `pagination_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portable_water_quality` (
	`id` int NOT NULL,
	`portable` text NOT NULL,
	`from_outside` varchar(40) NOT NULL,
	`received` text NOT NULL,
	`water_quality` int NOT NULL,
	`dt` date NOT NULL,
	`flag_drinking` text NOT NULL,
	`water_sensor` text NOT NULL,
	`points_of_sensor` int NOT NULL,
	`real_estate_id` int NOT NULL,
	`install_date` date NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rainwater_harvesting` (
	`id` int NOT NULL,
	`capacity_harvesting` text NOT NULL,
	`warranty_harvesting` date NOT NULL,
	`mfg_harvesting` text NOT NULL,
	`address_harvesting` text NOT NULL,
	`gst_harvesting` varchar(20) NOT NULL,
	`contact_harvesting` text NOT NULL,
	`mobile_harvesting` varchar(20) NOT NULL,
	`email_harvesting` text NOT NULL,
	`points` int NOT NULL,
	`remarks` varchar(30) NOT NULL,
	`flag` text NOT NULL,
	`real_estate_id` int NOT NULL,
	`install_date` date NOT NULL
);
--> statement-breakpoint
CREATE TABLE `real_estate_master` (
	`id` int NOT NULL,
	`date1` date NOT NULL,
	`real_estate_name` varchar(200) NOT NULL,
	`profile_photo` varchar(255) NOT NULL,
	`industry_type` int NOT NULL,
	`industry_classification` int NOT NULL,
	`categories_industry` int NOT NULL,
	`registration_no` varchar(100) NOT NULL,
	`scale` varchar(100) NOT NULL,
	`date_off_comm` date NOT NULL,
	`power_supply` varchar(100) NOT NULL,
	`no_of_staff` int NOT NULL,
	`trade_license` varchar(100) NOT NULL,
	`trade_license_iss_by` varchar(100) NOT NULL,
	`iss_date` date NOT NULL,
	`valid_upto` date NOT NULL,
	`gstin_detail` varchar(100) NOT NULL,
	`gst_doc` text NOT NULL,
	`addr_factory` text NOT NULL,
	`phone` varchar(20) NOT NULL,
	`com_email_id` varchar(100) NOT NULL,
	`land_no` varchar(255) NOT NULL,
	`state` varchar(50) NOT NULL,
	`district` varchar(50) NOT NULL,
	`city` varchar(50) NOT NULL,
	`pin_code` int NOT NULL,
	`post_office` varchar(100) NOT NULL,
	`police_station` varchar(100) NOT NULL,
	`local_body` varchar(100) NOT NULL,
	`word_no` varchar(100) NOT NULL,
	`jl_no` varchar(100) NOT NULL,
	`plot_no` varchar(100) NOT NULL,
	`dag_no` varchar(100) NOT NULL,
	`developer_name` varchar(50) NOT NULL,
	`addr_off` text NOT NULL,
	`addr_real` text NOT NULL,
	`telephone` varchar(20) NOT NULL,
	`fax_no` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`website` text NOT NULL,
	`pcb_office` varchar(100) NOT NULL,
	`address_of_resident` text NOT NULL,
	`area_residential` text NOT NULL,
	`block` text NOT NULL,
	`block_type` text NOT NULL,
	`block1` text NOT NULL,
	`block_type1` text NOT NULL,
	`project_area` text NOT NULL,
	`dwelling_unit` text NOT NULL,
	`Date_of_Ec` date NOT NULL,
	`Nodal_Person` varchar(50) NOT NULL,
	`Date_of_Installation_AQMS` date NOT NULL,
	`Date_of_Installation_WQMS` date NOT NULL,
	`Date_of_Installation_ANMS` date NOT NULL,
	`Date_of_Installation_Noise` date NOT NULL,
	`Date_of_Auto_Composter` date NOT NULL,
	`latitude` text NOT NULL,
	`longitude` text NOT NULL,
	`exp_population` text NOT NULL,
	`total_water` text NOT NULL,
	`fresh_water` text NOT NULL,
	`waste_water` text NOT NULL,
	`treated_water_recycled` text NOT NULL,
	`treated_water_discharged` text NOT NULL,
	`solid` text NOT NULL,
	`no_of_story` text NOT NULL,
	`ground` text NOT NULL,
	`paved_area` text NOT NULL,
	`green_area` text NOT NULL,
	`exclusive` text NOT NULL,
	`no_of_plantation` text NOT NULL,
	`services` text NOT NULL,
	`no_of_parking` text NOT NULL,
	`total_power` text NOT NULL,
	`back_up` text NOT NULL,
	`solar_street` text NOT NULL,
	`solar_details` text NOT NULL,
	`no_of_flats` text NOT NULL,
	`no_of_bunglows` text NOT NULL,
	`no_of_commercials` text NOT NULL,
	`status` varchar(30) NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`del_status` int NOT NULL,
	`geo_location` varchar(1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sensor_water` (
	`id` int AUTO_INCREMENT NOT NULL,
	`site` varchar(100) NOT NULL,
	`device_id` varchar(100) NOT NULL,
	`place` varchar(150) NOT NULL,
	`lat` varchar(30) NOT NULL,
	`lon` varchar(30) NOT NULL,
	`ph` varchar(30) NOT NULL,
	`tds` varchar(30) NOT NULL,
	`temp` varchar(30) NOT NULL,
	`ts_server` varchar(50) NOT NULL,
	`cod` varchar(30) NOT NULL,
	`bod` varchar(30) NOT NULL,
	`tss` varchar(30) NOT NULL,
	`curdttime` datetime NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `sensor_water_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_master` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_estate_id` int NOT NULL,
	`from_session` varchar(50) NOT NULL,
	`to_session` varchar(50) NOT NULL,
	`session_key` varchar(255) NOT NULL,
	CONSTRAINT `session_master_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `solar_energy` (
	`id` int NOT NULL,
	`capacity` text NOT NULL,
	`warranty_validity` text NOT NULL,
	`mfg` varchar(20) NOT NULL,
	`address` text NOT NULL,
	`gst` varchar(30) NOT NULL,
	`contact_name` varchar(30) NOT NULL,
	`mobile` text NOT NULL,
	`email` text NOT NULL,
	`period` date NOT NULL,
	`points` int NOT NULL,
	`remarks` varchar(30) NOT NULL,
	`flag` text NOT NULL,
	`real_estate_id` int NOT NULL,
	`install_date` date NOT NULL
);
--> statement-breakpoint
CREATE TABLE `solar_generation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dt` date NOT NULL,
	`solar_readings` text NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `solar_generation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `state` (
	`state_id` int NOT NULL,
	`state` varchar(100) NOT NULL,
	`state_description` text NOT NULL,
	`status` varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stp` (
	`id` int NOT NULL,
	`capacity_stp` text NOT NULL,
	`warranty_validity` date NOT NULL,
	`mfg_name` text NOT NULL,
	`address` text NOT NULL,
	`gst` text NOT NULL,
	`contact_person` varchar(30) NOT NULL,
	`mobile` varchar(20) NOT NULL,
	`email` text NOT NULL,
	`points_stp` int NOT NULL,
	`remarks_stp` varchar(30) NOT NULL,
	`flag_stp` text NOT NULL,
	`real_estate_id` int NOT NULL,
	`install_date` date NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stp_reading` (
	`id` int NOT NULL,
	`inlet` double NOT NULL,
	`outlet` double NOT NULL,
	`bod` double NOT NULL,
	`ph` double NOT NULL,
	`tss` double NOT NULL,
	`nitrogen` double NOT NULL,
	`cod` double NOT NULL,
	`feedal` double NOT NULL,
	`coliform` double NOT NULL,
	`reading_date` date NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `stp_reading_id_unique` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `temp_aqi_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`upddate` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`pollutants` varchar(100) NOT NULL,
	`concentration` float NOT NULL,
	`sub_index` float NOT NULL,
	`check_val` int NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `temp_aqi_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `temp_livability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`real_estate_id` int NOT NULL,
	`per_of_livability` int NOT NULL,
	CONSTRAINT `temp_livability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `temp_real_master` (
	`id` int NOT NULL,
	`date1` date NOT NULL,
	`time1` time NOT NULL,
	`real_estate_name` varchar(200) NOT NULL,
	`profile_photo` varchar(255) NOT NULL,
	`industry_type` int NOT NULL,
	`industry_classification` int NOT NULL,
	`categories_industry` int NOT NULL,
	`registration_no` varchar(100) NOT NULL,
	`scale` varchar(100) NOT NULL,
	`date_off_comm` date NOT NULL,
	`power_supply` varchar(100) NOT NULL,
	`no_of_staff` int NOT NULL,
	`trade_license` varchar(100) NOT NULL,
	`trade_license_iss_by` varchar(100) NOT NULL,
	`iss_date` date NOT NULL,
	`valid_upto` date NOT NULL,
	`gstin_detail` varchar(100) NOT NULL,
	`gst_doc` text NOT NULL,
	`addr_factory` text NOT NULL,
	`phone` bigint NOT NULL,
	`com_email_id` varchar(100) NOT NULL,
	`land_no` varchar(255) NOT NULL,
	`state` varchar(50) NOT NULL,
	`district` varchar(50) NOT NULL,
	`city` varchar(50) NOT NULL,
	`pin_code` int NOT NULL,
	`post_office` varchar(100) NOT NULL,
	`police_station` varchar(100) NOT NULL,
	`local_body` varchar(100) NOT NULL,
	`word_no` varchar(100) NOT NULL,
	`jl_no` varchar(100) NOT NULL,
	`plot_no` varchar(100) NOT NULL,
	`dag_no` varchar(100) NOT NULL,
	`developer_name` varchar(50) NOT NULL,
	`addr_off` varchar(100) NOT NULL,
	`addr_real` text NOT NULL,
	`telephone` bigint NOT NULL,
	`fax_no` varchar(100) NOT NULL,
	`email` varchar(100) NOT NULL,
	`website` text NOT NULL,
	`pcb_office` varchar(100) NOT NULL,
	`address_of_resident` varchar(100) NOT NULL,
	`area_residential` float NOT NULL,
	`block` int NOT NULL,
	`block_type` varchar(30) NOT NULL,
	`block1` int NOT NULL,
	`block_type1` varchar(20) NOT NULL,
	`project_area` text NOT NULL,
	`dwelling_unit` int NOT NULL,
	`Date_of_Ec` date NOT NULL,
	`Nodal_Person` varchar(50) NOT NULL,
	`Date_of_Installation_AQMS` date NOT NULL,
	`Date_of_Installation_WQMS` date NOT NULL,
	`Date_of_Installation_ANMS` date NOT NULL,
	`Date_of_Installation_Noise` date NOT NULL,
	`Date_of_Auto_Composter` date NOT NULL,
	`approval` int NOT NULL,
	`approve_by` varchar(100) NOT NULL,
	`approve_date_time` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`latitude` varchar(200) NOT NULL,
	`exp_population` text NOT NULL,
	`total_water` text NOT NULL,
	`fresh_water` text NOT NULL,
	`waste_water` text NOT NULL,
	`treated_water_recycled` text NOT NULL,
	`treated_water_discharged` text NOT NULL,
	`solid` text NOT NULL,
	`no_of_story` text NOT NULL,
	`ground` text NOT NULL,
	`paved_area` text NOT NULL,
	`green_area` text NOT NULL,
	`exclusive` text NOT NULL,
	`no_of_plantation` text NOT NULL,
	`services` text NOT NULL,
	`no_of_parking` text NOT NULL,
	`total_power` text NOT NULL,
	`back_up` text NOT NULL,
	`solar_street` text NOT NULL,
	`solar_details` text NOT NULL,
	`no_of_flats` int NOT NULL,
	`no_of_bunglows` int NOT NULL,
	`no_of_commercials` int NOT NULL,
	`status` varchar(20) NOT NULL,
	CONSTRAINT `temp_real_master_real_estate_name_unique` UNIQUE(`real_estate_name`)
);
--> statement-breakpoint
CREATE TABLE `trees` (
	`id` int NOT NULL,
	`bot_name` text NOT NULL,
	`com_name` text NOT NULL,
	`quantity` int NOT NULL,
	`real_estate_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_access` (
	`id` int NOT NULL,
	`menu` varchar(50) NOT NULL,
	`submenu` varchar(50) NOT NULL,
	`full_control` int NOT NULL,
	`entry_only` int NOT NULL,
	`read_only` int NOT NULL,
	`update_delete` int NOT NULL,
	`except_delete` int NOT NULL,
	`no_control` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_master` (
	`id` int NOT NULL,
	`user_name` varchar(30) NOT NULL,
	`user_id` varchar(30) NOT NULL,
	`password` varchar(30) NOT NULL,
	`user_type` varchar(20) NOT NULL,
	`status` int NOT NULL,
	`createdon` date NOT NULL,
	`updatedon` date NOT NULL,
	`state_id` int NOT NULL,
	`phone` bigint NOT NULL,
	`website` varchar(250) NOT NULL,
	`email` varchar(250) NOT NULL,
	CONSTRAINT `user_master_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `waste_collection` (
	`id` int NOT NULL,
	`waste_gen` double NOT NULL,
	`waste_treat` double NOT NULL,
	`waste_date_collec` date NOT NULL,
	`ulb` int NOT NULL,
	`real_estate_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `waste_details` (
	`id` int NOT NULL,
	`waste_name` text NOT NULL,
	`waste_date` date NOT NULL,
	`real_estate_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `waste_related` (
	`id` int NOT NULL,
	`door` text NOT NULL,
	`auto` text NOT NULL,
	`segregation` text NOT NULL,
	`points_waste` int NOT NULL,
	`points_segregation` int NOT NULL,
	`remarks_waste` varchar(30) NOT NULL,
	`remarks_segre` varchar(30) NOT NULL,
	`flag_waste` text NOT NULL,
	`real_estate_id` int NOT NULL,
	`install_date` date NOT NULL
);
--> statement-breakpoint
CREATE TABLE `water_consumption_list` (
	`id` int NOT NULL,
	`water_consumption_quantity` int NOT NULL,
	`UOM_waterconsumption` varchar(20) NOT NULL,
	`discharge_quantity` int NOT NULL,
	`UOM_discharge` varchar(20) NOT NULL,
	`treatment_quantity` int NOT NULL,
	`UOM_treatment` varchar(20) NOT NULL,
	`air_date` date NOT NULL,
	`industry_ms` varchar(40) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `water_polution_list` (
	`id` int NOT NULL,
	`water_polution` varchar(50) NOT NULL,
	`inlet` varchar(10) NOT NULL,
	`outlet` varchar(10) NOT NULL,
	`sample_date` date NOT NULL,
	`report_date` date NOT NULL,
	`reading_time` varchar(20) NOT NULL,
	`laboratory` varchar(50) NOT NULL,
	`air_date` date NOT NULL,
	`industry_ms` varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `water_quality` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tss` varchar(30) NOT NULL,
	`tds` varchar(30) NOT NULL,
	`temp` varchar(30) NOT NULL,
	`ph` bigint NOT NULL,
	`bod` varchar(50) NOT NULL,
	`cod` varchar(50) NOT NULL,
	`reading_date` date NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `water_quality_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `water_sensor` (
	`id` bigint NOT NULL,
	`device` text NOT NULL,
	`timestamp` datetime NOT NULL,
	`waterdepth` text NOT NULL,
	`real_estate_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `water_sensor_all` (
	`id` bigint NOT NULL,
	`device` text NOT NULL,
	`timestamp` datetime NOT NULL,
	`waterdepth` text NOT NULL,
	`real_estate_id` int NOT NULL,
	CONSTRAINT `water_sensor_all_id` PRIMARY KEY(`id`)
);
