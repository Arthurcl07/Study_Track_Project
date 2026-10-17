// Validação dos cadastros da SPEC-002 (RF-03, RF-04, OPEN-009). Regras puras: sem Next.js nem Prisma.

export const TAMANHO_MINIMO_SENHA = 8;

export type ErrosDeCampo = Record<string, string>;

export type Validacao<T> = { ok: true; dados: T } | { ok: false; erros: ErrosDeCampo };

export type DadosEstudante = { nome: string; email: string; senha: string };
export type DadosDisciplina = { nome: string; cargaHoraria: number };
export type DadosTurma = { nome: string; periodo: string; disciplinaId: string; professorId: string };

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function resultado<T>(erros: ErrosDeCampo, dados: T): Validacao<T> {
  return Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados };
}

// RF-03 / OPEN-009: nome, e-mail e senha inicial obrigatórios. A turma vem da rota.
export function validarEstudante(entrada: Record<string, unknown>): Validacao<DadosEstudante> {
  const erros: ErrosDeCampo = {};
  const nome = texto(entrada.nome);
  const email = texto(entrada.email).toLowerCase();
  const senha = typeof entrada.senha === "string" ? entrada.senha : "";

  if (!nome) erros.nome = "Informe o nome.";
  if (!email) erros.email = "Informe o e-mail.";
  else if (!FORMATO_EMAIL.test(email)) erros.email = "E-mail inválido.";
  if (!senha) erros.senha = "Informe a senha inicial.";
  else if (senha.length < TAMANHO_MINIMO_SENHA) {
    erros.senha = `A senha inicial precisa de pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
  }
  return resultado(erros, { nome, email, senha });
}

// RF-04 / OPEN-009: nome e carga horária inteira maior que zero.
export function validarDisciplina(entrada: Record<string, unknown>): Validacao<DadosDisciplina> {
  const erros: ErrosDeCampo = {};
  const nome = texto(entrada.nome);
  const bruto = typeof entrada.cargaHoraria === "string" ? entrada.cargaHoraria.trim() : entrada.cargaHoraria;
  const cargaHoraria = bruto === "" || bruto === undefined || bruto === null ? NaN : Number(bruto);

  if (!nome) erros.nome = "Informe o nome.";
  if (Number.isNaN(cargaHoraria)) erros.cargaHoraria = "Informe a carga horária.";
  else if (!Number.isInteger(cargaHoraria) || cargaHoraria <= 0) {
    erros.cargaHoraria = "A carga horária deve ser um número inteiro maior que zero.";
  }
  return resultado(erros, { nome, cargaHoraria });
}

// RF-04 / OPEN-009: nome, período, disciplina e professor responsável.
export function validarTurma(entrada: Record<string, unknown>): Validacao<DadosTurma> {
  const erros: ErrosDeCampo = {};
  const dados = {
    nome: texto(entrada.nome),
    periodo: texto(entrada.periodo),
    disciplinaId: texto(entrada.disciplinaId),
    professorId: texto(entrada.professorId),
  };
  if (!dados.nome) erros.nome = "Informe o nome.";
  if (!dados.periodo) erros.periodo = "Informe o período.";
  if (!dados.disciplinaId) erros.disciplinaId = "Escolha a disciplina.";
  if (!dados.professorId) erros.professorId = "Escolha o professor responsável.";
  return resultado(erros, dados);
}
