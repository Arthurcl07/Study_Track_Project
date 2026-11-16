// Importação do sistema anterior (SPEC-058, RF-64, RB-49, OPEN-075). Funções puras: sem Next.js nem Prisma.
// Duas planilhas: alunos (nome;email;curso;matricula;cpf;nascimento;telefone) e histórico
// (matricula;disciplina;periodo;media;frequencia). Qualquer linha com erro recusa tudo (INV-058-01).
import { dataValida } from "./calendario";
import { campos } from "./importacao";
import { cpfValido, formatarCpf } from "./secretaria";
import type { RegraAvaliacao } from "./situacao-academica";

export const MAXIMO_LINHAS_ANTERIOR = 5000;
export const COLUNAS_ALUNOS = ["nome", "email", "curso", "matricula", "cpf", "nascimento", "telefone"] as const;
export const COLUNAS_HISTORICO = ["matricula", "disciplina", "periodo", "media", "frequencia"] as const;
export const MODELO_ALUNOS = "nome;email;curso;matricula;cpf;nascimento;telefone\r\nPaulo Reis;paulo.reis@exemplo.test;Administração;20190412;529.982.247-25;2001-05-14;(11) 98888-0000\r\n";
export const MODELO_HISTORICO = "matricula;disciplina;periodo;media;frequencia\r\n20190412;Fundamentos de Administração;2024/1;7,5;92\r\n";

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizar = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

export type LinhaLida = { linha: number; valores: Record<string, string> };

// Cabeçalho obrigatório com as colunas pedidas (sem acento e sem diferenciar maiúsculas), ";" ou ",", BOM opcional.
export function lerPlanilha(texto: string, colunas: readonly string[], nome: string): { ok: true; linhas: LinhaLida[] } | { ok: false; erro: string } {
  const linhas = texto.replace(/^﻿/, "").split(/\r?\n/);
  const inicio = linhas.findIndex((l) => l.trim() !== "");
  if (inicio < 0) return { ok: false, erro: `A planilha de ${nome} está vazia.` };
  const separador = linhas[inicio].includes(";") ? ";" : ",";
  const cabecalho = campos(linhas[inicio], separador).map(normalizar);
  const faltam = colunas.filter((c) => !cabecalho.includes(c));
  if (faltam.length > 0) return { ok: false, erro: `A planilha de ${nome} precisa das colunas ${colunas.join(";")} (faltam: ${faltam.join(", ")}).` };
  const lidas: LinhaLida[] = [];
  for (let i = inicio + 1; i < linhas.length; i++) {
    if (linhas[i].trim() === "") continue;
    const c = campos(linhas[i], separador);
    lidas.push({ linha: i + 1, valores: Object.fromEntries(colunas.map((col) => [col, (c[cabecalho.indexOf(col)] ?? "").trim()])) });
  }
  if (lidas.length === 0) return { ok: false, erro: `A planilha de ${nome} não tem linhas abaixo do cabeçalho.` };
  if (lidas.length > MAXIMO_LINHAS_ANTERIOR) return { ok: false, erro: `A planilha de ${nome} tem ${lidas.length} linhas; o limite é ${MAXIMO_LINHAS_ANTERIOR}.` };
  return { ok: true, linhas: lidas };
}

export type AlunoAnterior = { linha: number; nome: string; email: string; cursoId: string; curso: string; matricula: string; cpf: string | null; nascimento: string | null; telefone: string | null };
export type ErroDeLinha = { planilha: "alunos" | "historico"; linha: number; erro: string };

export type ContextoAlunos = { cursos: ReadonlyMap<string, { id: string; nome: string }>; emails: ReadonlySet<string>; matriculas: ReadonlySet<string>; cpfs: ReadonlySet<string> };

// RB-49: e-mail ou matrícula repetidos (na planilha ou no sistema), CPF inválido ou repetido, curso inexistente.
export function validarAlunos(linhas: readonly LinhaLida[], ctx: ContextoAlunos, hoje: string): { alunos: AlunoAnterior[]; erros: ErroDeLinha[] } {
  const alunos: AlunoAnterior[] = [];
  const erros: ErroDeLinha[] = [];
  const vistos = { email: new Map<string, number>(), matricula: new Map<string, number>(), cpf: new Map<string, number>() };
  for (const { linha, valores: v } of linhas) {
    const erro = (texto: string) => erros.push({ planilha: "alunos", linha, erro: texto });
    const email = v.email.toLowerCase();
    const curso = ctx.cursos.get(normalizar(v.curso));
    const cpf = v.cpf ? formatarCpf(v.cpf) : null;
    const nascimento = v.nascimento ? dataValida(v.nascimento) : null;
    if (!v.nome) { erro("Nome vazio"); continue; }
    if (!FORMATO_EMAIL.test(email)) { erro("E-mail inválido"); continue; }
    if (vistos.email.has(email)) { erro(`E-mail repetido na planilha (linha ${vistos.email.get(email)})`); continue; }
    if (ctx.emails.has(email)) { erro("Já existe uma conta com este e-mail"); continue; }
    if (!curso) { erro(`Curso "${v.curso}" não existe`); continue; }
    if (!/^\d{4,12}$/.test(v.matricula)) { erro("Número de matrícula inválido (só dígitos)"); continue; }
    if (vistos.matricula.has(v.matricula)) { erro(`Matrícula repetida na planilha (linha ${vistos.matricula.get(v.matricula)})`); continue; }
    if (ctx.matriculas.has(v.matricula)) { erro("Número de matrícula já existe no sistema"); continue; }
    if (v.cpf && !cpfValido(v.cpf)) { erro("CPF inválido"); continue; }
    if (cpf && vistos.cpf.has(cpf)) { erro(`CPF repetido na planilha (linha ${vistos.cpf.get(cpf)})`); continue; }
    if (cpf && ctx.cpfs.has(cpf)) { erro("CPF já existe no sistema"); continue; }
    if (v.nascimento && (!nascimento || nascimento > hoje)) { erro("Data de nascimento inválida (AAAA-MM-DD)"); continue; }
    vistos.email.set(email, linha);
    vistos.matricula.set(v.matricula, linha);
    if (cpf) vistos.cpf.set(cpf, linha);
    alunos.push({ linha, nome: v.nome, email, cursoId: curso.id, curso: curso.nome, matricula: v.matricula, cpf, nascimento, telefone: v.telefone || null });
  }
  return { alunos, erros };
}

export type RegistroAnterior = { linha: number; matricula: string; disciplinaId: string; disciplina: string; periodo: string; media: number; frequencia: number };

const numero = (v: string) => {
  const n = Number(v.replace("%", "").replace(",", ".").trim());
  return v.trim() !== "" && Number.isFinite(n) ? n : null;
};

// RB-49 / INV-058-03: só disciplina da matriz do curso do aluno; média de 0 a 10; frequência de 0 a 100; período AAAA/N.
export function validarHistorico(
  linhas: readonly LinhaLida[],
  alunos: readonly AlunoAnterior[],
  matrizes: ReadonlyMap<string, ReadonlyMap<string, { id: string; nome: string }>>,
): { registros: RegistroAnterior[]; erros: ErroDeLinha[] } {
  const porMatricula = new Map(alunos.map((a) => [a.matricula, a]));
  const registros: RegistroAnterior[] = [];
  const erros: ErroDeLinha[] = [];
  const vistos = new Map<string, number>();
  for (const { linha, valores: v } of linhas) {
    const erro = (texto: string) => erros.push({ planilha: "historico", linha, erro: texto });
    const aluno = porMatricula.get(v.matricula);
    if (!aluno) { erro(`Matrícula ${v.matricula || "vazia"} não está na planilha de alunos`); continue; }
    const disciplina = matrizes.get(aluno.cursoId)?.get(normalizar(v.disciplina));
    if (!disciplina) { erro(`"${v.disciplina}" não está na matriz de ${aluno.curso}`); continue; }
    if (!/^\d{4}\/[12]$/.test(v.periodo)) { erro("Período fora do formato AAAA/1 ou AAAA/2"); continue; }
    const media = numero(v.media);
    const frequencia = numero(v.frequencia);
    if (media === null || media < 0 || media > 10) { erro("Média fora de 0 a 10"); continue; }
    if (frequencia === null || frequencia < 0 || frequencia > 100) { erro("Frequência fora de 0 a 100"); continue; }
    const chave = `${v.matricula}|${disciplina.id}|${v.periodo}`;
    if (vistos.has(chave)) { erro(`Registro repetido (linha ${vistos.get(chave)})`); continue; }
    vistos.set(chave, linha);
    registros.push({ linha, matricula: v.matricula, disciplinaId: disciplina.id, disciplina: disciplina.nome, periodo: v.periodo, media, frequencia });
  }
  return { registros, erros };
}

// RB-49: aprovado no sistema anterior = média e frequência dentro da regra vigente (RB-47).
export function aprovadoNoAnterior(r: { media: number; frequencia: number }, regra: RegraAvaliacao): boolean {
  return r.media >= regra.mediaMinima && r.frequencia >= regra.frequenciaMinima;
}
