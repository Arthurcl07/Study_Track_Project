// Regra de autorização por perfil (RF-02, RB-01, ADR-003, DA-01).
// Nega por padrão: recurso desconhecido ou perfil inválido nunca recebe acesso.
import { ehPerfilValido, type Perfil } from "./perfil";

export const RECURSOS = {
  painelEstudante: "painel-estudante",
  painelProfessor: "painel-professor",
  painelCoordenador: "painel-coordenador",
  // Função exclusiva de Coordenador usada para demonstrar a negação de acesso (AC-001-03).
  areaCoordenacao: "area-coordenacao",
  // SPEC-002 (OPEN-001): cadastro de disciplina, turma, estudante e matrícula.
  cadastroAcademico: "cadastro-academico",
  // SPEC-002: consulta de turmas; o recorte por escopo é feito na própria query (ADR-003).
  consultaTurmas: "consulta-turmas",
  // SPEC-003: consulta de indicadores; o recorte por escopo é feito na própria query (ADR-003).
  consultaIndicadores: "consulta-indicadores",
  // SPEC-004 (OPEN-001, OPEN-017): cadastro de avaliação e lançamento/alteração de nota pelo professor;
  // a turma lecionada é conferida na própria query (ADR-003, RB-03).
  registroDesempenho: "registro-desempenho",
  // SPEC-005 (OPEN-001, OPEN-003): frequência, atividades e entregas registradas pelo professor.
  registroFrequenciaAtividades: "registro-frequencia-atividades",
  // SPEC-005 / RF-09: consulta de atividades com status de entrega (Estudante: só a própria; RB-02).
  consultaAtividades: "consulta-atividades",
  // SPEC-006 / RF-12: alertas só para o estudante e o professor responsável (INV-006-03).
  consultaAlertas: "consulta-alertas",
  // SPEC-008 (RF-13, RF-14): dashboard da turma e plano de recuperação, só pelo professor responsável.
  planoRecuperacao: "plano-recuperacao",
  // SPEC-009 (RF-15): relatório para Professor (turmas que leciona) e Coordenador (turmas sob responsabilidade).
  relatorios: "relatorios",
  // SPEC-010 (RF-16): gestão de contas, só pelo Administrador. Nenhum recurso acadêmico inclui o
  // Administrador (RB-13, INV-010-03): ele cai no "nega por padrão" de todos os outros.
  gestaoContas: "gestao-contas",
  // SPEC-013 (RF-20): histórico de notas para Professor (turmas que leciona) e Coordenador (sob responsabilidade).
  historicoNotas: "historico-notas",
  // SPEC-015 (RF-22, OPEN-034): cursos e coordenação, só pelo Administrador. É estrutura, não dado acadêmico.
  gestaoCursos: "gestao-cursos",
  // SPEC-016 (RF-25): dashboard do Administrador, só com contas e estrutura dos cursos (RB-13).
  painelAdministrador: "painel-administrador",
  // SPEC-017 (RF-26, OPEN-040): períodos letivos, só pelo Administrador. É estrutura, não dado acadêmico.
  gestaoPeriodos: "gestao-periodos",
  // SPEC-019 (RF-28, OPEN-039): auditoria administrativa (Administrador) e acadêmica (Coordenador, cursos dele).
  auditoriaAdministrativa: "auditoria-administrativa",
  auditoriaAcademica: "auditoria-academica",
  // SPEC-020 (RF-29, OPEN-038): boletim e histórico — estudante (os próprios) e coordenador (cursos dele).
  documentos: "documentos",
  // SPEC-022 (RF-31, OPEN-043): notificações só para estudante e professor (RB-23).
  notificacoes: "notificacoes",
  // SPEC-025 (RF-34, OPEN-047): mural para estudante, professor e coordenador; publicar só professor e coordenador.
  comunicados: "comunicados",
  // SPEC-027 (RF-36): pedidos de redefinição de senha, só pelo Administrador.
  pedidosSenha: "pedidos-senha",
  // SPEC-035 (OPEN-057, RB-13): secretaria acadêmica no perfil Administrador — ficha, situação no curso, abono,
  // virada de semestre e dados da instituição. Não inclui nenhum recurso de trabalho acadêmico.
  secretaria: "secretaria",
  // SPEC-033 / SPEC-034 (RB-33): lista de estudantes e ficha — Administrador (todos), Coordenador (cursos dele).
  // O próprio estudante vê a ficha pela página Documentos.
  estudantes: "estudantes",
} as const;

export type Recurso = (typeof RECURSOS)[keyof typeof RECURSOS];

const PERFIS_AUTORIZADOS: Readonly<Record<Recurso, readonly Perfil[]>> = {
  "painel-estudante": ["Estudante"],
  "painel-professor": ["Professor"],
  "painel-coordenador": ["Coordenador"],
  "area-coordenacao": ["Coordenador"],
  "cadastro-academico": ["Coordenador"],
  "consulta-turmas": ["Estudante", "Professor", "Coordenador"],
  "consulta-indicadores": ["Estudante", "Professor", "Coordenador"],
  "registro-desempenho": ["Professor"],
  "registro-frequencia-atividades": ["Professor"],
  "consulta-atividades": ["Estudante", "Professor"],
  "consulta-alertas": ["Estudante", "Professor"],
  "plano-recuperacao": ["Professor"],
  relatorios: ["Professor", "Coordenador"],
  "gestao-contas": ["Administrador"],
  "historico-notas": ["Professor", "Coordenador"],
  "gestao-cursos": ["Administrador"],
  "painel-administrador": ["Administrador"],
  "gestao-periodos": ["Administrador"],
  "auditoria-administrativa": ["Administrador"],
  "auditoria-academica": ["Coordenador"],
  // SPEC-035: a secretaria (Administrador) emite documentos de qualquer estudante.
  documentos: ["Estudante", "Coordenador", "Administrador"],
  notificacoes: ["Estudante", "Professor"],
  comunicados: ["Estudante", "Professor", "Coordenador"],
  "pedidos-senha": ["Administrador"],
  secretaria: ["Administrador"],
  estudantes: ["Administrador", "Coordenador"],
};

export function podeAcessar(perfil: unknown, recurso: unknown): boolean {
  if (!ehPerfilValido(perfil)) return false;
  if (typeof recurso !== "string" || !Object.hasOwn(PERFIS_AUTORIZADOS, recurso)) return false;
  return PERFIS_AUTORIZADOS[recurso as Recurso].includes(perfil);
}

const PAINEL_POR_PERFIL: Readonly<Record<Perfil, string>> = {
  Estudante: "/estudante",
  Professor: "/professor",
  Coordenador: "/coordenador",
  // SPEC-016 (RF-24): todo perfil abre no próprio dashboard.
  Administrador: "/admin",
};

// Destino do redirecionamento após login (SPEC-001, fluxo principal passo 4).
export function painelDoPerfil(perfil: Perfil): string {
  return PAINEL_POR_PERFIL[perfil];
}
