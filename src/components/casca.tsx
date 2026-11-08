// Casca autenticada (RNF-06, OPEN-019, OPEN-020): menu lateral do perfil, usuário e Sair.
// A permissão continua sendo verificada no servidor por cada página (INV-001-03); o menu só orienta.
import type { Perfil } from "@/domain/perfil";
import { naoLidasDoMenu } from "@/server/academico/notificacoes";
import { contarPedidosPendentes } from "@/server/auth/pedidos-senha";
import { contarDiariosParaHomologar } from "@/server/academico/diario";
import { contarRequerimentosPendentes } from "@/server/academico/requerimentos";
import type { Sessao } from "@/server/auth/token";
import type { NomeIcone } from "./icones";
import { NavegacaoCasca } from "./navegacao-casca";

export type ItemMenu =
  | "inicio" | "notas" | "frequencia" | "atividades" | "relatorios" | "disciplinas" | "turmas" | "area" | "contas" | "cursos" | "senha" | "historico"
  | "periodos" | "auditoria" | "documentos" | "notificacoes" | "comunicados" | "estudantes" | "pedidos" | "virada" | "instituicao"
  | "meucurso" | "rematricula" | "calendario" | "requerimentos" | "diarios" | "salas" | "censo";

type Entrada = { id: ItemMenu; rotulo: string; href: string; icone: NomeIcone };

const MENUS: Record<Perfil, Entrada[]> = {
  Estudante: [
    { id: "inicio", rotulo: "Dashboard", href: "/estudante", icone: "inicio" },
    { id: "atividades", rotulo: "Minhas atividades", href: "/estudante/atividades", icone: "calendario" },
    // SPEC-036 a SPEC-041 (Nível 3).
    { id: "meucurso", rotulo: "Meu curso", href: "/estudante/curso", icone: "bussola" },
    { id: "rematricula", rotulo: "Rematrícula", href: "/estudante/rematricula", icone: "pastas" },
    { id: "calendario", rotulo: "Calendário", href: "/calendario", icone: "agenda" },
    { id: "requerimentos", rotulo: "Requerimentos", href: "/requerimentos", icone: "envelope" },
    // SPEC-020 e SPEC-022.
    { id: "documentos", rotulo: "Documentos", href: "/estudante/documentos", icone: "documento" },
    // SPEC-025: mural de comunicados.
    { id: "comunicados", rotulo: "Comunicados", href: "/comunicados", icone: "megafone" },
    { id: "notificacoes", rotulo: "Notificações", href: "/notificacoes", icone: "sino" },
  ],
  Professor: [
    { id: "inicio", rotulo: "Dashboard", href: "/professor", icone: "inicio" },
    { id: "notas", rotulo: "Notas e avaliações", href: "/professor/notas", icone: "lapis" },
    // SPEC-018: a chamada por aula substitui o lançamento do percentual (OPEN-041).
    { id: "frequencia", rotulo: "Chamada", href: "/professor/frequencia", icone: "check" },
    { id: "atividades", rotulo: "Atividades", href: "/professor/atividades", icone: "calendario" },
    { id: "relatorios", rotulo: "Relatórios", href: "/relatorios", icone: "grafico" },
    { id: "historico", rotulo: "Histórico de notas", href: "/historico-notas", icone: "relogio" },
    { id: "calendario", rotulo: "Calendário", href: "/calendario", icone: "agenda" },
    { id: "requerimentos", rotulo: "Requerimentos", href: "/requerimentos", icone: "envelope" },
    { id: "comunicados", rotulo: "Comunicados", href: "/comunicados", icone: "megafone" },
    { id: "notificacoes", rotulo: "Notificações", href: "/notificacoes", icone: "sino" },
  ],
  Coordenador: [
    { id: "inicio", rotulo: "Dashboard", href: "/coordenador", icone: "inicio" },
    { id: "disciplinas", rotulo: "Disciplinas", href: "/coordenador/disciplinas", icone: "livro" },
    { id: "turmas", rotulo: "Turmas e estudantes", href: "/coordenador/turmas", icone: "pessoas" },
    // SPEC-034: estudantes dos cursos, com busca e a ficha (só leitura, RB-33).
    { id: "estudantes", rotulo: "Estudantes", href: "/coordenador/estudantes", icone: "mochila" },
    { id: "relatorios", rotulo: "Relatórios", href: "/relatorios", icone: "grafico" },
    { id: "historico", rotulo: "Histórico de notas", href: "/historico-notas", icone: "relogio" },
    // SPEC-039, SPEC-040 e SPEC-036.
    { id: "diarios", rotulo: "Diários", href: "/coordenador/diarios", icone: "livro" },
    { id: "calendario", rotulo: "Calendário", href: "/calendario", icone: "agenda" },
    { id: "requerimentos", rotulo: "Requerimentos", href: "/requerimentos", icone: "envelope" },
    { id: "comunicados", rotulo: "Comunicados", href: "/comunicados", icone: "megafone" },
    // SPEC-019: ações acadêmicas dos cursos que coordena.
    { id: "auditoria", rotulo: "Auditoria", href: "/coordenador/auditoria", icone: "escudo" },
    { id: "area", rotulo: "Área da coordenação", href: "/coordenador/area", icone: "cadeado" },
  ],
  // SPEC-010 / RB-13: contas e, desde a SPEC-015, cursos; o dashboard é da SPEC-016. SPEC-035 (OPEN-057): o
  // Administrador é também a secretaria acadêmica (estudantes, pedidos de senha, virada e instituição).
  Administrador: [
    { id: "inicio", rotulo: "Dashboard", href: "/admin", icone: "inicio" },
    { id: "contas", rotulo: "Contas", href: "/admin/contas", icone: "pessoas" },
    { id: "estudantes", rotulo: "Estudantes", href: "/admin/estudantes", icone: "mochila" },
    { id: "pedidos", rotulo: "Pedidos de senha", href: "/admin/pedidos-senha", icone: "chave" },
    { id: "requerimentos", rotulo: "Requerimentos", href: "/requerimentos", icone: "envelope" },
    { id: "calendario", rotulo: "Calendário", href: "/admin/calendario", icone: "agenda" },
    { id: "salas", rotulo: "Salas", href: "/admin/salas", icone: "porta" },
    { id: "cursos", rotulo: "Cursos", href: "/admin/cursos", icone: "capelo" },
    // SPEC-017 e SPEC-019: períodos letivos e auditoria administrativa.
    { id: "periodos", rotulo: "Períodos letivos", href: "/admin/periodos", icone: "calendario" },
    { id: "virada", rotulo: "Virada de semestre", href: "/admin/virada", icone: "repetir" },
    { id: "censo", rotulo: "Exportação do Censo", href: "/admin/censo", icone: "download" },
    { id: "instituicao", rotulo: "Instituição", href: "/admin/instituicao", icone: "predio" },
    { id: "auditoria", rotulo: "Auditoria", href: "/admin/auditoria", icone: "escudo" },
  ],
};

// SPEC-022: o item Notificações mostra o número de não lidas (estudante e professor, RB-23).
// SPEC-027: o item Pedidos de senha mostra os pendentes (administrador).
export async function Casca({ sessao, ativo, children }: { sessao: Sessao; ativo: ItemMenu; children: React.ReactNode }) {
  const [naoLidas, pedidos, requerimentos, diarios] = await Promise.all([
    naoLidasDoMenu(sessao),
    sessao.perfil === "Administrador" ? contarPedidosPendentes() : 0,
    // SPEC-036: requerimentos pendentes de quem responde; SPEC-039: diários para homologar.
    contarRequerimentosPendentes(sessao),
    sessao.perfil === "Coordenador" ? contarDiariosParaHomologar(sessao.usuarioId) : 0,
  ]);
  const contadores: Partial<Record<ItemMenu, number>> = { notificacoes: naoLidas, pedidos, requerimentos, diarios };
  const itens = MENUS[sessao.perfil].map((item) => (contadores[item.id] ? { ...item, contador: contadores[item.id] } : item));
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[256px_minmax(0,1fr)]">
      <NavegacaoCasca itens={itens} ativo={ativo} nome={sessao.nome} perfil={sessao.perfil} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
