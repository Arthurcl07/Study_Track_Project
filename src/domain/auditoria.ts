// Ações, categorias e textos da auditoria (SPEC-019, RF-28, RB-22, OPEN-039). Funções puras: sem Next.js nem Prisma.

export type CategoriaAuditoria = "Administrativa" | "Academica";

// Grupo = "tipo de ação" do filtro da tela.
export const ACOES = {
  // Administrativas: só o administrador vê (INV-019-04).
  "conta.criada": { rotulo: "Conta criada", categoria: "Administrativa", grupo: "Contas" },
  "conta.desativada": { rotulo: "Conta desativada", categoria: "Administrativa", grupo: "Contas" },
  "conta.reativada": { rotulo: "Conta reativada", categoria: "Administrativa", grupo: "Contas" },
  "curso.criado": { rotulo: "Curso criado", categoria: "Administrativa", grupo: "Cursos" },
  "curso.coordenacao": { rotulo: "Coordenação trocada", categoria: "Administrativa", grupo: "Cursos" },
  "periodo.criado": { rotulo: "Período criado", categoria: "Administrativa", grupo: "Períodos" },
  "periodo.encerrado": { rotulo: "Período encerrado", categoria: "Administrativa", grupo: "Períodos" },
  "periodo.reaberto": { rotulo: "Período reaberto", categoria: "Administrativa", grupo: "Períodos" },
  // SPEC-026, SPEC-027 e SPEC-033 (Nível 1).
  "conta.editada": { rotulo: "Conta editada", categoria: "Administrativa", grupo: "Contas" },
  "senha.aprovada": { rotulo: "Pedido de senha aprovado", categoria: "Administrativa", grupo: "Pedidos de senha" },
  "senha.recusada": { rotulo: "Pedido de senha recusado", categoria: "Administrativa", grupo: "Pedidos de senha" },
  "instituicao.alterada": { rotulo: "Dados da instituição alterados", categoria: "Administrativa", grupo: "Instituição" },
  // SPEC-038, SPEC-040, SPEC-041 e SPEC-043 (Nível 3).
  "periodo.rematricula": { rotulo: "Janela de rematrícula", categoria: "Administrativa", grupo: "Períodos" },
  "calendario.evento": { rotulo: "Evento do calendário", categoria: "Administrativa", grupo: "Calendário e salas" },
  "sala.alterada": { rotulo: "Sala", categoria: "Administrativa", grupo: "Calendário e salas" },
  "censo.exportado": { rotulo: "Exportação do Censo", categoria: "Administrativa", grupo: "Exportações" },
  // Acadêmicas: só o coordenador do curso vê (INV-019-03).
  "disciplina.criada": { rotulo: "Disciplina criada", categoria: "Academica", grupo: "Disciplinas e turmas" },
  "grade.adicionada": { rotulo: "Disciplina adicionada à grade", categoria: "Academica", grupo: "Disciplinas e turmas" },
  "turma.criada": { rotulo: "Turma criada", categoria: "Academica", grupo: "Disciplinas e turmas" },
  "turma.professor": { rotulo: "Professor trocado", categoria: "Academica", grupo: "Disciplinas e turmas" },
  "estudante.cadastrado": { rotulo: "Estudante cadastrado", categoria: "Academica", grupo: "Matrículas e importação" },
  "estudante.matriculado": { rotulo: "Estudante matriculado", categoria: "Academica", grupo: "Matrículas e importação" },
  importacao: { rotulo: "Importação", categoria: "Academica", grupo: "Matrículas e importação" },
  "avaliacao.criada": { rotulo: "Avaliação criada", categoria: "Academica", grupo: "Notas" },
  "nota.lancada": { rotulo: "Nota lançada", categoria: "Academica", grupo: "Notas" },
  "nota.alterada": { rotulo: "Nota alterada", categoria: "Academica", grupo: "Notas" },
  "chamada.registrada": { rotulo: "Chamada registrada", categoria: "Academica", grupo: "Chamada" },
  "chamada.corrigida": { rotulo: "Chamada corrigida", categoria: "Academica", grupo: "Chamada" },
  "atividade.criada": { rotulo: "Atividade criada", categoria: "Academica", grupo: "Atividades e entregas" },
  "entrega.registrada": { rotulo: "Entrega registrada", categoria: "Academica", grupo: "Atividades e entregas" },
  "entrega.desfeita": { rotulo: "Entrega desfeita", categoria: "Academica", grupo: "Atividades e entregas" },
  "plano.criado": { rotulo: "Plano criado", categoria: "Academica", grupo: "Planos de recuperação" },
  "plano.encerrado": { rotulo: "Plano encerrado", categoria: "Academica", grupo: "Planos de recuperação" },
  "plano.item": { rotulo: "Item de plano marcado", categoria: "Academica", grupo: "Planos de recuperação" },
  // SPEC-025: comunicados publicados e apagados.
  "comunicado.publicado": { rotulo: "Comunicado publicado", categoria: "Academica", grupo: "Comunicados" },
  "comunicado.apagado": { rotulo: "Comunicado apagado", categoria: "Academica", grupo: "Comunicados" },
  // SPEC-026: correção de cadastros (OPEN-048).
  "disciplina.editada": { rotulo: "Disciplina editada", categoria: "Academica", grupo: "Disciplinas e turmas" },
  "disciplina.excluida": { rotulo: "Disciplina excluída", categoria: "Academica", grupo: "Disciplinas e turmas" },
  "turma.editada": { rotulo: "Turma editada", categoria: "Academica", grupo: "Disciplinas e turmas" },
  "turma.excluida": { rotulo: "Turma excluída", categoria: "Academica", grupo: "Disciplinas e turmas" },
  "matricula.excluida": { rotulo: "Estudante tirado da turma", categoria: "Academica", grupo: "Matrículas e importação" },
  // SPEC-044: trancamento de disciplina deferido pela secretaria.
  "matricula.trancada": { rotulo: "Disciplina trancada", categoria: "Academica", grupo: "Secretaria" },
  "avaliacao.editada": { rotulo: "Avaliação editada", categoria: "Academica", grupo: "Notas" },
  "avaliacao.excluida": { rotulo: "Avaliação excluída", categoria: "Academica", grupo: "Notas" },
  "atividade.editada": { rotulo: "Atividade editada", categoria: "Academica", grupo: "Atividades e entregas" },
  "atividade.excluida": { rotulo: "Atividade excluída", categoria: "Academica", grupo: "Atividades e entregas" },
  "aula.editada": { rotulo: "Data da aula alterada", categoria: "Academica", grupo: "Chamada" },
  "aula.excluida": { rotulo: "Aula excluída", categoria: "Academica", grupo: "Chamada" },
  // SPEC-030 a SPEC-033: secretaria (OPEN-052 a OPEN-055).
  "turma.copiada": { rotulo: "Turma copiada (virada de semestre)", categoria: "Academica", grupo: "Secretaria" },
  "estudante.situacao": { rotulo: "Situação no curso alterada", categoria: "Academica", grupo: "Secretaria" },
  "estudante.curso": { rotulo: "Curso do estudante trocado", categoria: "Academica", grupo: "Secretaria" },
  "abono.registrado": { rotulo: "Abono de faltas registrado", categoria: "Academica", grupo: "Secretaria" },
  "abono.excluido": { rotulo: "Abono de faltas excluído", categoria: "Academica", grupo: "Secretaria" },
  "ficha.alterada": { rotulo: "Ficha do estudante alterada", categoria: "Academica", grupo: "Secretaria" },
  // SPEC-036 a SPEC-042 (Nível 3).
  "aproveitamento.registrado": { rotulo: "Aproveitamento registrado", categoria: "Academica", grupo: "Secretaria" },
  "aproveitamento.excluido": { rotulo: "Aproveitamento excluído", categoria: "Academica", grupo: "Secretaria" },
  "matriz.alterada": { rotulo: "Matriz do curso alterada", categoria: "Academica", grupo: "Disciplinas e turmas" },
  "turma.horario": { rotulo: "Horário da turma", categoria: "Academica", grupo: "Disciplinas e turmas" },
  "turma.vagas": { rotulo: "Vagas da turma", categoria: "Academica", grupo: "Disciplinas e turmas" },
  "rematricula.feita": { rotulo: "Rematrícula pelo estudante", categoria: "Academica", grupo: "Matrículas e importação" },
  "rematricula.cancelada": { rotulo: "Rematrícula cancelada pelo estudante", categoria: "Academica", grupo: "Matrículas e importação" },
  "diario.fechado": { rotulo: "Diário fechado", categoria: "Academica", grupo: "Diário" },
  "diario.homologado": { rotulo: "Diário homologado", categoria: "Academica", grupo: "Diário" },
  "diario.devolvido": { rotulo: "Diário devolvido", categoria: "Academica", grupo: "Diário" },
  "diario.reaberto": { rotulo: "Diário reaberto", categoria: "Academica", grupo: "Diário" },
  "requerimento.aberto": { rotulo: "Requerimento aberto", categoria: "Academica", grupo: "Requerimentos" },
  "requerimento.respondido": { rotulo: "Requerimento respondido", categoria: "Academica", grupo: "Requerimentos" },
} as const satisfies Record<string, { rotulo: string; categoria: CategoriaAuditoria; grupo: string }>;

export type AcaoAuditoria = keyof typeof ACOES;

export const REGISTROS_POR_PAGINA = 50;

export function rotuloDaAcao(acao: string): string {
  return (ACOES as Record<string, { rotulo: string }>)[acao]?.rotulo ?? acao;
}

// Grupos (tipos de ação) de uma categoria, na ordem em que aparecem acima.
export function gruposDaCategoria(categoria: CategoriaAuditoria): string[] {
  return [...new Set(Object.values(ACOES).filter((a) => a.categoria === categoria).map((a) => a.grupo))];
}

// Ações de um grupo da categoria; grupo desconhecido = todas as da categoria.
export function acoesDoGrupo(categoria: CategoriaAuditoria, grupo?: string | null): string[] {
  const daCategoria = Object.entries(ACOES).filter(([, a]) => a.categoria === categoria);
  const doGrupo = daCategoria.filter(([, a]) => a.grupo === grupo);
  return (doGrupo.length > 0 ? doGrupo : daCategoria).map(([acao]) => acao);
}

// Valores no formato brasileiro, com uma casa: 5 → "5,0"; 6.5 → "6,5"; vazio → "—".
export function numeroBR(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? "—" : valor.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// "AAAA-MM-DD" → "DD/MM/AAAA".
export function dataBR(texto: string): string {
  const [ano, mes, dia] = texto.split("-");
  return `${dia}/${mes}/${ano}`;
}

const CHAVES_SECRETAS = new Set(["senha", "senhaHash", "senhaProvisoria"]);

// INV-019-05: nenhum registro guarda senha nem hash, em qualquer nível do objeto.
export function semSegredos<T>(valor: T): T {
  if (Array.isArray(valor)) return valor.map(semSegredos) as T;
  if (valor && typeof valor === "object" && !(valor instanceof Date)) {
    return Object.fromEntries(Object.entries(valor).filter(([chave]) => !CHAVES_SECRETAS.has(chave)).map(([k, v]) => [k, semSegredos(v)])) as T;
  }
  return valor;
}

export function paginaValida(pagina: unknown): number {
  const n = Number(pagina);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}
