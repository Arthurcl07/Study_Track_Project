-- CreateEnum
CREATE TYPE "StatusPlano" AS ENUM ('Ativo', 'Encerrado');

-- CreateTable
CREATE TABLE "PlanoRecuperacao" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "status" "StatusPlano" NOT NULL DEFAULT 'Ativo',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerradoEm" TIMESTAMP(3),

    CONSTRAINT "PlanoRecuperacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPlano" (
    "id" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "concluidoEm" TIMESTAMP(3),

    CONSTRAINT "ItemPlano_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanoRecuperacao_turmaId_idx" ON "PlanoRecuperacao"("turmaId");

-- CreateIndex
CREATE INDEX "PlanoRecuperacao_estudanteId_idx" ON "PlanoRecuperacao"("estudanteId");

-- CreateIndex
CREATE INDEX "ItemPlano_planoId_idx" ON "ItemPlano"("planoId");

-- AddForeignKey
ALTER TABLE "PlanoRecuperacao" ADD CONSTRAINT "PlanoRecuperacao_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoRecuperacao" ADD CONSTRAINT "PlanoRecuperacao_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoRecuperacao" ADD CONSTRAINT "PlanoRecuperacao_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPlano" ADD CONSTRAINT "ItemPlano_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "PlanoRecuperacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- INV-008-05: no máximo 1 plano Ativo por estudante e turma (índice único parcial).
CREATE UNIQUE INDEX "PlanoRecuperacao_um_ativo_por_estudante_turma" ON "PlanoRecuperacao"("estudanteId", "turmaId") WHERE "status" = 'Ativo';
