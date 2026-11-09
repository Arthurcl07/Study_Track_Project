// Povoamento de uma faculdade de verdade (dados FICTÍCIOS, só para ambiente local e apresentação), pedido de Arthur
// em 2026-11-09: cada um dos 6 cursos com matriz de 4 semestres e 7 disciplinas por semestre, duas turmas de
// ingresso (turma A no 2º semestre e turma B no 4º semestre em 2026/2) com cerca de 30 estudantes cada, e o
// histórico de 2025/1, 2025/2 e 2026/1. Situações variadas: bons, medianos, fracos, faltosos, exames, trancamentos.
// - Determinístico: os números saem de um hash do e-mail e da turma, não da ordem de execução.
// - Idempotente: só cria o que falta; rodar o seed de novo não duplica nem muda notas já gravadas.
// - Em lote (createMany) para o seed continuar em poucos minutos.
// - A situação (Normal/Atenção/Risco) nunca é escrita aqui: sai de recalcularIndicador (regra única, DA-02); a
//   frequência sai das presenças de cada aula (RB-21).
import { somarDiasUteis } from "../src/domain/calendario";
import { frequenciaPelaChamada } from "../src/domain/frequencia";
import { protocolo } from "../src/domain/requerimentos";
import { recalcularIndicador } from "../src/server/academico/indicador";
import { gerarHashSenha } from "../src/server/auth/senha";
import { paraData } from "../src/server/dados/atividades";
import { prisma } from "../src/server/dados/prisma";
import type { Sigla } from "./simulacao";

// ---------------------------------------------------------------- Catálogo e matrizes

// Carga horária de cada disciplina (uma disciplina pode estar em vários cursos, com a mesma carga).
const CARGA: Record<string, number> = {
  "Introdução à Computação": 80, Lógica: 60, "Cálculo Básico": 60, "Geometria Analítica": 60, "Química Geral": 60,
  "Comunicação e Expressão": 40, "Desenho Técnico": 40, "Modelagem de Software": 60, "Engenharia de Requisitos": 40,
  "Banco de Dados": 80, "Sistemas Operacionais": 60, "Cálculo I": 80, "Física I": 60, Algoritmos: 80, Compiladores: 60,
  "Cálculo II": 80, "Redes de Computadores": 60, "Ética e Legislação": 40, "Física II": 60, "Estruturas de Dados": 60,
  "Arquitetura de Computadores": 60, "Trabalho de Conclusão de Curso": 80, "Inteligência Artificial": 60,
  Empreendedorismo: 40, "Sistemas Distribuídos": 60, "Engenharia de Software": 80, Microcontroladores: 60,
  "Probabilidade e Estatística": 60, "Matemática Discreta": 60, "Programação Estruturada": 80,
  "Programação Orientada a Objetos": 80, "Álgebra Linear": 60, "Teoria da Computação": 60, "Análise de Algoritmos": 60,
  "Desenvolvimento Web": 60, "Interação Humano-Computador": 40, "Computação Gráfica": 60, "Segurança da Informação": 60,
  "Introdução à Engenharia Elétrica": 40, "Circuitos Elétricos": 80, "Eletrônica Digital": 60, "Circuitos Elétricos II": 80,
  "Eletrônica Analógica": 60, "Sinais e Sistemas": 60, Eletromagnetismo: 60, "Máquinas Elétricas": 80,
  "Sistemas de Potência": 80, "Controle e Automação": 60, "Instalações Elétricas": 60,
  "Sistemas de Informação Gerenciais": 60, "Fundamentos de Administração": 60, "Contabilidade Básica": 60,
  "Gestão de Projetos": 60, "Governança de TI": 60, "Business Intelligence": 60, "Teoria da Comunicação": 60,
  Sociologia: 40, "História da Arte": 60, Fotografia: 60, "Introdução à Publicidade": 60, "Língua Portuguesa": 60,
  "Fundamentos de Marketing": 60, "Criação Publicitária": 80, "Redação Publicitária": 60, "Design Gráfico": 60,
  "Psicologia do Consumidor": 60, Mídia: 60, "Planejamento de Campanha": 80, "Produção Audiovisual": 80,
  "Marketing Digital": 60, "Pesquisa de Mercado": 60, "Direção de Arte": 60, "Comunicação Integrada": 60, Branding: 60,
  "Atendimento e Negócios": 60, "Mídias Sociais": 60, "Produção Gráfica": 60, "Eventos e Promoção": 60,
  "Propaganda Política": 40, "Matemática Financeira": 60, Economia: 60, "Introdução ao Direito": 60,
  "Gestão de Pessoas": 60, "Estatística Aplicada": 60, Microeconomia: 60, "Contabilidade de Custos": 60,
  "Administração Financeira": 60, Logística: 60, "Gestão da Qualidade": 60, "Direito Empresarial": 60,
  "Pesquisa Operacional": 60, "Comportamento Organizacional": 60, "Planejamento Estratégico": 80,
  "Gestão de Operações": 60, "Negócios Internacionais": 60, "Governança Corporativa": 60,
};

type Matriz = { semestres: string[][]; optativas: string[]; requisitos: Record<string, string[]> };

// SPEC-037: 4 semestres × 7 disciplinas por curso. As turmas que já existiam em 2026/2 ficam no 2º semestre.
export const MATRIZES: Record<Sigla, Matriz> = {
  ECO: {
    semestres: [
      ["Introdução à Computação", "Lógica", "Cálculo Básico", "Geometria Analítica", "Química Geral", "Comunicação e Expressão", "Desenho Técnico"],
      ["Modelagem de Software", "Engenharia de Requisitos", "Banco de Dados", "Sistemas Operacionais", "Cálculo I", "Física I", "Algoritmos"],
      ["Compiladores", "Cálculo II", "Redes de Computadores", "Ética e Legislação", "Física II", "Estruturas de Dados", "Arquitetura de Computadores"],
      ["Trabalho de Conclusão de Curso", "Sistemas Distribuídos", "Engenharia de Software", "Microcontroladores", "Probabilidade e Estatística", "Inteligência Artificial", "Empreendedorismo"],
    ],
    optativas: ["Inteligência Artificial", "Empreendedorismo"],
    requisitos: {
      "Modelagem de Software": ["Introdução à Computação"], "Banco de Dados": ["Lógica"], "Sistemas Operacionais": ["Introdução à Computação"],
      "Cálculo I": ["Cálculo Básico"], Algoritmos: ["Lógica"], Compiladores: ["Algoritmos"], "Cálculo II": ["Cálculo I"],
      "Redes de Computadores": ["Sistemas Operacionais"], "Física II": ["Física I"], "Estruturas de Dados": ["Algoritmos"],
      "Trabalho de Conclusão de Curso": ["Modelagem de Software", "Engenharia de Requisitos"], "Sistemas Distribuídos": ["Redes de Computadores"],
      "Engenharia de Software": ["Modelagem de Software"], Microcontroladores: ["Arquitetura de Computadores"],
    },
  },
  CC: {
    semestres: [
      ["Introdução à Computação", "Lógica", "Cálculo I", "Matemática Discreta", "Programação Estruturada", "Comunicação e Expressão", "Ética e Legislação"],
      ["Algoritmos", "Estruturas de Dados", "Engenharia de Software", "Programação Orientada a Objetos", "Cálculo II", "Álgebra Linear", "Banco de Dados"],
      ["Sistemas Operacionais", "Redes de Computadores", "Teoria da Computação", "Probabilidade e Estatística", "Análise de Algoritmos", "Desenvolvimento Web", "Interação Humano-Computador"],
      ["Compiladores", "Inteligência Artificial", "Computação Gráfica", "Sistemas Distribuídos", "Segurança da Informação", "Trabalho de Conclusão de Curso", "Empreendedorismo"],
    ],
    optativas: ["Empreendedorismo"],
    requisitos: {
      Algoritmos: ["Programação Estruturada"], "Estruturas de Dados": ["Programação Estruturada"], "Cálculo II": ["Cálculo I"],
      "Programação Orientada a Objetos": ["Programação Estruturada"], "Análise de Algoritmos": ["Algoritmos"],
      "Teoria da Computação": ["Matemática Discreta"], Compiladores: ["Teoria da Computação"], "Computação Gráfica": ["Álgebra Linear"],
      "Sistemas Distribuídos": ["Redes de Computadores"], "Trabalho de Conclusão de Curso": ["Engenharia de Software"],
    },
  },
  ELE: {
    semestres: [
      ["Cálculo Básico", "Geometria Analítica", "Química Geral", "Introdução à Engenharia Elétrica", "Desenho Técnico", "Comunicação e Expressão", "Algoritmos"],
      ["Cálculo I", "Física I", "Redes de Computadores", "Circuitos Elétricos", "Álgebra Linear", "Eletrônica Digital", "Probabilidade e Estatística"],
      ["Cálculo II", "Física II", "Circuitos Elétricos II", "Eletrônica Analógica", "Sinais e Sistemas", "Eletromagnetismo", "Ética e Legislação"],
      ["Máquinas Elétricas", "Sistemas de Potência", "Controle e Automação", "Microcontroladores", "Instalações Elétricas", "Trabalho de Conclusão de Curso", "Empreendedorismo"],
    ],
    optativas: ["Empreendedorismo"],
    requisitos: {
      "Cálculo I": ["Cálculo Básico"], "Cálculo II": ["Cálculo I"], "Física II": ["Física I"], "Circuitos Elétricos II": ["Circuitos Elétricos"],
      "Eletrônica Analógica": ["Circuitos Elétricos"], Eletromagnetismo: ["Física I"], "Máquinas Elétricas": ["Eletromagnetismo"],
      "Sistemas de Potência": ["Circuitos Elétricos II"], "Controle e Automação": ["Sinais e Sistemas"], Microcontroladores: ["Eletrônica Digital"],
    },
  },
  SI: {
    semestres: [
      ["Introdução à Computação", "Lógica", "Sistemas de Informação Gerenciais", "Matemática Discreta", "Comunicação e Expressão", "Fundamentos de Administração", "Ética e Legislação"],
      ["Algoritmos", "Banco de Dados", "Engenharia de Requisitos", "Programação Orientada a Objetos", "Probabilidade e Estatística", "Contabilidade Básica", "Arquitetura de Computadores"],
      ["Estruturas de Dados", "Engenharia de Software", "Desenvolvimento Web", "Redes de Computadores", "Sistemas Operacionais", "Interação Humano-Computador", "Gestão de Projetos"],
      ["Segurança da Informação", "Governança de TI", "Sistemas Distribuídos", "Business Intelligence", "Trabalho de Conclusão de Curso", "Empreendedorismo", "Inteligência Artificial"],
    ],
    optativas: ["Inteligência Artificial"],
    requisitos: {
      Algoritmos: ["Lógica"], "Banco de Dados": ["Lógica"], "Estruturas de Dados": ["Algoritmos"], "Engenharia de Software": ["Engenharia de Requisitos"],
      "Desenvolvimento Web": ["Programação Orientada a Objetos"], "Business Intelligence": ["Banco de Dados"], "Governança de TI": ["Gestão de Projetos"],
    },
  },
  PP: {
    semestres: [
      ["Teoria da Comunicação", "Comunicação e Expressão", "Sociologia", "História da Arte", "Fotografia", "Introdução à Publicidade", "Língua Portuguesa"],
      ["Fundamentos de Marketing", "Criação Publicitária", "Redação Publicitária", "Design Gráfico", "Psicologia do Consumidor", "Mídia", "Ética e Legislação"],
      ["Planejamento de Campanha", "Produção Audiovisual", "Marketing Digital", "Pesquisa de Mercado", "Direção de Arte", "Comunicação Integrada", "Branding"],
      ["Atendimento e Negócios", "Mídias Sociais", "Produção Gráfica", "Eventos e Promoção", "Trabalho de Conclusão de Curso", "Empreendedorismo", "Propaganda Política"],
    ],
    optativas: ["Propaganda Política"],
    requisitos: {
      "Criação Publicitária": ["Introdução à Publicidade"], "Redação Publicitária": ["Língua Portuguesa"], "Planejamento de Campanha": ["Fundamentos de Marketing"],
      "Direção de Arte": ["Design Gráfico"], "Produção Audiovisual": ["Fotografia"], "Marketing Digital": ["Fundamentos de Marketing"],
      "Trabalho de Conclusão de Curso": ["Planejamento de Campanha"],
    },
  },
  ADM: {
    semestres: [
      ["Fundamentos de Administração", "Contabilidade Básica", "Matemática Financeira", "Sociologia", "Comunicação e Expressão", "Economia", "Introdução ao Direito"],
      ["Fundamentos de Marketing", "Gestão de Projetos", "Gestão de Pessoas", "Estatística Aplicada", "Microeconomia", "Contabilidade de Custos", "Ética e Legislação"],
      ["Administração Financeira", "Logística", "Gestão da Qualidade", "Direito Empresarial", "Pesquisa Operacional", "Marketing Digital", "Comportamento Organizacional"],
      ["Planejamento Estratégico", "Empreendedorismo", "Gestão de Operações", "Negócios Internacionais", "Governança Corporativa", "Trabalho de Conclusão de Curso", "Business Intelligence"],
    ],
    optativas: ["Business Intelligence"],
    requisitos: {
      "Contabilidade de Custos": ["Contabilidade Básica"], Microeconomia: ["Economia"], "Administração Financeira": ["Matemática Financeira"],
      "Direito Empresarial": ["Introdução ao Direito"], "Pesquisa Operacional": ["Estatística Aplicada"], "Planejamento Estratégico": ["Gestão de Projetos"],
    },
  },
};

// Para a limpeza da grade feita em prepararCursos não tirar estas disciplinas dos cursos.
export function disciplinasDaMatriz(sigla: Sigla): string[] {
  return MATRIZES[sigla].semestres.flat();
}

// ---------------------------------------------------------------- Pessoas

const PROFESSORES_NOVOS = [
  ["Eduardo Sampaio", "ECO"], ["Larissa Fontes", "ECO"], ["André Queiroz", "CC"], ["Mônica Tavares", "CC"],
  ["Vítor Hugo Leal", "ELE"], ["Cláudia Rezende", "ELE"], ["Rogério Pacheco", "ELE"], ["Beatriz Salles", "SI"],
  ["Henrique Moura", "SI"], ["Juliana Castro", "PP"], ["Fábio Arantes", "PP"], ["Renata Lobo", "PP"],
  ["Gustavo Peixoto", "ADM"], ["Paula Siqueira", "ADM"], ["Otávio Brandão", "ADM"], ["Débora Fagundes", "CC"],
] as const;
// Professores que já existiam, por curso em que dão aula (o e-mail é o identificador).
const PROFESSORES_ANTIGOS: Record<Sigla, string[]> = {
  ECO: ["professor@studytrack.test", "julia.reis@studytrack.test", "patricia.gomes@studytrack.test"],
  CC: ["marcos.andrade@studytrack.test", "fernanda.lopes@studytrack.test"],
  ELE: ["ricardo.nunes@studytrack.test", "patricia.gomes@studytrack.test"],
  SI: ["fernanda.lopes@studytrack.test", "julia.reis@studytrack.test"],
  PP: ["tiago.mello@studytrack.test"],
  ADM: ["silvia.couto@studytrack.test"],
};

const PRIMEIROS = ["Alice", "Arthur", "Bianca", "Breno", "Cecília", "Davi", "Eduarda", "Enzo", "Fábio", "Giovana", "Heitor", "Helena",
  "Igor", "Íris", "Joaquim", "Júlia", "Kauã", "Lara", "Lucca", "Manuela", "Marcelo", "Melissa", "Nicolas", "Olívia", "Otávio",
  "Pietra", "Raul", "Rebeca", "Samuel", "Sara", "Tomás", "Valentina", "Vicente", "Yasmin", "Gael", "Lívia", "Benício", "Clara",
  "Murilo", "Lorena", "Bernardo", "Antonella", "Emanuel", "Luana", "Henry", "Maitê", "Ravi", "Heloísa"];
const SOBRENOMES = ["Albuquerque", "Andrade", "Antunes", "Bezerra", "Borges", "Brito", "Campos", "Cavalcanti", "Coelho", "Cunha", "Dantas",
  "Duarte", "Esteves", "Farias", "Fonseca", "Garcia", "Gomes", "Guimarães", "Lacerda", "Leite", "Lima", "Macedo", "Machado",
  "Medeiros", "Mendonça", "Miranda", "Nogueira", "Paiva", "Peixoto", "Prado", "Queiroz", "Ramos", "Rezende", "Rocha", "Sales",
  "Siqueira", "Soares", "Tavares", "Vasconcelos", "Xavier"];

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const emailDe = (nome: string) => `${nome.split(" ").map(semAcento).join(".")}@studytrack.test`;
const EMAILS_DO_POVOAMENTO = new Set(PRIMEIROS.flatMap((p) => SOBRENOMES.map((s) => emailDe(`${p} ${s}`))));
// Estudante criado pelo povoamento (os nomes vêm de listas que a simulação antiga não usa).
export const estudanteDoPovoamento = (email: string) => EMAILS_DO_POVOAMENTO.has(email);

// Número de 0 a 1 que depende só do texto: o mesmo estudante tem o mesmo perfil em todo banco.
function hash01(texto: string) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const meioPonto = (v: number) => Math.min(10, Math.max(0, Math.round(v * 2) / 2));

type Perfil = { centro: number; faltoso: boolean };
// Perto de uma turma real: 60% bons, 28% medianos, 12% fracos; 6% faltosos (frequência abaixo de 75%).
function perfilDe(email: string): Perfil {
  const fixo: Record<string, number> = { "estudante@studytrack.test": 6.3 };
  if (fixo[email] !== undefined) return { centro: fixo[email], faltoso: false };
  const s = hash01(`perfil:${email}`);
  const centro = s < 0.6 ? 7 + hash01(`c:${email}`) * 2.5 : s < 0.88 ? 5.6 + hash01(`c:${email}`) * 1.3 : 3.2 + hash01(`c:${email}`) * 1.6;
  return { centro, faltoso: hash01(`falta:${email}`) < 0.06 };
}

// Nota de uma avaliação: o perfil do estudante, a dificuldade da turma e uma variação de cada prova.
function valorDaNota(email: string, turma: { nome: string; periodo: string }, avaliacaoId: string) {
  const dificuldade = (hash01(`dif:${turma.nome}:${turma.periodo}`) - 0.5) * 1.2;
  return meioPonto(perfilDe(email).centro + dificuldade + (hash01(`nota:${email}:${avaliacaoId}`) - 0.5) * 2);
}

// Presença na k-ésima de n aulas, com as faltas espalhadas para chegar perto da frequência do perfil.
function presenteNaAula(email: string, turmaId: string, k: number, n: number) {
  const alvo = perfilDe(email).faltoso ? 55 + hash01(`f:${email}:${turmaId}`) * 19 : 77 + hash01(`f:${email}:${turmaId}`) * 23;
  const faltas = n - Math.round((alvo / 100) * n);
  const deslocamento = Math.floor(hash01(`d:${email}:${turmaId}`) * n);
  return (k * 7 + deslocamento) % n >= faltas;
}

// Turmas que já existiam antes do povoamento (nome e disciplina): os dados delas continuam com a simulação
// (prisma/simulacao.ts e seed.ts).
const TURMAS_ANTERIORES: Record<string, string> = {
  "Turma MS-A": "Modelagem de Software", "Turma ER-B": "Engenharia de Requisitos", "Turma INT-ECO": "Introdução à Computação",
  "Turma LOG-ECO": "Lógica", "Turma CB-ECO": "Cálculo Básico", "Turma BD-A": "Banco de Dados", "Turma SO-B": "Sistemas Operacionais",
  "Turma CAL-ECO": "Cálculo I", "Turma ES-A": "Engenharia de Software", "Turma ED-B": "Estruturas de Dados", "Turma ALG-CC": "Algoritmos",
  "Turma RC-A": "Redes de Computadores", "Turma CAL-ELE": "Cálculo I", "Turma FIS-ELE": "Física I", "Turma ALG-SI": "Algoritmos",
  "Turma BD-SI": "Banco de Dados", "Turma MKT-PP": "Fundamentos de Marketing", "Turma CRI-PP": "Criação Publicitária",
  "Turma MKT-ADM": "Fundamentos de Marketing", "Turma GP-ADM": "Gestão de Projetos",
};
const turmaAnterior = (nome: string, disciplina: string) => TURMAS_ANTERIORES[nome] === disciplina;

// ---------------------------------------------------------------- Períodos e aulas

function datasDeAula(inicio: string, quantidade: number) {
  const datas: string[] = [];
  const d = paraData(inicio);
  for (let k = 0; k < quantidade; k++) {
    datas.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + (k % 2 === 0 ? 2 : 5));
  }
  return datas;
}
const AULAS: Record<string, string[]> = {
  "2025/1": datasDeAula("2025-02-25", 20),
  "2025/2": datasDeAula("2025-08-12", 20),
  "2026/1": datasDeAula("2026-02-24", 20),
  "2026/2": datasDeAula("2026-08-11", 20),
};
const AVALIACOES_HISTORICO: Record<string, [string, string][]> = {
  "2025/1": [["Prova 1", "2025-04-10"], ["Prova 2", "2025-06-12"]],
  "2025/2": [["Prova 1", "2025-09-25"], ["Prova 2", "2025-11-27"]],
  "2026/1": [["Prova 1", "2026-04-10"], ["Prova 2", "2026-06-12"]],
};
const AVALIACOES_ATUAIS: { nome: string; peso: number; data: string; tipo: "Prova" | "Trabalho" }[] = [
  { nome: "Prova 1", peso: 2, data: "2026-09-15", tipo: "Prova" },
  { nome: "Lista de exercícios", peso: 1, data: "2026-09-29", tipo: "Trabalho" },
  { nome: "Trabalho em grupo", peso: 1, data: "2026-10-08", tipo: "Trabalho" },
  { nome: "Prova 2", peso: 2, data: "2026-11-24", tipo: "Prova" },
];

// Em cada período, que semestre da matriz cada turma de ingresso cursa. A turma A entrou em 2026/1; a B, em 2025/1.
const OFERTAS: { periodo: string; semestre: number; grupo: "A" | "B" }[] = [
  { periodo: "2026/2", semestre: 2, grupo: "A" },
  { periodo: "2026/2", semestre: 4, grupo: "B" },
  { periodo: "2026/1", semestre: 1, grupo: "A" },
  { periodo: "2026/1", semestre: 3, grupo: "B" },
  { periodo: "2025/2", semestre: 2, grupo: "B" },
  { periodo: "2025/1", semestre: 1, grupo: "B" },
];

// Sigla da disciplina para o nome da turma: iniciais ("Banco de Dados" → BD) ou 3 letras ("Algoritmos" → ALG).
function siglaDaDisciplina(nome: string) {
  const palavras = nome.normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[\s-]+/).filter((p) => !["de", "da", "do", "das", "dos", "e", "a", "o", "em", "ao"].includes(p.toLowerCase()));
  return (palavras.length === 1 ? palavras[0].slice(0, 3) : palavras.map((p) => p[0]).join("").slice(0, 4)).toUpperCase();
}

// Código de cada disciplina no curso, sem repetir: "Gestão de Projetos" é GP e "Gestão de Pessoas" vira GPE.
function codigoNoCurso(disciplina: string, sigla: Sigla) {
  const usados = new Map<string, string>();
  for (const nome of MATRIZES[sigla].semestres.flat()) {
    let codigo = siglaDaDisciplina(nome);
    if ([...usados.values()].includes(codigo)) {
      const ultima = nome.normalize("NFD").replace(/[̀-ͯ]/g, "").split(/\s+/).at(-1)!.toUpperCase();
      codigo = `${codigo}${ultima[1] ?? ""}`;
      for (let n = 2; [...usados.values()].includes(codigo); n++) codigo = `${siglaDaDisciplina(nome)}${n}`;
    }
    usados.set(nome, codigo);
  }
  return usados.get(disciplina) ?? siglaDaDisciplina(disciplina);
}

export function nomeDaTurma(disciplina: string, sigla: Sigla, periodo: string) {
  const base = `Turma ${codigoNoCurso(disciplina, sigla)}-${sigla}`;
  return periodo === "2026/2" ? base : `${base}-${periodo.slice(2, 4)}${periodo.slice(5)}`;
}

const ITENS_PLANO = ["Refazer a lista de exercícios", "Plantão de dúvidas com o professor", "Resumo do conteúdo da Prova 1", "Simulado antes da Prova 2"];

// ---------------------------------------------------------------- Povoamento

export async function povoarFaculdade(base: { senha: string; cursos: Record<Sigla, string>; hoje: string }) {
  const inicio = Date.now();
  const hash = await gerarHashSenha(base.senha);

  // Períodos do histórico (já encerrados).
  for (const [nome, encerradoEm] of [["2025/1", "2025-07-11T15:00:00Z"], ["2025/2", "2025-12-19T15:00:00Z"]]) {
    await prisma.periodoLetivo.upsert({ where: { nome }, update: {}, create: { nome, status: "Encerrado", encerradoEm: new Date(encerradoEm) } });
  }

  // Disciplinas e matrizes (SPEC-037).
  const idDisciplina = new Map<string, string>();
  for (const [nome, carga] of Object.entries(CARGA)) {
    const d = (await prisma.disciplina.findFirst({ where: { nome }, select: { id: true } })) ?? (await prisma.disciplina.create({ data: { nome, cargaHoraria: carga }, select: { id: true } }));
    idDisciplina.set(nome, d.id);
  }
  for (const [sigla, matriz] of Object.entries(MATRIZES) as [Sigla, Matriz][]) {
    const cursoId = base.cursos[sigla];
    for (const [i, semestre] of matriz.semestres.entries()) {
      for (const nome of semestre) {
        const obrigatoria = !matriz.optativas.includes(nome);
        await prisma.cursoDisciplina.upsert({
          where: { cursoId_disciplinaId: { cursoId, disciplinaId: idDisciplina.get(nome)! } },
          update: { semestre: i + 1, obrigatoria },
          create: { cursoId, disciplinaId: idDisciplina.get(nome)!, semestre: i + 1, obrigatoria },
        });
      }
    }
    await prisma.preRequisito.deleteMany({ where: { cursoId } });
    await prisma.preRequisito.createMany({
      data: Object.entries(matriz.requisitos).flatMap(([nome, reqs]) => reqs.map((r) => ({ cursoId, disciplinaId: idDisciplina.get(nome)!, requisitoId: idDisciplina.get(r)! }))),
      skipDuplicates: true,
    });
  }

  // Professores novos (uma senha só, com o hash calculado uma vez).
  await prisma.usuario.createMany({ data: PROFESSORES_NOVOS.map(([nome]) => ({ nome, email: emailDe(nome), senhaHash: hash, perfil: "Professor" as const })), skipDuplicates: true });
  const professoresPorCurso = {} as Record<Sigla, string[]>;
  for (const sigla of Object.keys(MATRIZES) as Sigla[]) {
    const emails = [...PROFESSORES_ANTIGOS[sigla], ...PROFESSORES_NOVOS.filter(([, s]) => s === sigla).map(([n]) => emailDe(n))];
    const contas = await prisma.usuario.findMany({ where: { email: { in: emails } }, select: { id: true, email: true } });
    professoresPorCurso[sigla] = emails.map((e) => contas.find((c) => c.email === e)?.id).filter((id): id is string => Boolean(id));
  }

  // Estudantes: em cada curso, os que já existiam formam a turma de ingresso A (2º semestre); completamos A até 30 e
  // criamos a B (4º semestre) com 30. Os nomes novos vêm de uma lista própria, sem repetir e-mail.
  const existentes = new Set((await prisma.usuario.findMany({ select: { email: true } })).map((u) => u.email));
  const fila = PRIMEIROS.flatMap((p, i) => SOBRENOMES.map((s, j) => ({ nome: `${p} ${s}`, ordem: (i * 7 + j * 13) % (PRIMEIROS.length * SOBRENOMES.length) }))).sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome));
  let proximo = 0;
  const novoNome = () => {
    for (;;) {
      const candidato = fila[proximo++].nome;
      if (!existentes.has(emailDe(candidato))) {
        existentes.add(emailDe(candidato));
        return candidato;
      }
    }
  };
  const grupos = {} as Record<Sigla, { A: string[]; B: string[] }>;
  for (const sigla of Object.keys(MATRIZES) as Sigla[]) {
    const cursoId = base.cursos[sigla];
    // A turma B fica marcada pela palavra "veterano" só aqui, no código: no banco, ela é quem tem histórico desde 2025/1.
    const jaNoCurso = await prisma.usuario.findMany({ where: { cursoId, perfil: "Estudante", email: { endsWith: "@studytrack.test" } }, select: { id: true, email: true }, orderBy: { email: "asc" } });
    const daB = await prisma.matricula.findMany({ where: { estudanteId: { in: jaNoCurso.map((e) => e.id) }, turma: { periodo: "2025/1" } }, select: { estudanteId: true }, distinct: ["estudanteId"] });
    const idsB = new Set(daB.map((m) => m.estudanteId));
    let A = jaNoCurso.filter((e) => !idsB.has(e.id)).map((e) => e.email);
    let B = jaNoCurso.filter((e) => idsB.has(e.id)).map((e) => e.email);
    const novos: { nome: string; grupo: "A" | "B" }[] = [];
    while (A.length + novos.filter((n) => n.grupo === "A").length < 30) novos.push({ nome: novoNome(), grupo: "A" });
    while (B.length + novos.filter((n) => n.grupo === "B").length < 30) novos.push({ nome: novoNome(), grupo: "B" });
    if (novos.length > 0) {
      await prisma.usuario.createMany({ data: novos.map((n) => ({ nome: n.nome, email: emailDe(n.nome), senhaHash: hash, perfil: "Estudante" as const, cursoId })), skipDuplicates: true });
    }
    A = [...A, ...novos.filter((n) => n.grupo === "A").map((n) => emailDe(n.nome))];
    B = [...B, ...novos.filter((n) => n.grupo === "B").map((n) => emailDe(n.nome))];
    grupos[sigla] = { A, B };
  }
  const contas = new Map((await prisma.usuario.findMany({ where: { perfil: "Estudante", email: { endsWith: "@studytrack.test" } }, select: { id: true, email: true, nome: true, ficha: { select: { situacaoCurso: true } } } })).map((u) => [u.email, u]));

  // Turmas de cada oferta (curso × período × semestre), reaproveitando as que já existem para a mesma disciplina.
  type TurmaPlano = { id: string; nome: string; periodo: string; professorId: string; sigla: Sigla; disciplina: string; estudantes: string[] };
  const turmas: TurmaPlano[] = [];
  for (const sigla of Object.keys(MATRIZES) as Sigla[]) {
    const cursoId = base.cursos[sigla];
    const professores = professoresPorCurso[sigla];
    const professorDaDisciplina = new Map<string, string>();
    MATRIZES[sigla].semestres.flat().forEach((nome, i) => professorDaDisciplina.set(nome, professores[i % professores.length]));
    for (const oferta of OFERTAS) {
      for (const nome of MATRIZES[sigla].semestres[oferta.semestre - 1]) {
        const disciplinaId = idDisciplina.get(nome)!;
        // Nome fixo: o semestre em andamento (2026/2) fica com o nome simples; os outros períodos ganham o sufixo
        // ano+semestre ("Turma ALG-CC-252" é a de 2025/2), para dois períodos nunca terem turmas com o mesmo nome.
        const nomeTurma = nomeDaTurma(nome, sigla, oferta.periodo);
        let turma = await prisma.turma.findFirst({ where: { cursoId, disciplinaId, periodo: oferta.periodo }, select: { id: true, nome: true, professorId: true }, orderBy: { nome: "asc" } });
        if (!turma) {
          turma = await prisma.turma.create({ data: { nome: nomeTurma, periodo: oferta.periodo, disciplinaId, professorId: professorDaDisciplina.get(nome)!, cursoId }, select: { id: true, nome: true, professorId: true } });
        } else if (turma.nome !== nomeTurma && !turmaAnterior(turma.nome, nome)) {
          turma = await prisma.turma.update({ where: { id: turma.id }, data: { nome: nomeTurma }, select: { id: true, nome: true, professorId: true } });
        }
        turmas.push({ ...turma, periodo: oferta.periodo, sigla, disciplina: nome, estudantes: grupos[sigla][oferta.grupo] });
      }
    }
  }

  // Avaliações.
  const avaliacoesDa = new Map<string, { id: string; nome: string; data: string; tipo: string }[]>();
  for (const t of turmas) {
    const atuais = await prisma.avaliacao.findMany({ where: { turmaId: t.id }, select: { nome: true } });
    const definicoes = t.periodo === "2026/2"
      ? AVALIACOES_ATUAIS
      : AVALIACOES_HISTORICO[t.periodo].map(([nome, data]) => ({ nome, peso: 1, data, tipo: "Prova" as const }));
    const faltam = definicoes.filter((d) => !atuais.some((a) => a.nome === d.nome));
    if (faltam.length) await prisma.avaliacao.createMany({ data: faltam.map((d) => ({ turmaId: t.id, nome: d.nome, peso: d.peso, data: paraData(d.data), tipo: d.tipo })) });
    const todas = await prisma.avaliacao.findMany({ where: { turmaId: t.id }, select: { id: true, nome: true, data: true, tipo: true } });
    avaliacoesDa.set(t.id, todas.map((a) => ({ id: a.id, nome: a.nome, data: a.data.toISOString().slice(0, 10), tipo: a.tipo })));
  }

  // Matrículas que faltam (estudante que não está Ativo não entra em turma de período aberto).
  const ids = turmas.map((t) => t.id);
  const ja = new Set((await prisma.matricula.findMany({ where: { turmaId: { in: ids } }, select: { estudanteId: true, turmaId: true } })).map((m) => `${m.estudanteId}:${m.turmaId}`));
  const novas: { estudanteId: string; turmaId: string; email: string; turma: TurmaPlano }[] = [];
  for (const t of turmas) {
    for (const email of t.estudantes) {
      const e = contas.get(email);
      if (!e || ja.has(`${e.id}:${t.id}`)) continue;
      if (t.periodo === "2026/2" && e.ficha?.situacaoCurso !== "Ativo") continue;
      novas.push({ estudanteId: e.id, turmaId: t.id, email, turma: t });
    }
  }
  await emLotes(novas, (lote) => prisma.matricula.createMany({ data: lote.map((m) => ({ estudanteId: m.estudanteId, turmaId: m.turmaId })), skipDuplicates: true }));

  // Aulas do período (se a turma ainda não tem nenhuma).
  const aulasDa = new Map<string, { id: string; data: string }[]>();
  for (const t of turmas) {
    let aulas = await prisma.aula.findMany({ where: { turmaId: t.id }, select: { id: true, data: true }, orderBy: [{ data: "asc" }, { numero: "asc" }] });
    if (aulas.length === 0) {
      await prisma.aula.createMany({ data: AULAS[t.periodo].filter((d) => d <= base.hoje).map((d) => ({ turmaId: t.id, data: paraData(d) })), skipDuplicates: true });
      aulas = await prisma.aula.findMany({ where: { turmaId: t.id }, select: { id: true, data: true }, orderBy: [{ data: "asc" }, { numero: "asc" }] });
    }
    aulasDa.set(t.id, aulas.map((a) => ({ id: a.id, data: a.data.toISOString().slice(0, 10) })));
  }

  // Matrículas do povoamento: as das turmas novas e as dos estudantes novos. Nelas, notas e presenças são as calculadas
  // aqui; a cada execução, o que estiver diferente volta ao valor calculado (como a simulação faz com as dela).
  const turmaPorId = new Map(turmas.map((t) => [t.id, t]));

  const todas = await prisma.matricula.findMany({ where: { turmaId: { in: ids } }, select: { estudanteId: true, turmaId: true, estudante: { select: { email: true } } } });
  const doPovoamento = todas.filter((m) => { const t = turmaPorId.get(m.turmaId)!; return !turmaAnterior(t.nome, t.disciplina) || estudanteDoPovoamento(m.estudante.email); });
  const alterados = new Set(novas.map((m) => `${m.estudanteId}:${m.turmaId}`));

  // Notas (com o lançamento no histórico de notas), só das avaliações que já aconteceram.
  const notasAtuais = new Map((await prisma.nota.findMany({ where: { avaliacao: { turmaId: { in: ids } } }, select: { id: true, avaliacaoId: true, estudanteId: true, valor: true } })).map((n) => [`${n.avaliacaoId}:${n.estudanteId}`, n]));
  const criar: { avaliacaoId: string; estudanteId: string; valor: number }[] = [];
  const historico: { avaliacaoId: string; estudanteId: string; autorId: string; valorAnterior: null; valorNovo: number; registradoEm: Date }[] = [];
  const corrigir = new Map<number, string[]>();
  for (const m of doPovoamento) {
    const turma = turmaPorId.get(m.turmaId)!;
    for (const a of avaliacoesDa.get(m.turmaId)!) {
      if (a.tipo === "Substitutiva" || a.tipo === "Exame" || a.data >= base.hoje) continue;
      const valor = valorDaNota(m.estudante.email, turma, a.id);
      const atual = notasAtuais.get(`${a.id}:${m.estudanteId}`);
      if (!atual) {
        criar.push({ avaliacaoId: a.id, estudanteId: m.estudanteId, valor });
        historico.push({ avaliacaoId: a.id, estudanteId: m.estudanteId, autorId: turma.professorId, valorAnterior: null, valorNovo: valor, registradoEm: new Date(`${a.data}T13:00:00Z`) });
      } else if (atual.valor !== valor) {
        corrigir.set(valor, [...(corrigir.get(valor) ?? []), atual.id]);
      } else continue;
      alterados.add(`${m.estudanteId}:${m.turmaId}`);
    }
  }
  await emLotes(criar, (lote) => prisma.nota.createMany({ data: lote, skipDuplicates: true }));
  await emLotes(historico, (lote) => prisma.historicoNota.createMany({ data: lote }));
  for (const [valor, lista] of corrigir) await emLotes(lista, (lote) => prisma.nota.updateMany({ where: { id: { in: lote } }, data: { valor } }));

  // Presenças, com as faltas espalhadas; a frequência sai delas (RB-21).
  const presencasAtuais = new Map((await prisma.presenca.findMany({ where: { aula: { turmaId: { in: ids } } }, select: { aulaId: true, estudanteId: true, presente: true } })).map((r) => [`${r.aulaId}:${r.estudanteId}`, r]));
  const novasPresencas: { aulaId: string; estudanteId: string; presente: boolean }[] = [];
  const virar = { true: [] as string[], false: [] as string[] };
  const frequencias: { estudanteId: string; turmaId: string; percentual: number }[] = [];
  for (const m of doPovoamento) {
    const aulas = aulasDa.get(m.turmaId)!;
    if (aulas.length === 0) continue;
    const lista = aulas.map((a, k) => ({ aulaId: a.id, estudanteId: m.estudanteId, presente: presenteNaAula(m.estudante.email, m.turmaId, k, aulas.length) }));
    let mudou = false;
    for (const p of lista) {
      const atual = presencasAtuais.get(`${p.aulaId}:${p.estudanteId}`);
      if (!atual) novasPresencas.push(p);
      else if (atual.presente !== p.presente) virar[String(p.presente) as "true" | "false"].push(`${p.aulaId}:${p.estudanteId}`);
      else continue;
      mudou = true;
    }
    if (mudou || alterados.has(`${m.estudanteId}:${m.turmaId}`)) {
      alterados.add(`${m.estudanteId}:${m.turmaId}`);
      frequencias.push({ estudanteId: m.estudanteId, turmaId: m.turmaId, percentual: frequenciaPelaChamada(lista.map((p) => p.presente))! });
    }
  }
  await emLotes(novasPresencas, (lote) => prisma.presenca.createMany({ data: lote, skipDuplicates: true }), 5000);
  // A chave da presença é aula + estudante: as correções são agrupadas por aula.
  for (const presente of [true, false]) {
    const porAula = new Map<string, string[]>();
    for (const par of virar[String(presente) as "true" | "false"]) {
      const [aulaId, estudanteId] = par.split(":");
      porAula.set(aulaId, [...(porAula.get(aulaId) ?? []), estudanteId]);
    }
    for (const [aulaId, estudantes] of porAula) await prisma.presenca.updateMany({ where: { aulaId, estudanteId: { in: estudantes } }, data: { presente } });
  }
  for (const f of frequencias) {
    await prisma.frequencia.upsert({ where: { estudanteId_turmaId: { estudanteId: f.estudanteId, turmaId: f.turmaId } }, update: { percentual: f.percentual }, create: f });
  }

  // Situação de cada matrícula nova ou alterada pela regra única (DA-02).
  for (const par of alterados) {
    const [estudanteId, turmaId] = par.split(":");
    await recalcularIndicador(estudanteId, turmaId);
  }

  // Exame final no histórico: quem ficou com média abaixo de 6,0 e frequência de pelo menos 75% faz exame (RB-29), e
  // três em cada quatro comparecem. Quem não está mais em exame perde a nota de exame que o povoamento tinha dado.
  const historicas = doPovoamento.filter((m) => turmaPorId.get(m.turmaId)!.periodo !== "2026/2");
  const indicadores = new Map((await prisma.indicadorAcademico.findMany({ where: { turmaId: { in: turmas.filter((t) => t.periodo !== "2026/2").map((t) => t.id) } }, select: { estudanteId: true, turmaId: true, media: true, frequenciaAtual: true } })).map((i) => [`${i.estudanteId}:${i.turmaId}`, i]));
  const exames = new Map((await prisma.avaliacao.findMany({ where: { turmaId: { in: [...new Set(historicas.map((m) => m.turmaId))] }, tipo: "Exame" }, select: { id: true, turmaId: true } })).map((a) => [a.turmaId, a.id]));
  const notasDeExame = new Map((await prisma.nota.findMany({ where: { avaliacaoId: { in: [...exames.values()] } }, select: { id: true, avaliacaoId: true, estudanteId: true, valor: true } })).map((n) => [`${n.avaliacaoId}:${n.estudanteId}`, n]));
  let comExame = 0;
  for (const m of historicas) {
    const ind = indicadores.get(`${m.estudanteId}:${m.turmaId}`);
    const elegivel = Boolean(ind && ind.media !== null && ind.media < 6 && ind.frequenciaAtual !== null && ind.frequenciaAtual >= 75);
    const vai = elegivel && hash01(`exame:${m.estudante.email}:${m.turmaId}`) <= 0.75;
    const exameId = exames.get(m.turmaId);
    const atual = exameId ? notasDeExame.get(`${exameId}:${m.estudanteId}`) : undefined;
    if (!vai) {
      if (atual) {
        await prisma.nota.delete({ where: { id: atual.id } });
        await recalcularIndicador(m.estudanteId, m.turmaId);
      }
      continue;
    }
    comExame++;
    const valor = meioPonto(3 + hash01(`ex:${m.estudante.email}:${m.turmaId}`) * 6.5);
    if (atual?.valor === valor) continue;
    let id = exameId;
    if (!id) {
      const fimDoPeriodo = AVALIACOES_HISTORICO[turmaPorId.get(m.turmaId)!.periodo]?.[1]?.[1] ?? "2026-06-12";
      id = (await prisma.avaliacao.create({ data: { turmaId: m.turmaId, nome: "Exame final", peso: 1, tipo: "Exame", data: new Date(paraData(fimDoPeriodo).getTime() + 10 * 86400000) }, select: { id: true } })).id;
      exames.set(m.turmaId, id);
    }
    await prisma.nota.upsert({ where: { avaliacaoId_estudanteId: { avaliacaoId: id, estudanteId: m.estudanteId } }, update: { valor }, create: { avaliacaoId: id, estudanteId: m.estudanteId, valor } });
    await recalcularIndicador(m.estudanteId, m.turmaId);
  }

  // Atividades e entregas das turmas novas de 2026/2.
  const atuais = turmas.filter((t) => t.periodo === "2026/2");
  for (const [indice, t] of atuais.entries()) {
    const definicoes = [
      { descricao: "Lista de exercícios 1", prazo: somarDias(base.hoje, -20) },
      { descricao: "Relatório parcial do projeto", prazo: somarDias(base.hoje, -5) },
      { descricao: "Lista de revisão", prazo: somarDias(base.hoje, 2 + (indice % 5)) },
      { descricao: "Projeto final", prazo: somarDias(base.hoje, 25) },
    ];
    const existentesAt = await prisma.atividade.findMany({ where: { turmaId: t.id }, select: { descricao: true } });
    const faltam = definicoes.filter((d) => !existentesAt.some((a) => a.descricao === d.descricao));
    if (faltam.length) await prisma.atividade.createMany({ data: faltam.map((d) => ({ turmaId: t.id, descricao: d.descricao, prazo: paraData(d.prazo) })) });
    const atividades = await prisma.atividade.findMany({ where: { turmaId: t.id, prazo: { lt: paraData(base.hoje) } }, select: { id: true, prazo: true } });
    const daTurma = novas.filter((m) => m.turmaId === t.id);
    // (entregas só para quem acabou de entrar; as das outras matrículas já foram criadas antes)
    const entregas = atividades.flatMap((a) =>
      daTurma.flatMap((m) => {
        const s = hash01(`entrega:${m.email}:${a.id}`);
        const perfil = perfilDe(m.email);
        const [noPrazo, atrasada] = perfil.centro >= 7 ? [0.9, 0.06] : perfil.centro >= 5 ? [0.7, 0.15] : [0.4, 0.3];
        if (s >= noPrazo + atrasada) return [];
        const prazo = a.prazo.toISOString().slice(0, 10);
        const data = s < noPrazo ? somarDias(prazo, -Math.floor(s * 3)) : somarDias(prazo, 1 + Math.floor(s * 3));
        return [{ atividadeId: a.id, estudanteId: m.estudanteId, dataEntrega: paraData(data <= base.hoje ? data : base.hoje) }];
      }),
    );
    if (entregas.length) await prisma.entrega.createMany({ data: entregas, skipDuplicates: true });

    // Um plano de recuperação para o primeiro estudante em Risco das turmas novas (SPEC-008).
    if (daTurma.length && !(await prisma.planoRecuperacao.findFirst({ where: { turmaId: t.id } }))) {
      const risco = await prisma.indicadorAcademico.findFirst({ where: { turmaId: t.id, situacao: "Risco", estudante: { email: { not: "estudante@studytrack.test" } } }, select: { estudanteId: true }, orderBy: { estudanteId: "asc" } });
      if (risco) {
        await prisma.planoRecuperacao.create({
          data: {
            estudanteId: risco.estudanteId, turmaId: t.id, professorId: t.professorId, criadoEm: new Date(`${somarDias(base.hoje, -10)}T12:00:00Z`),
            itens: { create: ITENS_PLANO.map((descricao, ordem) => ({ descricao, ordem, concluido: ordem < 1 + (indice % 3), concluidoEm: ordem < 1 + (indice % 3) ? new Date(`${somarDias(base.hoje, -8 + ordem * 2)}T12:00:00Z`) : null })) },
          },
        });
      }
    }
  }

  // SPEC-044: alguns trancamentos de disciplina já deferidos em 2026/2 (cerca de 1% das matrículas novas).
  const administrador = await prisma.usuario.findFirst({ where: { perfil: "Administrador", email: "admin@studytrack.test" }, select: { id: true } });
  const folgas = (await prisma.eventoCalendario.findMany({ where: { tipo: { in: ["Feriado", "Recesso"] } }, select: { tipo: true, titulo: true, inicio: true, fim: true } })).map((e) => ({ tipo: e.tipo, titulo: e.titulo, inicio: e.inicio.toISOString().slice(0, 10), fim: e.fim.toISOString().slice(0, 10) }));
  const abertas = new Set((await prisma.turma.findMany({ where: { periodo: "2026/2", diario: "Aberto" }, select: { id: true } })).map((t) => t.id));
  const paraTrancar = novas.filter((m) => abertas.has(m.turmaId) && m.email !== "estudante@studytrack.test" && hash01(`tranca:${m.email}:${m.turma.nome}`) < 0.01);
  for (const [k, m] of paraTrancar.entries()) {
    const abertoEm = somarDias("2026-10-05", k);
    const ultimo = await prisma.requerimento.findFirst({ where: { protocolo: { startsWith: "2026-" } }, select: { protocolo: true }, orderBy: { protocolo: "desc" } });
    await prisma.$transaction([
      prisma.requerimento.create({
        data: {
          protocolo: protocolo("2026", (ultimo ? Number(ultimo.protocolo.slice(5)) : 0) + 1), estudanteId: m.estudanteId, tipo: "TrancamentoDisciplina", destino: "Secretaria",
          turmaId: m.turmaId, descricao: "Preciso trancar esta disciplina por causa do horário de trabalho.", status: "Deferido", resposta: "Trancamento registrado.",
          prazo: paraData(somarDiasUteis(abertoEm, 5, folgas)), criadoEm: new Date(`${abertoEm}T13:00:00Z`), respondidoEm: new Date(`${somarDiasUteis(abertoEm, 2, folgas)}T17:00:00Z`), responsavelId: administrador?.id ?? null,
        },
      }),
      prisma.matricula.update({ where: { estudanteId_turmaId: { estudanteId: m.estudanteId, turmaId: m.turmaId } }, data: { situacao: "Trancada" } }),
    ]);
  }

  const totais = { estudantes: Object.values(grupos).reduce((s, g) => s + g.A.length + g.B.length, 0), turmas: turmas.length, matriculas: novas.length, alteradas: alterados.size, exames: comExame };
  console.log(`Faculdade povoada: ${totais.turmas} turmas (2025/1 a 2026/2), ${totais.estudantes} estudantes, ${totais.matriculas} matrícula(s) nova(s), ${totais.alteradas} com notas ou presenças recalculadas, ${totais.exames} exame(s) no histórico, ${paraTrancar.length} trancamento(s) novo(s) (${Math.round((Date.now() - inicio) / 1000)} s).`);
}

function somarDias(base: string, dias: number) {
  const d = paraData(base);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

async function emLotes<T>(itens: T[], gravar: (lote: T[]) => Promise<unknown>, tamanho = 2000) {
  for (let i = 0; i < itens.length; i += tamanho) await gravar(itens.slice(i, i + tamanho));
}
