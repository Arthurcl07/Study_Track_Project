-- SPEC-031 / RB-30: indicador e frequência pertencem a uma matrícula (dashboards, relatórios e alertas filtram
-- a matrícula cursando na própria query, ADR-003). Não há registro sem matrícula no banco (conferido em 2026-11-06).
-- AddForeignKey
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_estudanteId_turmaId_fkey" FOREIGN KEY ("estudanteId", "turmaId") REFERENCES "Matricula"("estudanteId", "turmaId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicadorAcademico" ADD CONSTRAINT "IndicadorAcademico_estudanteId_turmaId_fkey" FOREIGN KEY ("estudanteId", "turmaId") REFERENCES "Matricula"("estudanteId", "turmaId") ON DELETE CASCADE ON UPDATE CASCADE;

