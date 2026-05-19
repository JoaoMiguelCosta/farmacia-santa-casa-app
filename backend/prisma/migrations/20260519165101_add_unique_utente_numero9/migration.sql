/*
  Warnings:

  - A unique constraint covering the columns `[numero9]` on the table `Utente` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Utente_numero9_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Utente_numero9_key" ON "Utente"("numero9");
