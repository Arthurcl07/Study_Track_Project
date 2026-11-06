// Caso de uso "Consultar auditoria" (SPEC-019, RF-28, UC-18). Coordenador: só ações acadêmicas dos cursos que
// coordena (INV-019-03); Administrador: só ações administrativas (INV-019-04, RB-13). Escopo dentro da query.
import { REGISTROS_POR_PAGINA, acoesDoGrupo, gruposDaCategoria, paginaValida, rotuloDaAcao, type CategoriaAuditoria } from "@/domain/auditoria";
import type { Sessao } from "@/server/auth/token";
import { listarRegistros } from "@/server/dados/auditoria";

export async function consultarAuditoria(sessao: Sessao, filtros: { grupo?: string | null; pagina?: unknown }) {
  const categoria: CategoriaAuditoria | null = sessao.perfil === "Coordenador" ? "Academica" : sessao.perfil === "Administrador" ? "Administrativa" : null;
  if (!categoria) return null;
  const escopo = categoria === "Academica" ? { categoria, curso: { coordenadorId: sessao.usuarioId } } : { categoria };
  const grupos = gruposDaCategoria(categoria);
  const grupo = grupos.includes(filtros.grupo ?? "") ? filtros.grupo! : null;
  const pagina = paginaValida(filtros.pagina);
  const { total, registros } = await listarRegistros(escopo, acoesDoGrupo(categoria, grupo), pagina);
  return {
    categoria,
    grupos,
    grupo,
    pagina,
    paginas: Math.max(1, Math.ceil(total / REGISTROS_POR_PAGINA)),
    total,
    registros: registros.map((r) => ({
      id: r.id,
      acao: r.acao,
      rotulo: rotuloDaAcao(r.acao),
      descricao: r.descricao,
      autor: r.autor.nome,
      curso: r.curso?.nome ?? null,
      antes: r.antes,
      depois: r.depois,
      registradoEm: r.registradoEm.toISOString(),
    })),
  };
}

export type ConsultaAuditoria = NonNullable<Awaited<ReturnType<typeof consultarAuditoria>>>;
