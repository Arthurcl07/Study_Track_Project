// GET /api/meus-dados — arquivo JSON com os dados do próprio usuário (SPEC-045, RB-43, INV-045-02 e INV-045-03).
import { RECURSOS } from "@/domain/autorizacao";
import { nomeDoArquivoDeDados } from "@/domain/lgpd";
import { meusDados } from "@/server/academico/lgpd";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";

async function rotaGET(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.meusDados);
  if ("negado" in acesso) return acesso.negado;
  const { nome, pacote } = await meusDados(acesso.sessao);
  return new Response(JSON.stringify(pacote, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeDoArquivoDeDados(nome, new Date())}"`,
      "Cache-Control": "no-store",
    },
  });
}

// SPEC-057 (AC-057-01): erro inesperado vira 500 com o código, gravado no registro de erros.
export const GET = comRegistroDeErro(rotaGET);
