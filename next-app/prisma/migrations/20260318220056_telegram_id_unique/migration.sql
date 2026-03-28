/*
  Warnings:

  - A unique constraint covering the columns `[telegramId]` on the table `TelegramSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TelegramSession_telegramId_key" ON "TelegramSession"("telegramId");
