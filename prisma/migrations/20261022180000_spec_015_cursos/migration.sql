-- SPEC-015 (OPEN-030 a OPEN-033): Curso com 1 coordenador, grade Curso–Disciplina (N:M), turma de 1 curso
-- e estudante de 1 curso. Escrita à mão para preencher os dados que já existem antes das restrições.

-- CreateTable
CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "coordenadorId" TEXT NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CursoDisciplina" (
    "cursoId" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,

    CONSTRAINT "CursoDisciplina_pkey" PRIMARY KEY ("cursoId","disciplinaId")
);

-- AlterTable
ALTER TABLE "Turma" ADD COLUMN "cursoId" TEXT;
ALTER TABLE "Usuario" ADD COLUMN "cursoId" TEXT;

-- Preenchimento dos dados existentes: cada coordenador com turmas ganha um curso provisório com essas turmas
-- (o seed dá os nomes definitivos, OPEN-036). Turmas sem coordenador vão para o primeiro curso provisório.
INSERT INTO "Curso" ("id", "nome", "coordenadorId")
SELECT gen_random_uuid()::text, 'Curso provisório de ' || u."nome" || ' (' || left(u."id", 8) || ')', u."id"
FROM "Usuario" u
WHERE EXISTS (SELECT 1 FROM "Turma" t WHERE t."coordenadorId" = u."id");

UPDATE "Turma" t SET "cursoId" = c."id" FROM "Curso" c WHERE c."coordenadorId" = t."coordenadorId";
UPDATE "Turma" SET "cursoId" = (SELECT "id" FROM "Curso" ORDER BY "nome" LIMIT 1) WHERE "cursoId" IS NULL;

-- Grade: as disciplinas das turmas de cada curso.
INSERT INTO "CursoDisciplina" ("cursoId", "disciplinaId")
SELECT DISTINCT "cursoId", "disciplinaId" FROM "Turma";

-- Estudante: o curso da primeira matrícula (pelo nome da turma); sem matrícula, o primeiro curso.
UPDATE "Usuario" u SET "cursoId" = (
    SELECT t."cursoId" FROM "Matricula" m JOIN "Turma" t ON t."id" = m."turmaId"
    WHERE m."estudanteId" = u."id" ORDER BY t."nome" LIMIT 1
) WHERE u."perfil" = 'Estudante';
UPDATE "Usuario" SET "cursoId" = (SELECT "id" FROM "Curso" ORDER BY "nome" LIMIT 1)
WHERE "perfil" = 'Estudante' AND "cursoId" IS NULL;

-- O coordenador passa a vir do curso (RB-04): a coluna da turma sai.
ALTER TABLE "Turma" DROP CONSTRAINT "Turma_coordenadorId_fkey";
DROP INDEX "Turma_coordenadorId_idx";
ALTER TABLE "Turma" DROP COLUMN "coordenadorId";
ALTER TABLE "Turma" ALTER COLUMN "cursoId" SET NOT NULL;

-- RB-19 / INV-015-05: curso preenchido se e somente se o perfil for Estudante.
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_curso_do_estudante_check" CHECK (("perfil" = 'Estudante') = ("cursoId" IS NOT NULL));

-- CreateIndex
CREATE UNIQUE INDEX "Curso_nome_key" ON "Curso"("nome");

-- CreateIndex
CREATE INDEX "Curso_coordenadorId_idx" ON "Curso"("coordenadorId");

-- CreateIndex
CREATE INDEX "CursoDisciplina_disciplinaId_idx" ON "CursoDisciplina"("disciplinaId");

-- CreateIndex
CREATE INDEX "Turma_cursoId_idx" ON "Turma"("cursoId");

-- CreateIndex
CREATE INDEX "Usuario_cursoId_idx" ON "Usuario"("cursoId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_coordenadorId_fkey" FOREIGN KEY ("coordenadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoDisciplina" ADD CONSTRAINT "CursoDisciplina_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoDisciplina" ADD CONSTRAINT "CursoDisciplina_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
