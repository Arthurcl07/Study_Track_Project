// GET /api/estudantes/:id/ficha — ficha do estudante (Administrador; Coordenador do curso, só leitura; RB-33).
// PUT — dados pessoais da ficha, só a secretaria (SPEC-033).
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { consultarFicha, salvarFicha } from "@/server/academico/secretaria";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(requisicao: Request, contexto: Contexto) {
  const acesso = await autorizarApi(requisicao, RECURSOS.estudantes);
  if ("negado" in acesso) return acesso.negado;
  const ficha = await consultarFicha(acesso.sessao, (await contexto.params).id);
  return ficha ? Response.json(ficha) : Response.json({ erro: "Estudante não encontrado." }, { status: 404 });
}

export async function PUT(requisicao: Request, contexto: Contexto) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await salvarFicha((await contexto.params).id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}
