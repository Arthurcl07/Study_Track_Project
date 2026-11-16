-- SPEC-045 a SPEC-059 (Níveis 5 e 6): aceite dos termos, tentativas de login, registro de erros, regras configuráveis,
-- histórico do sistema anterior, tour visto e notificação de evasão.
-- AlterEnum
ALTER TYPE "TipoNotificacao" ADD VALUE 'Evasao';

-- AlterTable
ALTER TABLE "Instituicao" ADD COLUMN     "encarregadoEmail" TEXT,
ADD COLUMN     "encarregadoNome" TEXT,
ADD COLUMN     "frequenciaMinima" DOUBLE PRECISION NOT NULL DEFAULT 75,
ADD COLUMN     "limiteRisco" DOUBLE PRECISION NOT NULL DEFAULT 5,
ADD COLUMN     "mediaMinima" DOUBLE PRECISION NOT NULL DEFAULT 6,
ADD COLUMN     "notaExame" DOUBLE PRECISION NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "PeriodoLetivo" ADD COLUMN     "regraFrequenciaMinima" DOUBLE PRECISION,
ADD COLUMN     "regraLimiteRisco" DOUBLE PRECISION,
ADD COLUMN     "regraMediaMinima" DOUBLE PRECISION,
ADD COLUMN     "regraNotaExame" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "tourVistoEm" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AceiteTermos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "aceitoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AceiteTermos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TentativaLogin" (
    "email" TEXT NOT NULL,
    "erradas" INTEGER NOT NULL DEFAULT 0,
    "bloqueadoAte" TIMESTAMP(3),
    "atualizadaEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TentativaLogin_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "RegistroErro" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rota" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "perfil" TEXT,
    "mensagem" TEXT NOT NULL,

    CONSTRAINT "RegistroErro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoAnterior" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "media" DOUBLE PRECISION NOT NULL,
    "frequencia" DOUBLE PRECISION NOT NULL,
    "importadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoAnterior_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AceiteTermos_usuarioId_versao_key" ON "AceiteTermos"("usuarioId", "versao");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroErro_codigo_key" ON "RegistroErro"("codigo");

-- CreateIndex
CREATE INDEX "RegistroErro_registradoEm_idx" ON "RegistroErro"("registradoEm");

-- CreateIndex
CREATE INDEX "HistoricoAnterior_estudanteId_idx" ON "HistoricoAnterior"("estudanteId");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricoAnterior_estudanteId_disciplinaId_periodo_key" ON "HistoricoAnterior"("estudanteId", "disciplinaId", "periodo");

-- AddForeignKey
ALTER TABLE "AceiteTermos" ADD CONSTRAINT "AceiteTermos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoAnterior" ADD CONSTRAINT "HistoricoAnterior_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoAnterior" ADD CONSTRAINT "HistoricoAnterior_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- SPEC-052 / RB-47: faixas das regras e limite de Risco menor que a média mínima (INV-052-03).
ALTER TABLE "Instituicao" ADD CONSTRAINT "Instituicao_regras_check" CHECK (
  "mediaMinima" BETWEEN 5 AND 8 AND "limiteRisco" >= 0 AND "limiteRisco" < "mediaMinima"
  AND "frequenciaMinima" BETWEEN 50 AND 90 AND "notaExame" BETWEEN 4 AND 7
);

-- SPEC-052 / INV-052-02: período já encerrado guarda a regra padrão com que foi encerrado.
UPDATE "PeriodoLetivo" SET "regraMediaMinima" = 6, "regraLimiteRisco" = 5, "regraFrequenciaMinima" = 75, "regraNotaExame" = 5
WHERE "status" = 'Encerrado';

-- SPEC-058 / RB-49: média e frequência do histórico anterior nas faixas.
ALTER TABLE "HistoricoAnterior" ADD CONSTRAINT "HistoricoAnterior_faixas_check" CHECK (
  "media" BETWEEN 0 AND 10 AND "frequencia" BETWEEN 0 AND 100
);
