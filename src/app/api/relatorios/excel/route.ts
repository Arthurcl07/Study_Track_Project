// GET /api/relatorios/excel?periodo=&curso=&turma=&situacao= — relatório em .xlsx (SPEC-049, RF-58, ADR-005).
// Mesmos filtros e mesmo escopo da tela (INV-049-01, INV-049-02); fora do escopo: 403 (AC-049-04).
import { RECURSOS } from "@/domain/autorizacao";
import { planilhaDoRelatorio } from "@/server/academico/planilha";
import { gerarRelatorio } from "@/server/academico/relatorios";
import { obterInstituicao } from "@/server/academico/secretaria";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.relatorios);
  if ("negado" in acesso) return acesso.negado;
  const parametros = new URL(requisicao.url).searchParams;
  const [resultado, instituicao] = await Promise.all([
    gerarRelatorio(acesso.sessao, { turma: parametros.get("turma"), situacao: parametros.get("situacao"), curso: parametros.get("curso"), periodo: parametros.get("periodo") }),
    obterInstituicao(),
  ]);
  if (!resultado.ok) return Response.json({ erro: "Acesso negado: esta turma não está no seu escopo." }, { status: 403 });
  const arquivo = await planilhaDoRelatorio(resultado.relatorio, instituicao?.nome ?? "StudyTrack");
  return new Response(new Uint8Array(arquivo), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="relatorio-studytrack-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
