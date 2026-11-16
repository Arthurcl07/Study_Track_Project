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
import { Tour } from "./tour";
import { mostrarTour, tourDoPerfil } from "@/domain/ajuda";
import { prisma } from "@/server/dados/prisma";

export type ItemMenu =
  | "inicio" | "notas" | "frequencia" | "atividades" | "relatorios" | "disciplinas" | "turmas" | "area" | "contas" | "cursos" | "senha" | "historico"
  | "periodos" | "auditoria" | "documentos" | "notificacoes" | "comunicados" | "estudantes" | "pedidos" | "virada" | "instituicao"
  | "meucurso" | "rematricula" | "calendario" | "requerimentos" | "diarios" | "salas" | "censo"
  // Níveis 5 e 6 (SPEC-045 a SPEC-059).
  | "meusdados" | "ajuda" | "evasao" | "acompanhamento" | "configuracoes" | "saude" | "importaranterior";

// SPEC-045 e SPEC-059: Meus dados e Ajuda no fim do menu de todo perfil.
const FINAL: Entrada[] = [
  { id: "meusdados", rotulo: "Meus dados", href: "/meus-dados", icone: "privacidade" },
  { id: "ajuda", rotulo: "Ajuda", href: "/ajuda", icone: "ajuda" },
];

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
    ...FINAL,
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
    ...FINAL,
  ],
  Coordenador: [
    { id: "inicio", rotulo: "Dashboard", href: "/coordenador", icone: "inicio" },
    { id: "disciplinas", rotulo: "Disciplinas", href: "/coordenador/disciplinas", icone: "livro" },
    { id: "turmas", rotulo: "Turmas e estudantes", href: "/coordenador/turmas", icone: "pessoas" },
    // SPEC-034: estudantes dos cursos, com busca e a ficha (só leitura, RB-33).
    { id: "estudantes", rotulo: "Estudantes", href: "/coordenador/estudantes", icone: "mochila" },
    { id: "relatorios", rotulo: "Relatórios", href: "/relatorios", icone: "grafico" },
    // SPEC-050 e SPEC-051: evasão e acompanhamento dos professores.
    { id: "evasao", rotulo: "Evasão", href: "/evasao", icone: "saida" },
    { id: "acompanhamento", rotulo: "Acompanhamento", href: "/coordenador/acompanhamento", icone: "binoculo" },
    { id: "historico", rotulo: "Histórico de notas", href: "/historico-notas", icone: "relogio" },
    // SPEC-039, SPEC-040 e SPEC-036.
    { id: "diarios", rotulo: "Diários", href: "/coordenador/diarios", icone: "livro" },
    { id: "calendario", rotulo: "Calendário", href: "/calendario", icone: "agenda" },
    { id: "requerimentos", rotulo: "Requerimentos", href: "/requerimentos", icone: "envelope" },
    { id: "comunicados", rotulo: "Comunicados", href: "/comunicados", icone: "megafone" },
    // SPEC-019: ações acadêmicas dos cursos que coordena.
    { id: "auditoria", rotulo: "Auditoria", href: "/coordenador/auditoria", icone: "escudo" },
    { id: "notificacoes", rotulo: "Notificações", href: "/notificacoes", icone: "sino" },
    { id: "area", rotulo: "Área da coordenação", href: "/coordenador/area", icone: "cadeado" },
    ...FINAL,
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
    // SPEC-050, SPEC-058, SPEC-052 e SPEC-057.
    { id: "evasao", rotulo: "Evasão", href: "/evasao", icone: "saida" },
    { id: "importaranterior", rotulo: "Importar do sistema anterior", href: "/admin/importar-anterior", icone: "upload" },
    { id: "configuracoes", rotulo: "Configurações", href: "/admin/configuracoes", icone: "engrenagem" },
    { id: "saude", rotulo: "Saúde do sistema", href: "/admin/saude", icone: "pulso" },
    ...FINAL,
  ],
};

// SPEC-022: o item Notificações mostra o número de não lidas (estudante e professor, RB-23).
// SPEC-027: o item Pedidos de senha mostra os pendentes (administrador).
export async function Casca({ sessao, ativo, children }: { sessao: Sessao; ativo: ItemMenu; children: React.ReactNode }) {
  const [naoLidas, pedidos, requerimentos, diarios, conta] = await Promise.all([
    naoLidasDoMenu(sessao),
    sessao.perfil === "Administrador" ? contarPedidosPendentes() : 0,
    // SPEC-036: requerimentos pendentes de quem responde; SPEC-039: diários para homologar.
    contarRequerimentosPendentes(sessao),
    sessao.perfil === "Coordenador" ? contarDiariosParaHomologar(sessao.usuarioId) : 0,
    // SPEC-059: o tour aparece no primeiro acesso, até ser concluído ou pulado.
    prisma.usuario.findUnique({ where: { id: sessao.usuarioId }, select: { tourVistoEm: true } }),
  ]);
  const contadores: Partial<Record<ItemMenu, number>> = { notificacoes: naoLidas, pedidos, requerimentos, diarios };
  const itens = MENUS[sessao.perfil].map((item) => (contadores[item.id] ? { ...item, contador: contadores[item.id] } : item));
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[256px_minmax(0,1fr)]">
      {/* SPEC-056 / RNF-07 (WCAG 2.4.1): o primeiro Tab da página leva direto ao conteúdo. */}
      <a href="#conteudo" className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-azul focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Pular para o conteúdo
      </a>
      <NavegacaoCasca itens={itens} ativo={ativo} nome={sessao.nome} perfil={sessao.perfil} />
      <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-6 outline-none sm:px-8 sm:py-8">{children}</main>
      {conta && mostrarTour(conta.tourVistoEm) && <Tour passos={tourDoPerfil(sessao.perfil)} />}
    </div>
  );
}
