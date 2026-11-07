-- CreateEnum
CREATE TYPE "SituacaoMatricula" AS ENUM ('Cursando', 'Trancada', 'Cancelada');

-- CreateEnum
CREATE TYPE "TipoAvaliacao" AS ENUM ('Prova', 'Trabalho', 'Substitutiva', 'Exame');

-- CreateEnum
CREATE TYPE "SituacaoCurso" AS ENUM ('Ativo', 'Trancado', 'Transferido', 'Cancelado', 'Concluído');

-- CreateEnum
CREATE TYPE "MotivoAbono" AS ENUM ('AtestadoMedico', 'ExerciciosDomiciliares', 'LicencaMaternidade', 'ServicoMilitar', 'Outro');

-- CreateEnum
CREATE TYPE "StatusPedidoSenha" AS ENUM ('Pendente', 'Aprovado', 'Recusado');

-- DropIndex
DROP INDEX "Aula_turmaId_data_key";

-- AlterTable
ALTER TABLE "Aula" ADD COLUMN     "numero" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Avaliacao" ADD COLUMN     "tipo" "TipoAvaliacao" NOT NULL DEFAULT 'Prova';

-- AlterTable
ALTER TABLE "Matricula" ADD COLUMN     "situacao" "SituacaoMatricula" NOT NULL DEFAULT 'Cursando';

-- CreateTable
CREATE TABLE "FichaEstudante" (
    "estudanteId" TEXT NOT NULL,
    "numeroMatricula" TEXT NOT NULL,
    "cpf" TEXT,
    "dataNascimento" DATE,
    "telefone" TEXT,
    "responsavelNome" TEXT,
    "responsavelTelefone" TEXT,
    "situacaoCurso" "SituacaoCurso" NOT NULL DEFAULT 'Ativo',
    "situacaoDesde" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "situacaoMotivo" TEXT,

    CONSTRAINT "FichaEstudante_pkey" PRIMARY KEY ("estudanteId")
);

-- CreateTable
CREATE TABLE "Abono" (
    "id" TEXT NOT NULL,
    "estudanteId" TEXT NOT NULL,
    "inicio" DATE NOT NULL,
    "fim" DATE NOT NULL,
    "motivo" "MotivoAbono" NOT NULL,
    "observacao" TEXT,
    "autorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Abono_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoSenha" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "status" "StatusPedidoSenha" NOT NULL DEFAULT 'Pendente',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvidoEm" TIMESTAMP(3),
    "resolvidoPorId" TEXT,

    CONSTRAINT "PedidoSenha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instituicao" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "endereco" TEXT,
    "cidadeUf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "responsavelSecretaria" TEXT,
    "logotipo" TEXT,
    "atualizadaEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instituicao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FichaEstudante_numeroMatricula_key" ON "FichaEstudante"("numeroMatricula");

-- CreateIndex
CREATE UNIQUE INDEX "FichaEstudante_cpf_key" ON "FichaEstudante"("cpf");

-- CreateIndex
CREATE INDEX "Abono_estudanteId_idx" ON "Abono"("estudanteId");

-- CreateIndex
CREATE INDEX "PedidoSenha_status_criadoEm_idx" ON "PedidoSenha"("status", "criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Aula_turmaId_data_numero_key" ON "Aula"("turmaId", "data", "numero");

-- AddForeignKey
ALTER TABLE "FichaEstudante" ADD CONSTRAINT "FichaEstudante_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abono" ADD CONSTRAINT "Abono_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Abono" ADD CONSTRAINT "Abono_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoSenha" ADD CONSTRAINT "PedidoSenha_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoSenha" ADD CONSTRAINT "PedidoSenha_resolvidoPorId_fkey" FOREIGN KEY ("resolvidoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- SPEC-029 (OPEN-051): avaliações existentes viram Prova quando o nome começa com "Prova"; senão, Trabalho.
UPDATE "Avaliacao" SET "tipo" = 'Trabalho' WHERE "nome" NOT ILIKE 'prova%';

-- SPEC-029 / INV-029-05: no máximo uma Substitutiva e um Exame por turma.
CREATE UNIQUE INDEX "Avaliacao_uma_substitutiva" ON "Avaliacao"("turmaId") WHERE "tipo" = 'Substitutiva';
CREATE UNIQUE INDEX "Avaliacao_um_exame" ON "Avaliacao"("turmaId") WHERE "tipo" = 'Exame';

-- SPEC-028 / INV-028-01: de 1 a 4 aulas na mesma data.
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_numero_check" CHECK ("numero" BETWEEN 1 AND 4);

-- SPEC-032 / RB-31: intervalo válido (o limite de 180 dias fica na regra de domínio).
ALTER TABLE "Abono" ADD CONSTRAINT "Abono_intervalo_check" CHECK ("fim" >= "inicio");

-- SPEC-027 / INV-027-02: no máximo um pedido pendente por conta.
CREATE UNIQUE INDEX "PedidoSenha_um_pendente" ON "PedidoSenha"("usuarioId") WHERE "status" = 'Pendente';

-- SPEC-033 / INV-033-04: registro único da instituição.
ALTER TABLE "Instituicao" ADD CONSTRAINT "Instituicao_unica_check" CHECK ("id" = 1);

-- SPEC-033 / RB-33 / INV-033-01: todo estudante tem ficha com número de matrícula = ano de criação da conta
-- (horário de Brasília) + sequência de 4 dígitos. O gatilho cobre todos os caminhos de cadastro (tela,
-- coordenação, importação, seed e testes); a mesma regra está em src/domain/ficha.ts (numeroDeMatricula).
CREATE FUNCTION "criar_ficha_estudante"() RETURNS trigger AS $$
DECLARE
  ano TEXT := to_char(NEW."criadaEm" AT TIME ZONE 'America/Sao_Paulo', 'YYYY');
  seq INTEGER;
BEGIN
  IF NEW."perfil" <> 'Estudante' THEN
    RETURN NEW;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('ficha-' || ano));
  SELECT COALESCE(MAX(substring("numeroMatricula" FROM 5)::INTEGER), 0) + 1 INTO seq
    FROM "FichaEstudante" WHERE "numeroMatricula" LIKE ano || '%';
  INSERT INTO "FichaEstudante" ("estudanteId", "numeroMatricula", "situacaoDesde")
    VALUES (NEW."id", ano || lpad(seq::TEXT, 4, '0'), (NEW."criadaEm" AT TIME ZONE 'America/Sao_Paulo')::DATE);
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Usuario_ficha_estudante" AFTER INSERT ON "Usuario"
  FOR EACH ROW EXECUTE FUNCTION "criar_ficha_estudante"();

-- Estudantes que já existem: fichas em ordem de criação, por ano.
INSERT INTO "FichaEstudante" ("estudanteId", "numeroMatricula", "situacaoDesde")
SELECT u."id",
       to_char(u."criadaEm" AT TIME ZONE 'America/Sao_Paulo', 'YYYY')
         || lpad(ROW_NUMBER() OVER (PARTITION BY to_char(u."criadaEm" AT TIME ZONE 'America/Sao_Paulo', 'YYYY') ORDER BY u."criadaEm", u."id")::TEXT, 4, '0'),
       (u."criadaEm" AT TIME ZONE 'America/Sao_Paulo')::DATE
FROM "Usuario" u
WHERE u."perfil" = 'Estudante';
