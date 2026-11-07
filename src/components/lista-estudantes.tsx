// Lista de estudantes com busca e paginação (SPEC-034/035, RF-43): Administrador (todos) e Coordenador (cursos
// dele). Layout aprovado em docs/layout/prototipo.html#estudantes-lista.
import Link from "next/link";
import { ROTULO_SITUACAO_CURSO, SITUACOES_CURSO, type SituacaoCurso } from "@/domain/secretaria";
import { CampoBusca, FiltroSelecao, Paginacao, type Pagina } from "./busca-paginacao";
import { EstadoVazio } from "./ui";

export type EstudanteDaLista = { id: string; nome: string; email: string; ativo: boolean; curso: string; numeroMatricula: string; situacaoCurso: SituacaoCurso };

const COR_SITUACAO: Record<SituacaoCurso, string> = {
  Ativo: "bg-normal-fundo text-normal",
  Trancado: "bg-slate-200 text-slate-600",
  Transferido: "bg-atencao-fundo text-atencao",
  Cancelado: "bg-risco-fundo text-risco",
  Concluido: "bg-info-fundo text-info",
};
const SIMBOLO: Record<SituacaoCurso, string> = { Ativo: "●", Trancado: "⏸", Transferido: "↗", Cancelado: "✕", Concluido: "✓" };

export function SeloSituacaoCurso({ situacao }: { situacao: SituacaoCurso }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap ${COR_SITUACAO[situacao]}`}>
      {SIMBOLO[situacao]} {ROTULO_SITUACAO_CURSO[situacao]}
    </span>
  );
}

export function ListaEstudantes({ estudantes, pagina, cursos, base }: { estudantes: EstudanteDaLista[]; pagina: Pagina; cursos: { id: string; nome: string }[]; base: string }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <CampoBusca />
        {cursos.length > 1 && <FiltroSelecao parametro="cursoId" rotulo="Curso" todos="Todos os cursos" opcoes={cursos.map((c) => ({ valor: c.id, rotulo: c.nome }))} />}
        <FiltroSelecao parametro="situacao" rotulo="Situação no curso" todos="Todas as situações" opcoes={SITUACOES_CURSO.map((s) => ({ valor: s, rotulo: ROTULO_SITUACAO_CURSO[s] }))} />
      </div>
      {estudantes.length === 0 ? (
        <EstadoVazio>Nenhum estudante encontrado.</EstadoVazio>
      ) : (
        <table className="tabela-responsiva w-full text-[15px]">
          <thead>
            <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
              <th className="pr-2 pb-2.5">Estudante</th>
              <th className="px-2 pb-2.5">Matrícula</th>
              <th className="px-2 pb-2.5">Curso</th>
              <th className="px-2 pb-2.5">Situação no curso</th>
              <th className="pb-2.5 pl-2"><span className="sr-only">Ação</span></th>
            </tr>
          </thead>
          <tbody>
            {estudantes.map((e) => (
              <tr key={e.id} className="border-t border-traco">
                <td data-rotulo="Estudante" className="py-3 pr-2">
                  <span className="block font-medium">{e.nome}</span>
                  <span className="block text-sm break-all text-mudo">{e.email}{e.ativo ? "" : " · conta desativada"}</span>
                </td>
                <td data-rotulo="Matrícula" className="px-2 py-3 tabular-nums">{e.numeroMatricula}</td>
                <td data-rotulo="Curso" className="px-2 py-3">{e.curso}</td>
                <td data-rotulo="Situação no curso" className="px-2 py-3"><SeloSituacaoCurso situacao={e.situacaoCurso} /></td>
                <td data-rotulo="Ação" className="py-3 pl-2 text-right">
                  <Link href={`${base}/${e.id}`} className="font-medium whitespace-nowrap text-azul hover:underline">Abrir ficha →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Paginacao pagina={pagina} unidade="estudante(s)" />
    </div>
  );
}
