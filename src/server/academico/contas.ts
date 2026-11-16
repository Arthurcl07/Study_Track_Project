// Casos de uso da gestão de contas (SPEC-010, RF-16, UC-11). Quem pode: Administrador, verificado nas
// rotas pela matriz de autorização (INV-010-02); aqui ficam as regras de cadastro e de desativação.
import { motivoParaNaoDesativar, motivoParaNaoTrocarPerfil, preverProfessores, validarNovaConta } from "@/domain/contas";
import { lerCsv } from "@/domain/importacao";
import { prisma } from "@/server/dados/prisma";
import { gerarSenhaProvisoria } from "./importacao";
import { ehPerfilValido } from "@/domain/perfil";
import { gerarHashSenha } from "@/server/auth/senha";
import * as dados from "@/server/dados/contas";
import { idsQueBatem } from "@/server/dados/busca";
import { buscarCurso } from "@/server/dados/cursos";
import { emailJaCadastrado } from "@/server/dados/estrutura";
import { auditar } from "@/server/dados/auditoria";
import { executarEmTransacao } from "@/server/dados/notas";
import type { Falha, Resultado } from "./cadastros";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });

// SPEC-034 (RF-43): filtro de perfil, busca por nome, e-mail ou matrícula e páginas de 25.
export async function listarContas(perfil: unknown, filtros: { q?: unknown; pagina?: unknown } = {}) {
  return dados.listarContas(ehPerfilValido(perfil) ? perfil : undefined, await idsQueBatem(filtros.q), filtros.pagina);
}

// AC-010-01 / AC-010-02: conta ativa com exatamente o perfil escolhido; senha só como hash (RNF-02).
// AC-010-01 / AC-010-02: conta ativa com exatamente o perfil escolhido; senha só como hash (RNF-02).
// SPEC-019: a criação e o registro de auditoria (sem a senha, INV-019-05) vão na mesma transação.
export async function criarConta(entrada: Record<string, unknown>, autorId: string) {
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
    const senhaHash = await gerarHashSenha(senha);
    return sucesso(
      await executarEmTransacao(async (tx) => {
        const conta = await dados.criarConta({ ...resto, senhaHash }, tx);
        await auditar(tx, {
          autorId,
          acao: "conta.criada",
          descricao: `${conta.nome} (${conta.perfil}${conta.curso ? `, ${conta.curso.nome}` : ""}), com senha provisória`,
          depois: { nome: conta.nome, email: conta.email, perfil: conta.perfil, curso: conta.curso?.nome ?? null },
        });
        return conta;
      }),
    );
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
  return sucesso(await mudarSituacao(contaId, false, administradorId));
}

export async function reativarConta(contaId: string, administradorId: string) {
  if (!(await dados.contaParaDesativar(contaId))) {
    return { ok: false, falha: { tipo: "nao-encontrado", erro: "Conta não encontrada." } } as const;
  }
  return sucesso(await mudarSituacao(contaId, true, administradorId));
}

// ---------------------------------------------------------------- SPEC-053 / RB-48: trocar o perfil

export async function trocarPerfil(contaId: string, entrada: Record<string, unknown>, administradorId: string) {
  const conta = await prisma.usuario.findUnique({
    where: { id: contaId },
    select: { id: true, nome: true, perfil: true, turmasLecionadas: { select: { nome: true }, orderBy: { nome: "asc" } }, cursosCoordenados: { select: { nome: true } }, _count: { select: { matriculas: true } } },
  });
  if (!conta) return { ok: false, falha: { tipo: "nao-encontrado", erro: "Conta não encontrada." } } as const;
  const cursoId = typeof entrada.cursoId === "string" && entrada.cursoId.trim() ? entrada.cursoId.trim() : null;
  const recusa = motivoParaNaoTrocarPerfil(
    { id: conta.id, nome: conta.nome, perfil: conta.perfil, turmas: conta.turmasLecionadas.map((t) => t.nome), cursos: conta.cursosCoordenados.map((c) => c.nome), matriculas: conta._count.matriculas },
    entrada.perfil,
    cursoId,
    administradorId,
  );
  if (recusa) {
    const falha: Falha = recusa.tipo === "conflito" ? { tipo: "conflito", erro: recusa.erro } : { tipo: "invalido", erros: { perfil: recusa.erro } };
    return { ok: false, falha } as const;
  }
  const novo = entrada.perfil as typeof conta.perfil;
  const curso = novo === "Estudante" ? await buscarCurso(cursoId!) : null;
  if (novo === "Estudante" && !curso) return { ok: false, falha: { tipo: "invalido", erros: { cursoId: "Curso inexistente." } } } as const;
  return sucesso(
    await executarEmTransacao(async (tx) => {
      // Saindo de Estudante (sem matrícula, RB-48): a ficha vai junto; entrando, o gatilho do banco cria a ficha.
      if (conta.perfil === "Estudante") await tx.fichaEstudante.deleteMany({ where: { estudanteId: conta.id } });
      const atualizada = await tx.usuario.update({ where: { id: conta.id }, data: { perfil: novo, cursoId: novo === "Estudante" ? cursoId : null }, select: { id: true, nome: true, perfil: true } });
      await auditar(tx, {
        autorId: administradorId,
        acao: "conta.perfil",
        descricao: `${conta.nome}: ${conta.perfil} → ${novo}${curso ? ` (${curso.nome})` : ""}`,
        antes: { perfil: conta.perfil },
        depois: { perfil: novo, curso: curso?.nome ?? null },
      });
      return atualizada;
    }),
  );
}

// ---------------------------------------------------------------- SPEC-053: importar professores por CSV

const TAMANHO_MAXIMO_CSV = 200_000;

// Prévia sem gravar; confirmar grava tudo ou nada (INV-053-02) com senhas provisórias (RB-15, INV-053-03),
// mostradas uma única vez na resposta.
export async function importarProfessores(entrada: Record<string, unknown>, administradorId: string) {
  const csv = typeof entrada.csv === "string" ? entrada.csv : "";
  if (!csv.trim()) return { ok: false, falha: { tipo: "invalido", erros: { csv: "Escolha o arquivo CSV." } } } as const;
  if (csv.length > TAMANHO_MAXIMO_CSV) return { ok: false, falha: { tipo: "invalido", erros: { csv: "Arquivo grande demais (máximo de 200 KB)." } } } as const;
  const leitura = lerCsv(csv);
  if (!leitura.ok) return { ok: false, falha: { tipo: "invalido", erros: { csv: leitura.erro.replace("estudante", "professor") } } } as const;
  const existentes = new Set((await prisma.usuario.findMany({ where: { email: { in: leitura.linhas.map((l) => l.email) } }, select: { email: true } })).map((u) => u.email));
  const linhas = preverProfessores(leitura.linhas, existentes);
  const erros = linhas.filter((l) => l.erro).length;
  if (entrada.confirmar !== true) return sucesso({ gravado: false, linhas, novos: linhas.length - erros, erros, senhas: [] as { nome: string; email: string; senha: string }[] });
  if (erros > 0) return { ok: false, falha: { tipo: "invalido", erros: { csv: `A planilha tem ${erros} linha(s) com erro. Corrija e envie de novo: nada foi gravado.` } } } as const;
  const novas = await Promise.all(linhas.map(async (l) => { const senha = gerarSenhaProvisoria(); return { nome: l.nome, email: l.email, senha, senhaHash: await gerarHashSenha(senha) }; }));
  await prisma.$transaction(async (tx) => {
    await tx.usuario.createMany({ data: novas.map((n) => ({ nome: n.nome, email: n.email, senhaHash: n.senhaHash, perfil: "Professor" as const, trocarSenha: true })) });
    await auditar(tx, { autorId: administradorId, acao: "contas.importadas", descricao: `${novas.length} professor(es) importado(s) por planilha, com senha provisória`, depois: { emails: novas.map((n) => n.email) } });
  }, { timeout: 60_000 });
  return sucesso({ gravado: true, linhas, novos: novas.length, erros: 0, senhas: novas.map(({ nome, email, senha }) => ({ nome, email, senha })) });
}

// SPEC-019: desativação e reativação com o registro de auditoria na mesma transação.
function mudarSituacao(contaId: string, ativo: boolean, autorId: string) {
  return executarEmTransacao(async (tx) => {
    const conta = await dados.definirAtivo(contaId, ativo, tx);
    await auditar(tx, {
      autorId,
      acao: ativo ? "conta.reativada" : "conta.desativada",
      descricao: `${conta.nome} (${conta.perfil})`,
      antes: { ativo: !ativo },
      depois: { ativo },
    });
    return conta;
  });
}
