import Link from "next/link";
import { Casca } from "@/components/casca";
import { BarrasHorizontais } from "@/components/dashboard";
import { Icone } from "@/components/icones";
import { CabecalhoPagina, Cartao, CartaoNumero, CLASSE_BOTAO_PRIMARIO, CLASSE_LINK, EstadoVazio, Etiqueta } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarDashboardAdministrador } from "@/server/academico/dashboard";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-016 / RF-25 (UC-16): dashboard do administrador, só com contas e estrutura dos cursos. Nenhuma nota,
// frequência, situação, plano ou relatório (RB-13, INV-016-05). Layout aprovado em docs/layout/prototipo.html#dash-admin.
const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

export default async function DashboardAdministrador() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelAdministrador);
  const { contas, recentes, cursos, coordenadores } = await consultarDashboardAdministrador();
  const porPerfil = [
    { rotulo: "Estudantes", valor: contas.ativasPorPerfil.Estudante, cor: "bg-azul" },
    { rotulo: "Professores", valor: contas.ativasPorPerfil.Professor, cor: "bg-azul-escuro" },
    { rotulo: "Coordenadores", valor: contas.ativasPorPerfil.Coordenador, cor: "bg-marinho-claro" },
    { rotulo: "Administradores", valor: contas.ativasPorPerfil.Administrador, cor: "bg-mudo" },
  ];

  return (
    <Casca sessao={sessao} ativo="inicio">
      <CabecalhoPagina
        titulo={`Olá, ${sessao.nome.split(" ")[0]}`}
        subtitulo="Contas e cursos do StudyTrack. Dados acadêmicos (notas, frequência, situação) não aparecem para o administrador."
        acao={
          <Link href="/admin/contas" className={CLASSE_BOTAO_PRIMARIO}>
            <Icone nome="pessoas" className="h-4 w-4" /> Nova conta
          </Link>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CartaoNumero rotulo="Contas ativas" valor={contas.ativas} href="/admin/contas" />
        <CartaoNumero rotulo="Desativadas" valor={contas.desativadas} cor="text-mudo" />
        <CartaoNumero rotulo="Aguardando troca de senha" valor={contas.aguardandoSenha} cor={contas.aguardandoSenha > 0 ? "text-atencao" : ""} detalhe="senha provisória ainda em uso" />
        <CartaoNumero rotulo="Cursos" valor={cursos.length} detalhe={`${coordenadores} coordenador(es)`} href="/admin/cursos" />
      </div>

      <div className="mb-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
        <Cartao titulo="Contas por perfil">
          <BarrasHorizontais itens={porPerfil} />
          <p className="mt-4 text-[13px] text-mudo">Contando só as contas ativas.</p>
        </Cartao>
        <Cartao titulo="Contas criadas recentemente" acao={<Link href="/admin/contas" className={CLASSE_LINK}>Ver contas →</Link>}>
          <table className="tabela-responsiva w-full text-[15px]">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                <th className="pr-2 pb-2.5">Conta</th>
                <th className="px-2 pb-2.5">Perfil</th>
                <th className="pb-2.5 pl-2">Criada em</th>
              </tr>
            </thead>
            <tbody>
              {recentes.map((c) => (
                <tr key={c.id} className="border-t border-traco">
                  <td data-rotulo="Conta" className="py-3 pr-2">
                    {c.nome}
                    {c.trocarSenha && (
                      <span className="ml-2 inline-flex rounded-full bg-atencao-fundo px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-atencao">▲ senha provisória</span>
                    )}
                  </td>
                  <td data-rotulo="Perfil" className="px-2 py-3"><Etiqueta>{c.perfil}</Etiqueta></td>
                  <td data-rotulo="Criada em" className="py-3 pl-2 tabular-nums">{dataCurta(c.criadaEm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Cartao>
      </div>

      <Cartao titulo={`Cursos (${cursos.length})`} acao={<Link href="/admin/cursos" className={CLASSE_LINK}>Gerenciar cursos →</Link>}>
        {cursos.length === 0 ? (
          <EstadoVazio>Nenhum curso cadastrado ainda.</EstadoVazio>
        ) : (
          <table className="tabela-responsiva w-full text-[15px]">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                <th className="pr-2 pb-2.5">Curso</th>
                <th className="px-2 pb-2.5">Coordenação</th>
                <th className="px-2 pb-2.5 text-right">Disciplinas</th>
                <th className="px-2 pb-2.5 text-right">Turmas</th>
                <th className="pb-2.5 pl-2 text-right">Estudantes</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((c) => (
                <tr key={c.id} className="border-t border-traco">
                  <td data-rotulo="Curso" className="py-3 pr-2">{c.nome}</td>
                  <td data-rotulo="Coordenação" className="px-2 py-3">{c.coordenador.nome}</td>
                  <td data-rotulo="Disciplinas" className="px-2 py-3 text-right tabular-nums">{c.disciplinas}</td>
                  <td data-rotulo="Turmas" className="px-2 py-3 text-right tabular-nums">{c.turmas}</td>
                  <td data-rotulo="Estudantes" className="py-3 pl-2 text-right tabular-nums">{c.estudantes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Cartao>
    </Casca>
  );
}
