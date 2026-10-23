// Casos de uso da gestão de contas (SPEC-010, RF-16, UC-11). Quem pode: Administrador, verificado nas
// rotas pela matriz de autorização (INV-010-02); aqui ficam as regras de cadastro e de desativação.
import { motivoParaNaoDesativar, validarNovaConta } from "@/domain/contas";
import { ehPerfilValido } from "@/domain/perfil";
import { gerarHashSenha } from "@/server/auth/senha";
import * as dados from "@/server/dados/contas";
import { buscarCurso } from "@/server/dados/cursos";
import { emailJaCadastrado } from "@/server/dados/estrutura";
import type { Resultado } from "./cadastros";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });

export function listarContas(perfil: unknown) {
  return dados.listarContas(ehPerfilValido(perfil) ? perfil : undefined);
}

// AC-010-01 / AC-010-02: conta ativa com exatamente o perfil escolhido; senha só como hash (RNF-02).
export async function criarConta(entrada: Record<string, unknown>) {
  const validacao = validarNovaConta(entrada);
  if (!validacao.ok) return { ok: false, falha: { tipo: "invalido", erros: validacao.erros } } as const;
  const { senha, ...resto } = validacao.dados;
  const emailEmUso = { ok: false, falha: { tipo: "invalido", erros: { email: "Já existe uma conta com este e-mail." } } } as const;
  if (await emailJaCadastrado(resto.email)) return emailEmUso;
  // AC-015-12: o curso do estudante precisa existir.
  if (resto.cursoId && !(await buscarCurso(resto.cursoId))) {
    return { ok: false, falha: { tipo: "invalido", erros: { cursoId: "Curso inexistente." } } } as const;
  }
  try {
    return sucesso(await dados.criarConta({ ...resto, senhaHash: await gerarHashSenha(senha) }));
  } catch (erro) {
    // Corrida entre dois cadastros com o mesmo e-mail: a constraint única do banco decide.
    if ((erro as { code?: string }).code === "P2002") return emailEmUso;
    throw erro;
  }
}

// RB-14 / INV-010-06 / INV-015-09: não desativa a si mesmo, professor responsável por turma nem coordenador de curso.
// Nada é apagado (INV-010-05).
export async function desativarConta(contaId: string, administradorId: string) {
  const alvo = await dados.contaParaDesativar(contaId);
  if (!alvo) return { ok: false, falha: { tipo: "nao-encontrado", erro: "Conta não encontrada." } } as const;
  const motivo = motivoParaNaoDesativar(alvo, administradorId);
  if (motivo) return { ok: false, falha: { tipo: "conflito", erro: motivo } } as const;
  return sucesso(await dados.definirAtivo(contaId, false));
}

export async function reativarConta(contaId: string) {
  if (!(await dados.contaParaDesativar(contaId))) {
    return { ok: false, falha: { tipo: "nao-encontrado", erro: "Conta não encontrada." } } as const;
  }
  return sucesso(await dados.definirAtivo(contaId, true));
}
