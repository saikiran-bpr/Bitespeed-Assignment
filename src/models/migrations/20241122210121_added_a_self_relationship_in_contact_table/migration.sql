-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_linkedId_fkey` FOREIGN KEY (`linkedId`) REFERENCES `Contact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
