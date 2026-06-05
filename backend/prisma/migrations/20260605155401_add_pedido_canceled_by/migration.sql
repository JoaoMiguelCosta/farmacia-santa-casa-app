-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "canceledById" TEXT;

-- CreateIndex
CREATE INDEX "Pedido_canceledById_idx" ON "Pedido"("canceledById");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
