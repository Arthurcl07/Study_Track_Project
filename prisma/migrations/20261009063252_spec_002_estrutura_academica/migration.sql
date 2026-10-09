-- CreateTable
CREATE TABLE "Disciplina" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,

    CONSTRAINT "Disciplina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "disciplinaId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "coordenadorId" TEXT,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matricula" (
    "estudanteId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,

    CONSTRAINT "Matricula_pkey" PRIMARY KEY ("estudanteId","turmaId")
);

-- CreateIndex
CREATE INDEX "Turma_professorId_idx" ON "Turma"("professorId");

-- CreateIndex
CREATE INDEX "Turma_coordenadorId_idx" ON "Turma"("coordenadorId");

-- CreateIndex
CREATE INDEX "Matricula_turmaId_idx" ON "Matricula"("turmaId");

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_coordenadorId_fkey" FOREIGN KEY ("coordenadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- OPEN-009: carga horária é um inteiro maior que zero (ADR-002: regra garantida também no banco).
ALTER TABLE "Disciplina" ADD CONSTRAINT "Disciplina_cargaHoraria_positiva" CHECK ("cargaHoraria" > 0);
