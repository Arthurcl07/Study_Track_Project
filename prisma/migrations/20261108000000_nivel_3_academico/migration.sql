-- CreateEnum
CREATE TYPE "StatusDiario" AS ENUM ('Aberto', 'Fechado', 'Homologado');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('InicioAulas', 'FimAulas', 'Feriado', 'Recesso', 'SemanaProvas', 'Outro');

-- CreateEnum
CREATE TYPE "TipoRequerimento" AS ENUM ('RevisaoProva', 'SegundaChamada', 'DeclaracaoMatricula', 'Trancamento', 'Outro');

-- CreateEnum
CREATE TYPE "DestinoRequerimento" AS ENUM ('Professor', 'Secretaria');

-- CreateEnum
CREATE TYPE "StatusRequerimento" AS ENUM ('Aberto', 'EmAnalise', 'Deferido', 'Indeferido');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TipoNotificacao" ADD VALUE 'Requerimento';
ALTER TYPE "TipoNotificacao" ADD VALUE 'Diario';

-- AlterTable
ALTER TABLE "Aula" ADD COLUMN     "conteudo" TEXT;

-- AlterTable
ALTER TABLE "CursoDisciplina" ADD COLUMN     "obrigatoria" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "semestre" INTEGER;

-- AlterTable
ALTER TABLE "PeriodoLetivo" ADD COLUMN     "rematriculaFim" DATE,
ADD COLUMN     "rematriculaInicio" DATE;

-- AlterTable
ALTER TABLE "Turma" ADD COLUMN     "diario" "StatusDiario" NOT NULL DEFAULT 'Aberto',
ADD COLUMN     "diarioFechadoEm" TIMESTAMP(3),
ADD COLUMN     "diarioHomologadoEm" TIMESTAMP(3),
ADD COLUMN     "diarioObservacao" TEXT,
ADD COLUMN     "vagas" INTEGER;

-- CreateTable
CREATE TABLE "PreRequisito" (
    "cursoId" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "requisitoId" TEXT NOT NULL,

    CONSTRAINT "PreRequisito_pkey" PRIMARY KEY ("cursoId","disciplinaId","requisitoId")
);

-- CreateTable
CREATE TABLE "EventoCalendario" (
    "id" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "tipo" "TipoEvento" NOT NULL,
    "titulo" TEXT NOT NULL,
    "inicio" DATE NOT NULL,
    "fim" DATE NOT NULL,

    CONSTRAINT "EventoCalendario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sala" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioTurma" (
    "id" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "inicio" TEXT NOT NULL,
    "fim" TEXT NOT NULL,
    "salaId" TEXT NOT NULL,

    CONSTRAINT "HorarioTurma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requerimento" (
    "id" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "tipo" "TipoRequerimento" NOT NULL,
    "destino" "DestinoRequerimento" NOT NULL,
    "turmaId" TEXT,
    "avaliacaoId" TEXT,
    "descricao" TEXT NOT NULL,
    "status" "StatusRequerimento" NOT NULL DEFAULT 'Aberto',
    "resposta" TEXT,
    "prazo" DATE NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidoEm" TIMESTAMP(3),
    "responsavelId" TEXT,

    CONSTRAINT "Requerimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aproveitamento" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "instituicaoOrigem" TEXT NOT NULL,
    "disciplinaOrigem" TEXT NOT NULL,
    "nota" DOUBLE PRECISION,
    "cargaHoraria" INTEGER NOT NULL,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autorId" TEXT NOT NULL,

    CONSTRAINT "Aproveitamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventoCalendario_periodo_idx" ON "EventoCalendario"("periodo");

-- CreateIndex
CREATE INDEX "EventoCalendario_inicio_idx" ON "EventoCalendario"("inicio");

-- CreateIndex
CREATE UNIQUE INDEX "Sala_nome_key" ON "Sala"("nome");

-- CreateIndex
CREATE INDEX "HorarioTurma_turmaId_idx" ON "HorarioTurma"("turmaId");

-- CreateIndex
CREATE INDEX "HorarioTurma_salaId_diaSemana_idx" ON "HorarioTurma"("salaId", "diaSemana");

-- CreateIndex
CREATE UNIQUE INDEX "Requerimento_protocolo_key" ON "Requerimento"("protocolo");

-- CreateIndex
CREATE INDEX "Requerimento_estudanteId_idx" ON "Requerimento"("estudanteId");

-- CreateIndex
CREATE INDEX "Requerimento_status_prazo_idx" ON "Requerimento"("status", "prazo");

-- CreateIndex
CREATE UNIQUE INDEX "Aproveitamento_estudanteId_disciplinaId_key" ON "Aproveitamento"("estudanteId", "disciplinaId");

-- AddForeignKey
ALTER TABLE "PreRequisito" ADD CONSTRAINT "PreRequisito_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreRequisito" ADD CONSTRAINT "PreRequisito_cursoId_disciplinaId_fkey" FOREIGN KEY ("cursoId", "disciplinaId") REFERENCES "CursoDisciplina"("cursoId", "disciplinaId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreRequisito" ADD CONSTRAINT "PreRequisito_cursoId_requisitoId_fkey" FOREIGN KEY ("cursoId", "requisitoId") REFERENCES "CursoDisciplina"("cursoId", "disciplinaId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoCalendario" ADD CONSTRAINT "EventoCalendario_periodo_fkey" FOREIGN KEY ("periodo") REFERENCES "PeriodoLetivo"("nome") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioTurma" ADD CONSTRAINT "HorarioTurma_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioTurma" ADD CONSTRAINT "HorarioTurma_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requerimento" ADD CONSTRAINT "Requerimento_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requerimento" ADD CONSTRAINT "Requerimento_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requerimento" ADD CONSTRAINT "Requerimento_avaliacaoId_fkey" FOREIGN KEY ("avaliacaoId") REFERENCES "Avaliacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requerimento" ADD CONSTRAINT "Requerimento_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aproveitamento" ADD CONSTRAINT "Aproveitamento_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aproveitamento" ADD CONSTRAINT "Aproveitamento_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aproveitamento" ADD CONSTRAINT "Aproveitamento_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- SPEC-037 / SPEC-038 / SPEC-041 / SPEC-042: valores válidos (ADR-002).
ALTER TABLE "CursoDisciplina" ADD CONSTRAINT "CursoDisciplina_semestre_check" CHECK ("semestre" IS NULL OR "semestre" BETWEEN 1 AND 10);
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_vagas_check" CHECK ("vagas" IS NULL OR "vagas" > 0);
ALTER TABLE "PeriodoLetivo" ADD CONSTRAINT "PeriodoLetivo_rematricula_check" CHECK ("rematriculaInicio" IS NULL OR "rematriculaFim" IS NULL OR "rematriculaFim" >= "rematriculaInicio");
ALTER TABLE "Sala" ADD CONSTRAINT "Sala_capacidade_check" CHECK ("capacidade" > 0);
ALTER TABLE "HorarioTurma" ADD CONSTRAINT "HorarioTurma_dia_check" CHECK ("diaSemana" BETWEEN 1 AND 6);
ALTER TABLE "HorarioTurma" ADD CONSTRAINT "HorarioTurma_horas_check" CHECK ("inicio" ~ '^[0-2][0-9]:[0-5][0-9]$' AND "fim" ~ '^[0-2][0-9]:[0-5][0-9]$' AND "fim" > "inicio");
ALTER TABLE "EventoCalendario" ADD CONSTRAINT "EventoCalendario_datas_check" CHECK ("fim" >= "inicio");
ALTER TABLE "Aproveitamento" ADD CONSTRAINT "Aproveitamento_valores_check" CHECK ("cargaHoraria" > 0 AND ("nota" IS NULL OR "nota" BETWEEN 0 AND 10));
-- SPEC-037 / RB-41: pré-requisito não é a própria disciplina (ciclos maiores: regra de domínio).
ALTER TABLE "PreRequisito" ADD CONSTRAINT "PreRequisito_proprio_check" CHECK ("disciplinaId" <> "requisitoId");
