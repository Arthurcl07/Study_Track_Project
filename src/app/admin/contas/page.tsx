import { Casca } from "@/components/casca";
import { FormularioApi } from "@/components/formulario-api";
import { ListaContas } from "@/components/lista-contas";
import { CabecalhoPagina, Cartao } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { PERFIS, ehPerfilValido } from "@/domain/perfil";
import { listarContas } from "@/server/academico/contas";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-010 / RF-16 (UC-11): contas do sistema, só para o Administrador. Não mostra dados acadêmicos (RB-13).
// Layout aprovado em docs/layout/prototipo.html#admin-contas e #admin-contas-erro.
export default async function Contas({ searchParams }: { searchParams: Promise<{ perfil?: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.gestaoContas);
  const { perfil } = await searchParams;
  const filtro = ehPerfilValido(perfil) ? perfil : "";
  const contas = await listarContas(filtro || undefined);

  return (
    <Casca sessao={sessao} ativo="contas">
      <CabecalhoPagina titulo="Contas" subtitulo="Crie contas, escolha o perfil de cada uma e controle quem pode entrar. Dados acadêmicos não aparecem aqui." />
      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Cartao>
          <ListaContas contas={contas} perfil={filtro} usuarioId={sessao.usuarioId} />
        </Cartao>
        <Cartao titulo="Nova conta">
          <FormularioApi
            url="/api/contas"
            textoBotao="Criar conta"
            mensagemSucesso="Conta criada. A pessoa já pode entrar com este e-mail e esta senha."
            campos={[
              { nome: "nome", rotulo: "Nome" },
              { nome: "email", rotulo: "E-mail", tipo: "email" },
              { nome: "senha", rotulo: "Senha inicial (mínimo 8 caracteres)", tipo: "password" },
              { nome: "perfil", rotulo: "Perfil", tipo: "select", opcoes: PERFIS.map((p) => ({ valor: p, rotulo: p })) },
            ]}
          />
          <p className="mt-3 text-sm text-mudo">Estudantes também podem ser cadastrados pela coordenação, já matriculados na turma.</p>
        </Cartao>
      </div>
    </Casca>
  );
}
