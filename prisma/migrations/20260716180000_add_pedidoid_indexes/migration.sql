-- CreateIndex
CREATE INDEX "Ponto_pedidoId_idx" ON "Ponto"("pedidoId");

-- CreateIndex
CREATE INDEX "HistoricoPedido_pedidoId_idx" ON "HistoricoPedido"("pedidoId");

-- CreateIndex
CREATE INDEX "LinkPonto_pedidoId_idx" ON "LinkPonto"("pedidoId");
