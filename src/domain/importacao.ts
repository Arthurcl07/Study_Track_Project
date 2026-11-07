// Leitura e validação da planilha de estudantes (SPEC-021, RF-30, OPEN-042). Funções puras: sem Next.js nem Prisma.

export const MAXIMO_LINHAS = 500;
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LinhaCsv = { linha: number; nome: string; email: string };
export type Leitura = { ok: true; linhas: LinhaCsv[] } | { ok: false; erro: string };

// Divide uma linha CSV respeitando aspas ("Silva; Ana" e aspas duplicadas "").
function campos(linha: string, separador: string): string[] {
  const saida: string[] = [];
  let atual = "";
  let aspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (aspas) {
      if (c === '"' && linha[i + 1] === '"') { atual += '"'; i++; }
      else if (c === '"') aspas = false;
      else atual += c;
    } else if (c === '"') aspas = true;
    else if (c === separador) { saida.push(atual); atual = ""; }
    else atual += c;
  }
  saida.push(atual);
  return saida.map((s) => s.trim());
}

// AC-021-05 / AC-021-07: cabeçalho com "nome" e "email" (ou "e-mail"), separador ";" ou ",", BOM opcional, até 500 linhas.
export function lerCsv(texto: string): Leitura {
  const linhas = texto.replace(/^﻿/, "").split(/\r?\n/);
  const inicio = linhas.findIndex((l) => l.trim() !== "");
  if (inicio < 0) return { ok: false, erro: "A planilha está vazia." };
  const cabecalho = linhas[inicio];
  const separador = cabecalho.includes(";") ? ";" : ",";
  const colunas = campos(cabecalho, separador).map((c) => c.toLowerCase());
  const iNome = colunas.indexOf("nome");
  const iEmail = colunas.findIndex((c) => c === "email" || c === "e-mail");
  if (iNome < 0 || iEmail < 0) return { ok: false, erro: "A primeira linha precisa ter as colunas nome e email (ex.: nome;email)." };

  const dados: LinhaCsv[] = [];
  for (let i = inicio + 1; i < linhas.length; i++) {
    if (linhas[i].trim() === "") continue;
    const c = campos(linhas[i], separador);
    dados.push({ linha: i + 1, nome: c[iNome] ?? "", email: (c[iEmail] ?? "").toLowerCase() });
  }
  if (dados.length === 0) return { ok: false, erro: "A planilha não tem nenhum estudante abaixo do cabeçalho." };
  if (dados.length > MAXIMO_LINHAS) return { ok: false, erro: `A planilha tem ${dados.length} estudantes; o limite é ${MAXIMO_LINHAS} por importação.` };
  return { ok: true, linhas: dados };
}

// SPEC-031 (RB-30): situacaoCurso diferente de Ativo também recusa a linha (opcional para contas que não são de estudante).
export type ContaExistente = { perfil: string; ativo: boolean; cursoId: string | null; matriculado: boolean; situacaoCurso?: string | null };
export type AcaoImportacao = "criar" | "matricular" | "ja-matriculado" | "erro";
export type LinhaPrevia = LinhaCsv & { acao: AcaoImportacao; erro?: string };

// INV-021-03 / INV-021-05: o que acontece com cada linha. Nada é gravado aqui (INV-021-02).
export function preverImportacao(linhas: readonly LinhaCsv[], contas: ReadonlyMap<string, ContaExistente>, cursoDaTurma: string): LinhaPrevia[] {
  const primeira = new Map<string, number>();
  return linhas.map((l) => {
    const erro = (mensagem: string): LinhaPrevia => ({ ...l, acao: "erro", erro: mensagem });
    if (!l.nome) return erro("Nome vazio");
    if (!FORMATO_EMAIL.test(l.email)) return erro("E-mail inválido");
    const anterior = primeira.get(l.email);
    if (anterior !== undefined) return erro(`E-mail repetido na planilha (linha ${anterior})`);
    primeira.set(l.email, l.linha);
    const conta = contas.get(l.email);
    if (!conta) return { ...l, acao: "criar" };
    if (conta.perfil !== "Estudante") return erro("E-mail de uma conta que não é de estudante");
    if (!conta.ativo) return erro("Conta desativada");
    if (conta.cursoId !== cursoDaTurma) return erro("Estudante de outro curso");
    if (conta.situacaoCurso && conta.situacaoCurso !== "Ativo") return erro("Estudante não está Ativo no curso");
    return { ...l, acao: conta.matriculado ? "ja-matriculado" : "matricular" };
  });
}

export function resumoDaPrevia(previa: readonly LinhaPrevia[]) {
  const conta = (acao: AcaoImportacao) => previa.filter((l) => l.acao === acao).length;
  return { criar: conta("criar"), matricular: conta("matricular"), jaMatriculados: conta("ja-matriculado"), erros: conta("erro") };
}

// CSV das senhas provisórias para o coordenador repassar (separador ";", como o relatório).
export function csvDasSenhas(senhas: readonly { nome: string; email: string; senha: string }[]): string {
  const celula = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return ["nome;email;senha provisória", ...senhas.map((s) => [s.nome, s.email, s.senha].map(celula).join(";"))].join("\r\n");
}
