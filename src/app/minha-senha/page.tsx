import { redirect } from "next/navigation";
import { Casca } from "@/components/casca";
import { FormularioSenha } from "@/components/formulario-senha";
import { CabecalhoPagina, Cartao } from "@/components/ui";
import { contaDaPagina } from "@/server/auth/guardas";

// SPEC-011 / RF-18: "Alterar minha senha", para todos os perfis. Layout aprovado em
// docs/layout/prototipo.html#minha-senha.
export default async function MinhaSenha() {
  const conta = await contaDaPagina();
  if (!conta) redirect("/login");
  if (conta.trocarSenha) redirect("/definir-senha");

  return (
    <Casca sessao={conta.sessao} ativo="senha">
      <CabecalhoPagina titulo="Alterar minha senha" subtitulo="Informe a senha atual e escolha uma nova." />
      <Cartao className="max-w-md">
        <FormularioSenha />
      </Cartao>
    </Casca>
  );
}
