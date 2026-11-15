-- SPEC-053 / RB-48: conta que passa a ser de Estudante ganha a ficha (número de matrícula), pela mesma função do
-- gatilho de inserção (SPEC-033, INV-033-01). Ao deixar de ser Estudante, a aplicação apaga a ficha (sem matrícula).
CREATE TRIGGER "Usuario_ficha_estudante_perfil" AFTER UPDATE OF "perfil" ON "Usuario"
  FOR EACH ROW WHEN (NEW."perfil" = 'Estudante' AND OLD."perfil" <> 'Estudante')
  EXECUTE FUNCTION "criar_ficha_estudante"();
