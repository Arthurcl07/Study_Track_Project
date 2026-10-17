import Link from "next/link";
import { Casca } from "@/components/casca";
import { Icone, type NomeIcone } from "@/components/icones";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { listarDisciplinas, listarTurmasDoEscopo } from "@/server/dados/estrutura";

// SPEC-002 — layout aprovado em docs/layout/prototipo.html#coordenador-inicio.
// Os números saem das mesmas consultas com escopo das outras telas (ADR-003).
export default async function PainelCoordenador() {
  const sessao = await exigirAcessoPagina(RECURSOS.painelCoordenador);
  const [disciplinas, turmas] = await Promise.all([listarDisciplinas(), listarTurmasDoEscopo(sessao)]);
  const estudantes = new Set(turmas.flatMap((t) => (t.estudantes ?? []).map((e) => e.id)));

  const atalhos: { rotulo: string; valor: number; acao: string; href: string; icone: NomeIcone }[] = [
    { rotulo: "Disciplinas", valor: disciplinas.length, acao: "Gerenciar disciplinas", href: "/coordenador/disciplinas", icone: "livro" },
    { rotulo: "Turmas sob sua responsabilidade", valor: turmas.length, acao: "Ver turmas", href: "/coordenador/turmas", icone: "pessoas" },
    { rotulo: "Estudantes matriculados", valor: estudantes.size, acao: "Ver turmas", href: "/coordenador/turmas", icone: "pessoas" },
  ];

  return (
    <Casca sessao={sessao} ativo="inicio">
      <CabecalhoPagina titulo={`Olá, ${sessao.nome.split(" ")[0]}`} subtitulo="Visão geral das turmas sob sua responsabilidade." />
      <div className="grid gap-4 sm:grid-cols-3">
        {atalhos.map((a) => (
          <Link
            key={a.rotulo}
            href={a.href}
            className="group rounded-2xl border border-traco bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-colors hover:border-azul"
          >
            <span className="flex items-center gap-2 text-sm text-mudo">
              <Icone nome={a.icone} className="h-4 w-4" />
              {a.rotulo}
            </span>
            <strong className="mt-1 block text-3xl font-bold tabular-nums">{a.valor}</strong>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-azul">
              {a.acao}
              <Icone nome="seta" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </Casca>
  );
}
