-- AlterTable
ALTER TABLE "Unidade" ADD COLUMN     "cnpj" TEXT;

-- CreateTable
CREATE TABLE "HistoricoPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "detalhe" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoPedido_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistoricoPedido" ADD CONSTRAINT "HistoricoPedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoPedido" ADD CONSTRAINT "HistoricoPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
