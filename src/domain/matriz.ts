// Matriz curricular e integralização (SPEC-037, SPEC-042, RF-45, RF-50, RF-51, RB-35, RB-40, RB-41, OPEN-059,
// OPEN-064). Funções puras: situação de cada disciplina, integralização por carga horária e ciclo de pré-requisitos.
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

export type DisciplinaDaMatriz = { disciplinaId: string; nome: string; cargaHoraria: number; semestre: number | null; obrigatoria: boolean; requisitos: string[] };

export type SituacaoNaMatriz = "Aprovada" | "Aproveitada" | "Cursando" | "Reprovada" | "Bloqueada" | "Pendente";
export const ROTULO_SITUACAO_MATRIZ: Record<SituacaoNaMatriz, string> = {
  Aprovada: "✓ Aprovada",
  Aproveitada: "✓ Aproveitada",
  Cursando: "● Cursando",
  Reprovada: "✕ Reprovada",
  Bloqueada: "🔒 Bloqueada",
  Pendente: "○ Pendente",
};

// O que o estudante já tem em cada disciplina (pelo id da disciplina).
export type HistoricoDoEstudante = { aprovadas: ReadonlySet<string>; aproveitadas: ReadonlySet<string>; cursando: ReadonlySet<string>; reprovadas: ReadonlySet<string> };

export const concluida = (disciplinaId: string, h: HistoricoDoEstudante) => h.aprovadas.has(disciplinaId) || h.aproveitadas.has(disciplinaId);

// SPEC-037 (AC-037-04): Bloqueada quando falta algum pré-requisito; Reprovada só se ainda não aprovada nem cursando.
export function situacaoNaMatriz(d: DisciplinaDaMatriz, h: HistoricoDoEstudante): { situacao: SituacaoNaMatriz; faltam: string[] } {
  if (h.aprovadas.has(d.disciplinaId)) return { situacao: "Aprovada", faltam: [] };
  if (h.aproveitadas.has(d.disciplinaId)) return { situacao: "Aproveitada", faltam: [] };
  if (h.cursando.has(d.disciplinaId)) return { situacao: "Cursando", faltam: [] };
  const faltam = d.requisitos.filter((r) => !concluida(r, h));
  if (faltam.length > 0) return { situacao: "Bloqueada", faltam };
  return { situacao: h.reprovadas.has(d.disciplinaId) ? "Reprovada" : "Pendente", faltam: [] };
}

// RB-35 / INV-037-01: horas obrigatórias aprovadas ou aproveitadas ÷ horas obrigatórias × 100 (sem obrigatória: null).
export function integralizacao(matriz: readonly DisciplinaDaMatriz[], h: HistoricoDoEstudante) {
  const obrigatorias = matriz.filter((d) => d.obrigatoria);
  const horasObrigatorias = obrigatorias.reduce((s, d) => s + d.cargaHoraria, 0);
  const feitas = obrigatorias.filter((d) => concluida(d.disciplinaId, h));
  const horasConcluidas = feitas.reduce((s, d) => s + d.cargaHoraria, 0);
  const faltam = obrigatorias.filter((d) => !concluida(d.disciplinaId, h)).map((d) => d.nome);
  return { horasObrigatorias, horasConcluidas, percentual: horasObrigatorias === 0 ? null : (horasConcluidas / horasObrigatorias) * 100, faltam };
}

// RB-40 / INV-042-02: só conclui com 100%.
export function motivoParaNaoConcluir(i: { percentual: number | null; faltam: string[] }): string | null {
  if (i.percentual === null) return "A matriz do curso não tem disciplina obrigatória: não é possível medir a integralização.";
  if (i.percentual < 100) {
    const lista = i.faltam.slice(0, 5).join(", ") + (i.faltam.length > 5 ? "…" : "");
    return `Concluído só com 100% de integralização (hoje ${Math.floor(i.percentual)}%). Faltam ${i.faltam.length} obrigatória(s): ${lista}.`;
  }
  return null;
}

// RB-41 / INV-037-02: a nova lista de requisitos de "disciplina" cria ciclo se algum requisito alcança "disciplina".
export function criaCiclo(arestas: ReadonlyMap<string, readonly string[]>, disciplina: string, requisitos: readonly string[]): boolean {
  const grafo = new Map(arestas);
  grafo.set(disciplina, requisitos);
  const visitados = new Set<string>();
  const pilha = [...requisitos];
  while (pilha.length > 0) {
    const atual = pilha.pop()!;
    if (atual === disciplina) return true;
    if (visitados.has(atual)) continue;
    visitados.add(atual);
    pilha.push(...(grafo.get(atual) ?? []));
  }
  return false;
}

export function validarLinhaDaMatriz(entrada: Record<string, unknown>, disciplinaId: string, daMatriz: ReadonlySet<string>): Validacao<{ semestre: number | null; obrigatoria: boolean; requisitos: string[] }> {
  const erros: ErrosDeCampo = {};
  const bruto = entrada.semestre;
  const semestre = bruto === null || bruto === undefined || bruto === "" ? null : Number(bruto);
  if (semestre !== null && (!Number.isInteger(semestre) || semestre < 1 || semestre > 10)) erros.semestre = "O semestre vai de 1 a 10 (ou sem semestre).";
  const obrigatoria = entrada.obrigatoria === true || entrada.obrigatoria === "true" || entrada.obrigatoria === "Obrigatoria";
  const lista = Array.isArray(entrada.requisitos) ? entrada.requisitos.filter((r): r is string => typeof r === "string") : [];
  const requisitos = [...new Set(lista)];
  if (requisitos.includes(disciplinaId)) erros.requisitos = "Uma disciplina não pode ser pré-requisito dela mesma.";
  else if (requisitos.some((r) => !daMatriz.has(r))) erros.requisitos = "Pré-requisito precisa ser uma disciplina da matriz deste curso.";
  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados: { semestre, obrigatoria, requisitos } };
}

export function validarAproveitamento(entrada: Record<string, unknown>): Validacao<{ disciplinaId: string; instituicaoOrigem: string; disciplinaOrigem: string; nota: number | null; cargaHoraria: number }> {
  const erros: ErrosDeCampo = {};
  const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const disciplinaId = texto(entrada.disciplinaId);
  const instituicaoOrigem = texto(entrada.instituicaoOrigem);
  const disciplinaOrigem = texto(entrada.disciplinaOrigem);
  const notaTexto = texto(typeof entrada.nota === "number" ? String(entrada.nota) : entrada.nota).replace(",", ".");
  const nota = notaTexto === "" ? null : Number(notaTexto);
  const cargaHoraria = Number(entrada.cargaHoraria);
  if (!disciplinaId) erros.disciplinaId = "Escolha a disciplina da matriz.";
  if (!instituicaoOrigem) erros.instituicaoOrigem = "Informe a instituição de origem.";
  if (!disciplinaOrigem) erros.disciplinaOrigem = "Informe a disciplina de origem.";
  if (nota !== null && (!Number.isFinite(nota) || nota < 0 || nota > 10)) erros.nota = "A nota vai de 0 a 10 (ou vazia).";
  if (!Number.isInteger(cargaHoraria) || cargaHoraria <= 0) erros.cargaHoraria = "A carga horária deve ser um número inteiro maior que zero.";
  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados: { disciplinaId, instituicaoOrigem, disciplinaOrigem, nota, cargaHoraria } };
}
