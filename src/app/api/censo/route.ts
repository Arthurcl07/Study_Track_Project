// GET /api/censo?periodo= — CSV de apoio ao Censo (SPEC-043, secretaria). Não é o layout oficial do INEP.
import { RECURSOS } from "@/domain/autorizacao";
import { exportarCenso } from "@/server/academico/censo";
import { respostaDeFalha } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  const periodo = new URL(requisicao.url).searchParams.get("periodo");
  const resultado = await exportarCenso(periodo, acesso.sessao.usuarioId);
  if (!resultado.ok) return respostaDeFalha(resultado.falha);
  return new Response(resultado.valor.csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="censo-apoio-${(periodo ?? "").replace("/", "-")}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
