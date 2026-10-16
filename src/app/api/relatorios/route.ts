// GET /api/relatorios?turma=&situacao=&formato=csv — relatório acadêmico (SPEC-009, RF-15, OPEN-005).
// Tela e CSV saem da mesma consolidação (INV-009-05).
import { RECURSOS } from "@/domain/autorizacao";
import { gerarCsv } from "@/domain/relatorio";
import { gerarRelatorio } from "@/server/academico/relatorios";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.relatorios);
  if ("negado" in acesso) return acesso.negado;

  const parametros = new URL(requisicao.url).searchParams;
  const resultado = await gerarRelatorio(acesso.sessao, { turma: parametros.get("turma"), situacao: parametros.get("situacao") });
  if (!resultado.ok) return Response.json({ erro: "Acesso negado: esta turma não está no seu escopo." }, { status: 403 });

  if (parametros.get("formato") === "csv") {
    return new Response(gerarCsv(resultado.relatorio.linhas), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="relatorio-studytrack.csv"',
      },
    });
  }
  return Response.json(resultado.relatorio);
}
