// PUT /api/estudantes/:id/curso — troca de curso do estudante ativo sem matrícula cursando (SPEC-031, RB-19). Só a secretaria.
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { trocarCurso } from "@/server/academico/secretaria";

export async function PUT(requisicao: Request, contexto: { params: Promise<{ id: string }> }) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await trocarCurso((await contexto.params).id, await lerCorpo(requisicao), acesso.sessao.usuarioId), 200);
}
