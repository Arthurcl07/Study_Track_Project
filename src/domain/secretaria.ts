// Regras puras da secretaria acadêmica (SPEC-030 a SPEC-034, OPEN-052 a OPEN-056): situação no curso, abono de
// faltas, ficha do estudante, dados da instituição, paginação e virada de semestre. Sem Next.js nem Prisma.
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

const texto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");
const soDigitos = (valor: string) => valor.replace(/\D/g, "");
const resultado = <T>(erros: ErrosDeCampo, dados: T): Validacao<T> => (Object.keys(erros).length > 0 ? { ok: false, erros } : { ok: true, dados });

function dataValida(valor: unknown): string | null {
  const d = texto(valor);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const data = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === d ? d : null;
}

function diasEntre(inicio: string, fim: string) {
  return Math.round((Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`)) / 86_400_000);
}

// ---------------------------------------------------------------- SPEC-031: situação no curso (RB-30)

export const SITUACOES_CURSO = ["Ativo", "Trancado", "Transferido", "Cancelado", "Concluido"] as const;
export type SituacaoCurso = (typeof SITUACOES_CURSO)[number];
export const ROTULO_SITUACAO_CURSO: Record<SituacaoCurso, string> = {
  Ativo: "Ativo",
  Trancado: "Trancado",
  Transferido: "Transferido",
  Cancelado: "Cancelado",
  Concluido: "Concluído",
};

// RB-30: trancar → matrículas de período aberto Trancadas; transferir ou cancelar → Canceladas; concluir e reativar
// não mexem nas matrículas.
export function efeitoNasMatriculas(situacao: SituacaoCurso): "Trancada" | "Cancelada" | null {
  if (situacao === "Trancado") return "Trancada";
  if (situacao === "Transferido" || situacao === "Cancelado") return "Cancelada";
  return null;
}

export function validarMudancaDeSituacao(entrada: Record<string, unknown>, atual: SituacaoCurso, hoje: string): Validacao<{ situacao: SituacaoCurso; data: string; motivo: string }> {
  const erros: ErrosDeCampo = {};
  const situacao = entrada.situacao as SituacaoCurso;
  const data = dataValida(entrada.data);
  const motivo = texto(entrada.motivo);
  if (!(SITUACOES_CURSO as readonly unknown[]).includes(situacao)) erros.situacao = "Escolha a nova situação.";
  else if (situacao === atual) erros.situacao = `O estudante já está ${ROTULO_SITUACAO_CURSO[atual]}.`;
  if (!data || data > hoje) erros.data = "Informe a data (até hoje).";
  if (!motivo) erros.motivo = "Informe o motivo.";
  else if (motivo.length > 300) erros.motivo = "O motivo pode ter até 300 caracteres.";
  return resultado(erros, { situacao, data: data ?? "", motivo });
}

export const MENSAGEM_ESTUDANTE_NAO_ATIVO = "Só estudante com situação Ativo no curso pode ser matriculado.";

// ---------------------------------------------------------------- SPEC-032: abono de faltas (RB-31)

export const MOTIVOS_ABONO = ["AtestadoMedico", "ExerciciosDomiciliares", "LicencaMaternidade", "ServicoMilitar", "Outro"] as const;
export type MotivoAbono = (typeof MOTIVOS_ABONO)[number];
export const ROTULO_MOTIVO_ABONO: Record<MotivoAbono, string> = {
  AtestadoMedico: "Atestado médico",
  ExerciciosDomiciliares: "Exercícios domiciliares",
  LicencaMaternidade: "Licença-maternidade",
  ServicoMilitar: "Serviço militar",
  Outro: "Outro",
};
export const DIAS_MAXIMOS_ABONO = 180;

export function validarAbono(entrada: Record<string, unknown>): Validacao<{ inicio: string; fim: string; motivo: MotivoAbono; observacao: string | null }> {
  const erros: ErrosDeCampo = {};
  const inicio = dataValida(entrada.inicio);
  const fim = dataValida(entrada.fim);
  const motivo = entrada.motivo as MotivoAbono;
  const observacao = texto(entrada.observacao);
  if (!inicio) erros.inicio = "Informe a data inicial.";
  if (!fim) erros.fim = "Informe a data final.";
  if (inicio && fim && fim < inicio) erros.fim = "A data final não pode ser antes da inicial.";
  else if (inicio && fim && diasEntre(inicio, fim) + 1 > DIAS_MAXIMOS_ABONO) erros.fim = `O abono pode ter até ${DIAS_MAXIMOS_ABONO} dias.`;
  if (!(MOTIVOS_ABONO as readonly unknown[]).includes(motivo)) erros.motivo = "Escolha o motivo.";
  if (observacao.length > 300) erros.observacao = "A observação pode ter até 300 caracteres.";
  return resultado(erros, { inicio: inicio ?? "", fim: fim ?? "", motivo, observacao: observacao || null });
}

// ---------------------------------------------------------------- SPEC-033: ficha e instituição (RB-33)

// Número de matrícula: ano + sequência de 4 dígitos (o gatilho do banco aplica a mesma regra, INV-033-01).
export function numeroDeMatricula(ano: number, sequencia: number): string {
  return `${ano}${String(sequencia).padStart(4, "0")}`;
}

// CPF: 11 dígitos, não todos iguais, com os dois dígitos verificadores corretos.
export function cpfValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (n: number) => {
    const soma = [...d.slice(0, n)].reduce((s, c, i) => s + Number(c) * (n + 1 - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

export function cnpjValido(valor: string): boolean {
  const d = soDigitos(valor);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const digito = (n: number) => {
    const pesos = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const resto = [...d.slice(0, n)].reduce((s, c, i) => s + Number(c) * pesos[i], 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return digito(12) === Number(d[12]) && digito(13) === Number(d[13]);
}

export const formatarCpf = (cpf: string) => soDigitos(cpf).replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
export const formatarCnpj = (cnpj: string) => soDigitos(cnpj).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
// Na auditoria, o CPF aparece só com os 3 últimos dígitos (RNF-05).
export const cpfMascarado = (cpf: string | null) => (cpf ? `***.***.**${soDigitos(cpf).slice(8, 9)}-${soDigitos(cpf).slice(9)}` : null);

export type DadosFicha = { cpf: string | null; dataNascimento: string | null; telefone: string | null; responsavelNome: string | null; responsavelTelefone: string | null };

export function validarFicha(entrada: Record<string, unknown>, hoje: string): Validacao<DadosFicha> {
  const erros: ErrosDeCampo = {};
  const cpfTexto = texto(entrada.cpf);
  const nascimentoTexto = texto(entrada.dataNascimento);
  const nascimento = nascimentoTexto ? dataValida(nascimentoTexto) : null;
  const telefone = texto(entrada.telefone);
  const responsavelNome = texto(entrada.responsavelNome);
  const responsavelTelefone = texto(entrada.responsavelTelefone);
  if (cpfTexto && !cpfValido(cpfTexto)) erros.cpf = "CPF inválido.";
  if (nascimentoTexto && (!nascimento || nascimento > hoje)) erros.dataNascimento = "Informe uma data de nascimento válida (até hoje).";
  const telefoneOk = (t: string) => !t || /^[\d\s()+-]{8,20}$/.test(t);
  if (!telefoneOk(telefone)) erros.telefone = "Telefone inválido.";
  if (!telefoneOk(responsavelTelefone)) erros.responsavelTelefone = "Telefone inválido.";
  if (responsavelNome.length > 120) erros.responsavelNome = "O nome pode ter até 120 caracteres.";
  return resultado(erros, {
    cpf: cpfTexto ? formatarCpf(cpfTexto) : null,
    dataNascimento: nascimento,
    telefone: telefone || null,
    responsavelNome: responsavelNome || null,
    responsavelTelefone: responsavelTelefone || null,
  });
}

export const TAMANHO_MAXIMO_LOGOTIPO = 200 * 1024;

// Logotipo como data URL PNG ou JPG de até 200 KB.
export function validarLogotipo(valor: unknown): { ok: true; logotipo: string | null } | { ok: false; erro: string } {
  if (valor === undefined || valor === null || valor === "") return { ok: true, logotipo: null };
  const dataUrl = typeof valor === "string" ? valor : "";
  const partes = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!partes) return { ok: false, erro: "O logotipo precisa ser uma imagem PNG ou JPG." };
  const bytes = Math.floor((partes[2].length * 3) / 4) - (partes[2].endsWith("==") ? 2 : partes[2].endsWith("=") ? 1 : 0);
  if (bytes > TAMANHO_MAXIMO_LOGOTIPO) return { ok: false, erro: "O logotipo pode ter até 200 KB." };
  return { ok: true, logotipo: dataUrl };
}

export type DadosInstituicao = { nome: string; cnpj: string | null; endereco: string | null; cidadeUf: string | null; telefone: string | null; email: string | null; responsavelSecretaria: string | null };

export function validarInstituicao(entrada: Record<string, unknown>): Validacao<DadosInstituicao> {
  const erros: ErrosDeCampo = {};
  const nome = texto(entrada.nome);
  const cnpj = texto(entrada.cnpj);
  const email = texto(entrada.email);
  if (!nome) erros.nome = "Informe o nome da instituição.";
  else if (nome.length > 150) erros.nome = "O nome pode ter até 150 caracteres.";
  if (cnpj && !cnpjValido(cnpj)) erros.cnpj = "CNPJ inválido.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.email = "E-mail inválido.";
  const opcional = (v: unknown) => texto(v).slice(0, 200) || null;
  return resultado(erros, {
    nome,
    cnpj: cnpj ? formatarCnpj(cnpj) : null,
    endereco: opcional(entrada.endereco),
    cidadeUf: opcional(entrada.cidadeUf),
    telefone: opcional(entrada.telefone),
    email: email || null,
    responsavelSecretaria: opcional(entrada.responsavelSecretaria),
  });
}

// ---------------------------------------------------------------- SPEC-034: busca e paginação

export const ITENS_POR_PAGINA = 25;

// Busca sem diferenciar maiúsculas e acentos: "João" e "joao" batem.
export function normalizarBusca(valor: unknown): string {
  return texto(valor).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().slice(0, 100);
}

// AC-034-05: página fora do intervalo vira a última (ou a primeira, sem itens).
export function paginar(total: number, pedida: unknown, porPagina = ITENS_POR_PAGINA) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  const numero = Number.parseInt(String(pedida ?? "1"), 10);
  const pagina = Math.min(Math.max(Number.isFinite(numero) ? numero : 1, 1), paginas);
  return { pagina, paginas, pular: (pagina - 1) * porPagina, porPagina, de: total === 0 ? 0 : (pagina - 1) * porPagina + 1, ate: Math.min(pagina * porPagina, total), total };
}

// ---------------------------------------------------------------- SPEC-030: virada de semestre (RB-30)

export type TurmaDeOrigem = { id: string; nome: string; disciplinaId: string; cursoId: string; professorAtivo: boolean };
export type PlanoDaTurma = { id: string; acao: "copiar" | "ja-existe" | "professor-desativado" };

// INV-030-03: turma com o mesmo nome e disciplina no curso de destino não é duplicada; professor desativado não é copiado.
export function planoDaVirada(origem: readonly TurmaDeOrigem[], existentesNoDestino: readonly { nome: string; disciplinaId: string; cursoId: string }[]): PlanoDaTurma[] {
  const chave = (t: { nome: string; disciplinaId: string; cursoId: string }) => `${t.cursoId}|${t.disciplinaId}|${t.nome.trim().toLowerCase()}`;
  const existentes = new Set(existentesNoDestino.map(chave));
  return origem.map((t) => ({ id: t.id, acao: existentes.has(chave(t)) ? "ja-existe" : t.professorAtivo ? "copiar" : "professor-desativado" }));
}
