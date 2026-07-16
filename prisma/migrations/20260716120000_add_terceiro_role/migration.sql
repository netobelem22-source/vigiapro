-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TERCEIRO';

-- CreateTable
CREATE TABLE "UnidadeParceiro" (
    "id" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,

    CONSTRAINT "UnidadeParceiro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UnidadeParceiro_unidadeId_idx" ON "UnidadeParceiro"("unidadeId");

-- CreateIndex
CREATE UNIQUE INDEX "UnidadeParceiro_usuarioId_unidadeId_key" ON "UnidadeParceiro"("usuarioId", "unidadeId");

-- AddForeignKey
ALTER TABLE "UnidadeParceiro" ADD CONSTRAINT "UnidadeParceiro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnidadeParceiro" ADD CONSTRAINT "UnidadeParceiro_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "Unidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
