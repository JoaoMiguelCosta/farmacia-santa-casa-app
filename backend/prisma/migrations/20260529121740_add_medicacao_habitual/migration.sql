-- CreateTable
CREATE TABLE "MedicacaoHabitual" (
    "id" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "medicamento" TEXT NOT NULL,
    "medicamentoNorm" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicacaoHabitual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicacaoHabitual_utenteId_idx" ON "MedicacaoHabitual"("utenteId");

-- CreateIndex
CREATE INDEX "MedicacaoHabitual_medicamentoNorm_idx" ON "MedicacaoHabitual"("medicamentoNorm");

-- CreateIndex
CREATE INDEX "MedicacaoHabitual_utenteId_createdAt_idx" ON "MedicacaoHabitual"("utenteId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MedicacaoHabitual_utenteId_medicamentoNorm_key" ON "MedicacaoHabitual"("utenteId", "medicamentoNorm");

-- AddForeignKey
ALTER TABLE "MedicacaoHabitual" ADD CONSTRAINT "MedicacaoHabitual_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
