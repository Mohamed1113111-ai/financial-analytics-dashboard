CREATE TABLE `accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('asset','liability','equity','revenue','expense') NOT NULL,
	`category` varchar(100),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `accounts_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `apAging` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`vendorId` int NOT NULL,
	`periodId` int NOT NULL,
	`amount0_30` decimal(15,2) NOT NULL DEFAULT '0',
	`amount31_60` decimal(15,2) NOT NULL DEFAULT '0',
	`amount61_90` decimal(15,2) NOT NULL DEFAULT '0',
	`amount90_plus` decimal(15,2) NOT NULL DEFAULT '0',
	`totalAP` decimal(15,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apAging_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `arAging` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`customerId` int NOT NULL,
	`periodId` int NOT NULL,
	`amount0_30` decimal(15,2) NOT NULL DEFAULT '0',
	`amount31_60` decimal(15,2) NOT NULL DEFAULT '0',
	`amount61_90` decimal(15,2) NOT NULL DEFAULT '0',
	`amount90_plus` decimal(15,2) NOT NULL DEFAULT '0',
	`totalAR` decimal(15,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `arAging_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `arForecast` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`periodId` int NOT NULL,
	`scenario` enum('base','optimistic','conservative') NOT NULL,
	`forecastedCollection` decimal(15,2) NOT NULL,
	`collectionEffectiveness` decimal(5,2) NOT NULL,
	`dso` decimal(8,2) NOT NULL,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `arForecast_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`action` enum('create','update','delete') NOT NULL,
	`oldValues` json,
	`newValues` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`accountId` int NOT NULL,
	`periodId` int NOT NULL,
	`budgetedAmount` decimal(15,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashFlowStatement` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`periodId` int NOT NULL,
	`scenario` enum('base','optimistic','conservative') NOT NULL,
	`operatingCashFlow` decimal(15,2) NOT NULL,
	`investingCashFlow` decimal(15,2) NOT NULL,
	`financingCashFlow` decimal(15,2) NOT NULL,
	`netCashFlow` decimal(15,2) NOT NULL,
	`openingCash` decimal(15,2) NOT NULL,
	`closingCash` decimal(15,2) NOT NULL,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cashFlowStatement_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collectionAssumptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`agingBucket` varchar(20) NOT NULL,
	`baseCollectionRate` decimal(5,2) NOT NULL,
	`optimisticRate` decimal(5,2),
	`conservativeRate` decimal(5,2),
	`daysToCollect` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collectionAssumptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collectionHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`periodId` int NOT NULL,
	`amountCollected` decimal(15,2) NOT NULL,
	`collectionRate` decimal(5,2) NOT NULL,
	`daysToCollect` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collectionHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`creditLimit` decimal(15,2),
	`paymentTerms` int,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`reportType` varchar(50) NOT NULL,
	`periodId` int NOT NULL,
	`scenario` enum('base','optimistic','conservative') NOT NULL DEFAULT 'base',
	`dataJson` json NOT NULL,
	`exportUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forecastAssumptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`scenario` enum('base','optimistic','conservative') NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forecastAssumptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`periodId` int NOT NULL,
	`quantity` decimal(15,2) NOT NULL,
	`value` decimal(15,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`region` varchar(100),
	`country` varchar(100),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `locations_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `plStatement` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`periodId` int NOT NULL,
	`revenue` decimal(15,2) NOT NULL,
	`cogs` decimal(15,2) NOT NULL,
	`grossProfit` decimal(15,2) NOT NULL,
	`grossMargin` decimal(5,2) NOT NULL,
	`operatingExpenses` decimal(15,2) NOT NULL,
	`ebitda` decimal(15,2) NOT NULL,
	`ebitdaMargin` decimal(5,2) NOT NULL,
	`netProfit` decimal(15,2) NOT NULL,
	`netMargin` decimal(5,2) NOT NULL,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plStatement_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timePeriods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`periodDate` date NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`quarter` int NOT NULL,
	`periodName` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timePeriods_id` PRIMARY KEY(`id`),
	CONSTRAINT `timePeriods_periodDate_unique` UNIQUE(`periodDate`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`accountId` int NOT NULL,
	`periodId` int NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`type` enum('debit','credit') NOT NULL,
	`description` text,
	`referenceId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`paymentTerms` int,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workingCapitalMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`periodId` int NOT NULL,
	`dso` decimal(8,2) NOT NULL,
	`dpo` decimal(8,2) NOT NULL,
	`dio` decimal(8,2) NOT NULL,
	`ccc` decimal(8,2) NOT NULL,
	`currentRatio` decimal(8,2) NOT NULL,
	`quickRatio` decimal(8,2) NOT NULL,
	`netWorkingCapital` decimal(15,2) NOT NULL,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workingCapitalMetrics_id` PRIMARY KEY(`id`)
);
