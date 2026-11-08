// GET /api/virada?origem=&destino= (prévia) e POST /api/virada (cópia) — virada de semestre (SPEC-030, RF-38).
// Só a secretaria (Administrador).
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { executarVirada, previaDaVirada } from "@/server/academico/virada";

export async function GET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  const p = new URL(requisicao.url).searchParams;
  return respostaDeResultado(await previaDaVirada(p.get("origem"), p.get("destino")), 200);
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await executarVirada(await lerCorpo(requisicao), acesso.sessao.usuarioId), 201);
}
