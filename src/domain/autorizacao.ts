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
};

// Destino do redirecionamento após login (SPEC-001, fluxo principal passo 4).
export function painelDoPerfil(perfil: Perfil): string {
  return PAINEL_POR_PERFIL[perfil];
}
