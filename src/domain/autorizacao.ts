// Regra de autorização por perfil (RF-02, RB-01, ADR-003, DA-01).
// Nega por padrão: recurso desconhecido ou perfil inválido nunca recebe acesso.
import { ehPerfilValido, type Perfil } from "./perfil";

export const RECURSOS = {
  painelEstudante: "painel-estudante",
  painelProfessor: "painel-professor",
  painelCoordenador: "painel-coordenador",
  // Função exclusiva de Coordenador usada para demonstrar a negação de acesso (AC-001-03).
  areaCoordenacao: "area-coordenacao",
} as const;

export type Recurso = (typeof RECURSOS)[keyof typeof RECURSOS];

const PERFIS_AUTORIZADOS: Readonly<Record<Recurso, readonly Perfil[]>> = {
  "painel-estudante": ["Estudante"],
  "painel-professor": ["Professor"],
  "painel-coordenador": ["Coordenador"],
  "area-coordenacao": ["Coordenador"],
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
