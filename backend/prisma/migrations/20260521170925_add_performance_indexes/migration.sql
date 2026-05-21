-- CreateIndex
CREATE INDEX "Dispensa_createdAt_idx" ON "Dispensa"("createdAt");

-- CreateIndex
CREATE INDEX "Dispensa_receitaLinhaId_createdAt_idx" ON "Dispensa"("receitaLinhaId", "createdAt");

-- CreateIndex
CREATE INDEX "Dispensa_pedidoItemId_createdAt_idx" ON "Dispensa"("pedidoItemId", "createdAt");

-- CreateIndex
CREATE INDEX "Extra_utenteId_status_idx" ON "Extra"("utenteId", "status");

-- CreateIndex
CREATE INDEX "Extra_status_createdAt_idx" ON "Extra"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Extra_medicamentoId_status_idx" ON "Extra"("medicamentoId", "status");

-- CreateIndex
CREATE INDEX "Extra_medicamentoNorm_status_idx" ON "Extra"("medicamentoNorm", "status");

-- CreateIndex
CREATE INDEX "Medicamento_tipo_idx" ON "Medicamento"("tipo");

-- CreateIndex
CREATE INDEX "Pedido_updatedAt_idx" ON "Pedido"("updatedAt");

-- CreateIndex
CREATE INDEX "Pedido_status_createdAt_idx" ON "Pedido"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Pedido_status_updatedAt_idx" ON "Pedido"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Pedido_status_validatedAt_idx" ON "Pedido"("status", "validatedAt");

-- CreateIndex
CREATE INDEX "Pedido_status_rejectedAt_idx" ON "Pedido"("status", "rejectedAt");

-- CreateIndex
CREATE INDEX "PedidoItem_pedidoId_status_idx" ON "PedidoItem"("pedidoId", "status");

-- CreateIndex
CREATE INDEX "PedidoItem_utenteId_status_idx" ON "PedidoItem"("utenteId", "status");

-- CreateIndex
CREATE INDEX "PedidoItem_status_receitaLinhaId_idx" ON "PedidoItem"("status", "receitaLinhaId");

-- CreateIndex
CREATE INDEX "PedidoItem_status_semReceitaId_idx" ON "PedidoItem"("status", "semReceitaId");

-- CreateIndex
CREATE INDEX "PedidoItem_status_extraId_idx" ON "PedidoItem"("status", "extraId");

-- CreateIndex
CREATE INDEX "PedidoItem_receitaLinhaId_status_idx" ON "PedidoItem"("receitaLinhaId", "status");

-- CreateIndex
CREATE INDEX "PedidoItem_extraId_status_idx" ON "PedidoItem"("extraId", "status");

-- CreateIndex
CREATE INDEX "Receita_utenteId_createdAt_idx" ON "Receita"("utenteId", "createdAt");

-- CreateIndex
CREATE INDEX "ReceitaLinha_status_validade_idx" ON "ReceitaLinha"("status", "validade");

-- CreateIndex
CREATE INDEX "ReceitaLinha_receitaId_status_validade_idx" ON "ReceitaLinha"("receitaId", "status", "validade");

-- CreateIndex
CREATE INDEX "ReceitaLinha_medicamentoId_status_validade_idx" ON "ReceitaLinha"("medicamentoId", "status", "validade");

-- CreateIndex
CREATE INDEX "RegularizacaoEvento_createdAt_idx" ON "RegularizacaoEvento"("createdAt");

-- CreateIndex
CREATE INDEX "RegularizacaoEvento_regularizacaoId_createdAt_idx" ON "RegularizacaoEvento"("regularizacaoId", "createdAt");

-- CreateIndex
CREATE INDEX "RegularizacaoEvento_receitaLinhaId_createdAt_idx" ON "RegularizacaoEvento"("receitaLinhaId", "createdAt");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_medicamentoId_idx" ON "RegularizacaoExtra"("medicamentoId");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_createdAt_idx" ON "RegularizacaoExtra"("createdAt");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_updatedAt_idx" ON "RegularizacaoExtra"("updatedAt");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_status_createdAt_idx" ON "RegularizacaoExtra"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_status_updatedAt_idx" ON "RegularizacaoExtra"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_status_utenteId_idx" ON "RegularizacaoExtra"("status", "utenteId");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_status_pedidoNumero_idx" ON "RegularizacaoExtra"("status", "pedidoNumero");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_status_medicamentoNorm_idx" ON "RegularizacaoExtra"("status", "medicamentoNorm");

-- CreateIndex
CREATE INDEX "RegularizacaoExtra_utenteId_status_updatedAt_idx" ON "RegularizacaoExtra"("utenteId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "SemReceita_utenteId_createdAt_idx" ON "SemReceita"("utenteId", "createdAt");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE INDEX "Utente_status_nome_idx" ON "Utente"("status", "nome");

-- CreateIndex
CREATE INDEX "Utente_deletedAt_status_nome_idx" ON "Utente"("deletedAt", "status", "nome");

-- CreateIndex
CREATE INDEX "Utente_deletedAt_status_numero9_idx" ON "Utente"("deletedAt", "status", "numero9");
