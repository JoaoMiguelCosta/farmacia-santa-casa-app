-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('PENDENTE', 'VALIDADO', 'REJEITADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PedidoItemStatus" AS ENUM ('PENDENTE', 'VALIDADO', 'REJEITADO', 'CANCELADO_POR_EXPIRACAO');

-- CreateEnum
CREATE TYPE "PedidoItemTipo" AS ENUM ('COM_RECEITA', 'SEM_RECEITA', 'EXTRA');

-- CreateEnum
CREATE TYPE "LinhaReceitaStatus" AS ENUM ('ATIVA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "ExtraStatus" AS ENUM ('PENDENTE', 'PARCIALMENTE_REGULARIZADO', 'REGULARIZADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "RegularizacaoStatus" AS ENUM ('PENDENTE', 'PARCIALMENTE_REGULARIZADO', 'REGULARIZADO');

-- CreateEnum
CREATE TYPE "MedicamentoTipo" AS ENUM ('COM_RECEITA', 'SEM_RECEITA');

-- CreateTable
CREATE TABLE "Utente" (
    "id" TEXT NOT NULL,
    "numero9" CHAR(9) NOT NULL,
    "nome" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "invalidReason" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicamento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "MedicamentoTipo" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receita" (
    "id" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "numero19" CHAR(19) NOT NULL,
    "pinAcesso6" CHAR(6) NOT NULL,
    "pinOpcao4" CHAR(4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceitaLinha" (
    "id" TEXT NOT NULL,
    "receitaId" TEXT NOT NULL,
    "medicamentoId" TEXT,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "quantidadeDispensada" INTEGER NOT NULL DEFAULT 0,
    "validade" TIMESTAMP(3) NOT NULL,
    "status" "LinhaReceitaStatus" NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceitaLinha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SemReceita" (
    "id" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "medicamento" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SemReceita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extra" (
    "id" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "medicamentoId" TEXT,
    "medicamento" TEXT NOT NULL,
    "medicamentoNorm" TEXT,
    "quantidadeSolicitada" INTEGER NOT NULL,
    "quantidadeRegularizada" INTEGER NOT NULL DEFAULT 0,
    "status" "ExtraStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Extra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "status" "PedidoStatus" NOT NULL DEFAULT 'PENDENTE',
    "validatedAt" TIMESTAMP(3),
    "validatedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "closedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoItem" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "tipo" "PedidoItemTipo" NOT NULL,
    "status" "PedidoItemStatus" NOT NULL DEFAULT 'PENDENTE',
    "medicamento" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "receitaLinhaId" TEXT,
    "semReceitaId" TEXT,
    "extraId" TEXT,
    "validatedAt" TIMESTAMP(3),
    "validatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedidoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispensa" (
    "id" TEXT NOT NULL,
    "receitaLinhaId" TEXT NOT NULL,
    "pedidoItemId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dispensa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegularizacaoExtra" (
    "id" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "extraId" TEXT,
    "pedidoId" TEXT,
    "pedidoNumero" INTEGER,
    "medicamentoId" TEXT,
    "medicamento" TEXT NOT NULL,
    "medicamentoNorm" TEXT,
    "quantidadeSolicitada" INTEGER NOT NULL,
    "quantidadeRegularizada" INTEGER NOT NULL DEFAULT 0,
    "status" "RegularizacaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegularizacaoExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegularizacaoEvento" (
    "id" TEXT NOT NULL,
    "regularizacaoId" TEXT NOT NULL,
    "receitaLinhaId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegularizacaoEvento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Utente_numero9_idx" ON "Utente"("numero9");

-- CreateIndex
CREATE INDEX "Utente_nome_idx" ON "Utente"("nome");

-- CreateIndex
CREATE INDEX "Utente_deletedAt_idx" ON "Utente"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Medicamento_nome_key" ON "Medicamento"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Receita_numero19_key" ON "Receita"("numero19");

-- CreateIndex
CREATE INDEX "Receita_utenteId_idx" ON "Receita"("utenteId");

-- CreateIndex
CREATE INDEX "ReceitaLinha_receitaId_idx" ON "ReceitaLinha"("receitaId");

-- CreateIndex
CREATE INDEX "ReceitaLinha_medicamentoId_idx" ON "ReceitaLinha"("medicamentoId");

-- CreateIndex
CREATE INDEX "ReceitaLinha_validade_idx" ON "ReceitaLinha"("validade");

-- CreateIndex
CREATE INDEX "ReceitaLinha_status_idx" ON "ReceitaLinha"("status");

-- CreateIndex
CREATE INDEX "SemReceita_utenteId_idx" ON "SemReceita"("utenteId");

-- CreateIndex
CREATE INDEX "SemReceita_createdAt_idx" ON "SemReceita"("createdAt");

-- CreateIndex
CREATE INDEX "Extra_utenteId_idx" ON "Extra"("utenteId");

-- CreateIndex
CREATE INDEX "Extra_medicamentoId_idx" ON "Extra"("medicamentoId");

-- CreateIndex
CREATE INDEX "Extra_medicamentoNorm_idx" ON "Extra"("medicamentoNorm");

-- CreateIndex
CREATE INDEX "Extra_status_idx" ON "Extra"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");

-- CreateIndex
CREATE INDEX "Pedido_status_idx" ON "Pedido"("status");

-- CreateIndex
CREATE INDEX "Pedido_createdAt_idx" ON "Pedido"("createdAt");

-- CreateIndex
CREATE INDEX "Pedido_validatedAt_idx" ON "Pedido"("validatedAt");

-- CreateIndex
CREATE INDEX "Pedido_rejectedAt_idx" ON "Pedido"("rejectedAt");

-- CreateIndex
CREATE INDEX "PedidoItem_pedidoId_idx" ON "PedidoItem"("pedidoId");

-- CreateIndex
CREATE INDEX "PedidoItem_utenteId_idx" ON "PedidoItem"("utenteId");

-- CreateIndex
CREATE INDEX "PedidoItem_tipo_idx" ON "PedidoItem"("tipo");

-- CreateIndex
CREATE INDEX "PedidoItem_status_idx" ON "PedidoItem"("status");

-- CreateIndex
CREATE INDEX "PedidoItem_receitaLinhaId_idx" ON "PedidoItem"("receitaLinhaId");

-- CreateIndex
CREATE INDEX "PedidoItem_semReceitaId_idx" ON "PedidoItem"("semReceitaId");

-- CreateIndex
CREATE INDEX "PedidoItem_extraId_idx" ON "PedidoItem"("extraId");

-- CreateIndex
CREATE INDEX "Dispensa_receitaLinhaId_idx" ON "Dispensa"("receitaLinhaId");

-- CreateIndex
CREATE INDEX "Dispensa_pedidoItemId_idx" ON "Dispensa"("pedidoItemId");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_utenteId_idx" ON "RegularizacaoExtra"("utenteId");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_extraId_idx" ON "RegularizacaoExtra"("extraId");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_pedidoId_idx" ON "RegularizacaoExtra"("pedidoId");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_pedidoNumero_idx" ON "RegularizacaoExtra"("pedidoNumero");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_medicamentoNorm_idx" ON "RegularizacaoExtra"("medicamentoNorm");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_status_idx" ON "RegularizacaoExtra"("status");

-- CreateIndex
CREATE INDEX "RegularizacaoEvento_regularizacaoId_idx" ON "RegularizacaoEvento"("regularizacaoId");

-- CreateIndex
CREATE INDEX "RegularizacaoEvento_receitaLinhaId_idx" ON "RegularizacaoEvento"("receitaLinhaId");

-- AddForeignKey
ALTER TABLE "Receita" ADD CONSTRAINT "Receita_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceitaLinha" ADD CONSTRAINT "ReceitaLinha_receitaId_fkey" FOREIGN KEY ("receitaId") REFERENCES "Receita"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceitaLinha" ADD CONSTRAINT "ReceitaLinha_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SemReceita" ADD CONSTRAINT "SemReceita_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extra" ADD CONSTRAINT "Extra_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Extra" ADD CONSTRAINT "Extra_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_receitaLinhaId_fkey" FOREIGN KEY ("receitaLinhaId") REFERENCES "ReceitaLinha"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_semReceitaId_fkey" FOREIGN KEY ("semReceitaId") REFERENCES "SemReceita"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "Extra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispensa" ADD CONSTRAINT "Dispensa_receitaLinhaId_fkey" FOREIGN KEY ("receitaLinhaId") REFERENCES "ReceitaLinha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispensa" ADD CONSTRAINT "Dispensa_pedidoItemId_fkey" FOREIGN KEY ("pedidoItemId") REFERENCES "PedidoItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularizacaoExtra" ADD CONSTRAINT "RegularizacaoExtra_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "Utente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularizacaoExtra" ADD CONSTRAINT "RegularizacaoExtra_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "Extra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularizacaoExtra" ADD CONSTRAINT "RegularizacaoExtra_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularizacaoExtra" ADD CONSTRAINT "RegularizacaoExtra_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularizacaoEvento" ADD CONSTRAINT "RegularizacaoEvento_regularizacaoId_fkey" FOREIGN KEY ("regularizacaoId") REFERENCES "RegularizacaoExtra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularizacaoEvento" ADD CONSTRAINT "RegularizacaoEvento_receitaLinhaId_fkey" FOREIGN KEY ("receitaLinhaId") REFERENCES "ReceitaLinha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
