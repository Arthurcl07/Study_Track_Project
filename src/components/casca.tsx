// Casca autenticada (RNF-06, OPEN-019, OPEN-020): menu lateral do perfil, usuário e Sair.
// A permissão continua sendo verificada no servidor por cada página (INV-001-03); o menu só orienta.
import type { Perfil } from "@/domain/perfil";
import type { Sessao } from "@/server/auth/token";
import type { NomeIcone } from "./icones";
import { NavegacaoCasca } from "./navegacao-casca";

export type ItemMenu =
  | "inicio" | "notas" | "frequencia" | "atividades" | "relatorios" | "disciplinas" | "turmas" | "area" | "contas" | "cursos" | "senha" | "historico"
  | "periodos" | "auditoria" | "documentos" | "notificacoes";

type Entrada = { id: ItemMenu; rotulo: string; href: string; icone: NomeIcone };

const MENUS: Record<Perfil, Entrada[]> = {
  Estudante: [
    { id: "inicio", rotulo: "Dashboard", href: "/estudante", icone: "inicio" },
    { id: "atividades", rotulo: "Minhas atividades", href: "/estudante/atividades", icone: "calendario" },
    // SPEC-020 e SPEC-022.
    { id: "documentos", rotulo: "Documentos", href: "/estudante/documentos", icone: "documento" },
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
    { id: "notificacoes", rotulo: "Notificações", href: "/notificacoes", icone: "sino" },
  ],
  Coordenador: [
    { id: "inicio", rotulo: "Dashboard", href: "/coordenador", icone: "inicio" },
    { id: "disciplinas", rotulo: "Disciplinas", href: "/coordenador/disciplinas", icone: "livro" },
    { id: "turmas", rotulo: "Turmas e estudantes", href: "/coordenador/turmas", icone: "pessoas" },
    { id: "relatorios", rotulo: "Relatórios", href: "/relatorios", icone: "grafico" },
    { id: "historico", rotulo: "Histórico de notas", href: "/historico-notas", icone: "relogio" },
    // SPEC-019: ações acadêmicas dos cursos que coordena.
    { id: "auditoria", rotulo: "Auditoria", href: "/coordenador/auditoria", icone: "escudo" },
    { id: "area", rotulo: "Área da coordenação", href: "/coordenador/area", icone: "cadeado" },
  ],
  // SPEC-010 / RB-13: o Administrador só gerencia contas e, desde a SPEC-015, cursos; o dashboard é da SPEC-016.
  Administrador: [
    { id: "inicio", rotulo: "Dashboard", href: "/admin", icone: "inicio" },
    { id: "contas", rotulo: "Contas", href: "/admin/contas", icone: "pessoas" },
    { id: "cursos", rotulo: "Cursos", href: "/admin/cursos", icone: "capelo" },
    // SPEC-017 e SPEC-019: períodos letivos e auditoria administrativa.
    { id: "periodos", rotulo: "Períodos letivos", href: "/admin/periodos", icone: "calendario" },
    { id: "auditoria", rotulo: "Auditoria", href: "/admin/auditoria", icone: "escudo" },
  ],
};

export function Casca({ sessao, ativo, children }: { sessao: Sessao; ativo: ItemMenu; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[256px_minmax(0,1fr)]">
      <NavegacaoCasca itens={MENUS[sessao.perfil]} ativo={ativo} nome={sessao.nome} perfil={sessao.perfil} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
