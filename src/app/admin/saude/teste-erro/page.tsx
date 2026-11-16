import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";

export const dynamic = "force-dynamic";

// SPEC-047 / AC-047-02: o administrador dispara um erro de propósito para conferir a página de erro e achar o código
// na Saúde do sistema. Só o administrador chega aqui.
export default async function TesteDeErro() {
  await exigirAcessoPagina(RECURSOS.saude);
  throw new Error("Erro de teste disparado pelo administrador na Saúde do sistema");
}
