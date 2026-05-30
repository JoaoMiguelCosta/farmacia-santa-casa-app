-- CreateEnum
CREATE TYPE "AlertaOperacionalTipo" AS ENUM ('PEDIDO_ENVIADO', 'REGULARIZACAO_PARCIAL', 'REGULARIZACAO_TOTAL');

-- CreateEnum
CREATE TYPE "AlertaOperacionalDestino" AS ENUM ('FARMACIA');

-- CreateTable
CREATE TABLE "AlertaOperacional" (
    "id" TEXT NOT NULL,
    "tipo" "AlertaOperacionalTipo" NOT NULL,
    "destino" "AlertaOperacionalDestino" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "pedidoId" TEXT,
    "regularizacaoId" TEXT,
    "utenteId" TEXT,
    "metadata" JSONB,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertaOperacional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertaOperacionalDismissal" (
    "id" TEXT NOT NULL,
    "alertaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertaOperacionalDismissal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertaOperacional_idempotencyKey_key" ON "AlertaOperacional"("idempotencyKey");

-- CreateIndex
CREATE INDEX "AlertaOperacional_destino_createdAt_idx" ON "AlertaOperacional"("destino", "createdAt");

-- CreateIndex
CREATE INDEX "AlertaOperacional_tipo_createdAt_idx" ON "AlertaOperacional"("tipo", "createdAt");

-- CreateIndex
CREATE INDEX "AlertaOperacional_pedidoId_idx" ON "AlertaOperacional"("pedidoId");

-- CreateIndex
CREATE INDEX "AlertaOperacional_regularizacaoId_idx" ON "AlertaOperacional"("regularizacaoId");

-- CreateIndex
CREATE INDEX "AlertaOperacional_utenteId_idx" ON "AlertaOperacional"("utenteId");

-- CreateIndex
CREATE INDEX "AlertaOperacionalDismissal_userId_dismissedAt_idx" ON "AlertaOperacionalDismissal"("userId", "dismissedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlertaOperacionalDismissal_alertaId_userId_key" ON "AlertaOperacionalDismissal"("alertaId", "userId");

-- AddForeignKey
ALTER TABLE "AlertaOperacionalDismissal" ADD CONSTRAINT "AlertaOperacionalDismissal_alertaId_fkey" FOREIGN KEY ("alertaId") REFERENCES "AlertaOperacional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertaOperacionalDismissal" ADD CONSTRAINT "AlertaOperacionalDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
