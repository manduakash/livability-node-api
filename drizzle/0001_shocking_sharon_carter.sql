ALTER TABLE `stp_reading` DROP INDEX `stp_reading_id_unique`;--> statement-breakpoint
ALTER TABLE `stp_reading` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `stp_reading` ADD PRIMARY KEY(`id`);