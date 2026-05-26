-- Reemplaza la columna `address` del cliente por campos estructurados
-- y promueve email/phone a UNIQUE.

-- DropIndex
DROP INDEX `clients_email_idx` ON `clients`;

-- DropIndex
DROP INDEX `clients_phone_idx` ON `clients`;

-- AlterTable
ALTER TABLE `clients` DROP COLUMN `address`,
    ADD COLUMN `address_notes` TEXT NULL,
    ADD COLUMN `country` VARCHAR(60) NULL DEFAULT 'México',
    ADD COLUMN `ext_number` VARCHAR(20) NULL,
    ADD COLUMN `int_number` VARCHAR(20) NULL,
    ADD COLUMN `neighborhood` VARCHAR(120) NULL,
    ADD COLUMN `postal_code` VARCHAR(10) NULL,
    ADD COLUMN `state` VARCHAR(80) NULL,
    ADD COLUMN `street` VARCHAR(160) NULL,
    MODIFY `city` VARCHAR(80) NULL;

-- AlterTable
ALTER TABLE `furniture_types` MODIFY `attributes_schema` JSON NOT NULL;

-- AlterTable
ALTER TABLE `quote_items` MODIFY `specs` JSON NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `clients_email_key` ON `clients`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `clients_phone_key` ON `clients`(`phone`);
