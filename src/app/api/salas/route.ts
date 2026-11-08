// GET e POST /api/salas — salas para os horários das turmas (SPEC-041). Cadastrar: secretaria.
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo, respostaDeResultado } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { listarSalas, salvarSala } from "@/server/academico/horarios";

export async function GET(requisicao: Request) {
  // Consultar: secretaria (gestão) e coordenação (escolher a sala do horário).
  const acesso = (await autorizarApi(requisicao, RECURSOS.secretaria));
  if ("negado" in acesso) {
    const coordenacao = await autorizarApi(requisicao, RECURSOS.cadastroAcademico);
    if ("negado" in coordenacao) return coordenacao.negado;
  }
  return Response.json(await listarSalas());
}

export async function POST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.secretaria);
  if ("negado" in acesso) return acesso.negado;
  return respostaDeResultado(await salvarSala(await lerCorpo(requisicao), acesso.sessao.usuarioId));
}
