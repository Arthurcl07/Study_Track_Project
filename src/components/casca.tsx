// Casca autenticada (RNF-06, OPEN-019, OPEN-020): menu lateral do perfil, usuário e Sair.
// A permissão continua sendo verificada no servidor por cada página (INV-001-03); o menu só orienta.
import type { Perfil } from "@/domain/perfil";
import type { Sessao } from "@/server/auth/token";
import type { NomeIcone } from "./icones";
import { NavegacaoCasca } from "./navegacao-casca";

export type ItemMenu = "inicio" | "notas" | "frequencia" | "atividades" | "relatorios" | "disciplinas" | "turmas" | "area";

type Entrada = { id: ItemMenu; rotulo: string; href: string; icone: NomeIcone };

const MENUS: Record<Perfil, Entrada[]> = {
  Estudante: [
    { id: "inicio", rotulo: "Início", href: "/estudante", icone: "inicio" },
    { id: "atividades", rotulo: "Minhas atividades", href: "/estudante/atividades", icone: "calendario" },
  ],
  Professor: [
    { id: "inicio", rotulo: "Início", href: "/professor", icone: "inicio" },
    { id: "notas", rotulo: "Notas e avaliações", href: "/professor/notas", icone: "lapis" },
    { id: "frequencia", rotulo: "Frequência", href: "/professor/frequencia", icone: "check" },
    { id: "atividades", rotulo: "Atividades", href: "/professor/atividades", icone: "calendario" },
    { id: "relatorios", rotulo: "Relatórios", href: "/relatorios", icone: "grafico" },
  ],
  Coordenador: [
    { id: "inicio", rotulo: "Início", href: "/coordenador", icone: "inicio" },
    { id: "disciplinas", rotulo: "Disciplinas", href: "/coordenador/disciplinas", icone: "livro" },
    { id: "turmas", rotulo: "Turmas e estudantes", href: "/coordenador/turmas", icone: "pessoas" },
    { id: "relatorios", rotulo: "Relatórios", href: "/relatorios", icone: "grafico" },
    { id: "area", rotulo: "Área da coordenação", href: "/coordenador/area", icone: "cadeado" },
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
