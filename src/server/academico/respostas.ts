// Converte o resultado dos casos de uso em resposta HTTP (rotas finas, ADR-001).
import type { Falha, Resultado } from "./cadastros";

export function respostaDeFalha(falha: Falha): Response {
  switch (falha.tipo) {
    case "invalido":
      return Response.json({ erro: "Dados obrigatórios ausentes ou inválidos.", campos: falha.erros }, { status: 400 });
    case "conflito":
      return Response.json({ erro: falha.erro }, { status: 409 });
    case "nao-encontrado":
      return Response.json({ erro: falha.erro }, { status: 404 });
    case "fora-do-escopo":
      return Response.json({ erro: "Acesso negado." }, { status: 403 });
  }
}

export function respostaDeResultado<T>(resultado: Resultado<T>, status = 201): Response {
  return resultado.ok ? Response.json(resultado.valor, { status }) : respostaDeFalha(resultado.falha);
}

export async function lerCorpo(requisicao: Request): Promise<Record<string, unknown>> {
  const corpo = await requisicao.json().catch(() => null);
  return corpo && typeof corpo === "object" && !Array.isArray(corpo) ? (corpo as Record<string, unknown>) : {};
}
