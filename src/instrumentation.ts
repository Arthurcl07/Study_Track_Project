// SPEC-057 (RNF-08): todo erro do servidor (página, layout ou rota) é gravado no registro de erros com o código
// derivado do digest, o mesmo que a página de erro mostra (SPEC-047, INV-047-02).
import type { Instrumentation } from "next";

export function register() {}

export const onRequestError: Instrumentation.onRequestError = async (erro, requisicao) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { registrarErro } = await import("@/server/dados/erros");
  const digest = erro && typeof erro === "object" && "digest" in erro ? String((erro as { digest: unknown }).digest) : null;
  const cabecalho = requisicao.headers.cookie;
  await registrarErro(erro, {
    rota: requisicao.path,
    metodo: requisicao.method,
    cookie: Array.isArray(cabecalho) ? cabecalho.join("; ") : cabecalho,
    digest,
  });
};
