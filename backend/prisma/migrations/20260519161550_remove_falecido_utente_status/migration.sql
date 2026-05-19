/*
  Warnings:

  - The values [FALECIDO] on the enum `UtenteStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UtenteStatus_new" AS ENUM ('ATIVO', 'ARQUIVADO');
ALTER TABLE "Utente" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Utente" ALTER COLUMN "status" TYPE "UtenteStatus_new" USING ("status"::text::"UtenteStatus_new");
ALTER TYPE "UtenteStatus" RENAME TO "UtenteStatus_old";
ALTER TYPE "UtenteStatus_new" RENAME TO "UtenteStatus";
DROP TYPE "UtenteStatus_old";
ALTER TABLE "Utente" ALTER COLUMN "status" SET DEFAULT 'ATIVO';
COMMIT;
