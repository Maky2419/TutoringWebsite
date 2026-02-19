-- AlterTable
ALTER TABLE `Booking` MODIFY `preferredTimes` TEXT NOT NULL,
    MODIFY `message` TEXT NULL;

-- AlterTable
ALTER TABLE `Review` MODIFY `comment` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Tutor` MODIFY `bio` TEXT NOT NULL,
    MODIFY `education` TEXT NULL;
