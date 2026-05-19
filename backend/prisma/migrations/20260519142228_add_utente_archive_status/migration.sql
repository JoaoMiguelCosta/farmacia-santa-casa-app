-- CreateEnum
CREATE TYPE "UtenteStatus" AS ENUM ('ATIVO', 'ARQUIVADO', 'FALECIDO');

-- AlterTable
ALTER TABLE "Utente" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "archivedById" TEXT,
ADD COLUMN     "archivedReason" TEXT,
ADD COLUMN     "status" "UtenteStatus" NOT NULL DEFAULT 'ATIVO';

-- CreateIndex
CREATE INDEX "Utente_status_idx" ON "Utente"("status");

-- CreateIndex
CREATE INDEX "Utente_archivedAt_idx" ON "Utente"("archivedAt");

-- CreateIndex
CREATE INDEX "Utente_archivedById_idx" ON "Utente"("archivedById");

-- AddForeignKey
ALTER TABLE "Utente" ADD CONSTRAINT "Utente_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
