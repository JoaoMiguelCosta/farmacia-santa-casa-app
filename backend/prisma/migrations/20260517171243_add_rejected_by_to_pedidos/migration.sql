-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "rejectedById" TEXT;

-- AlterTable
ALTER TABLE "PedidoItem" ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedById" TEXT;

-- CreateIndex
CREATE INDEX "Pedido_rejectedById_idx" ON "Pedido"("rejectedById");

-- CreateIndex
CREATE INDEX "PedidoItem_rejectedById_idx" ON "PedidoItem"("rejectedById");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
