-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL,
    "valorDiaria" DOUBLE PRECISION NOT NULL DEFAULT 180,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);
