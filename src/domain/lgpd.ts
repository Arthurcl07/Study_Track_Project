// Termos de uso, política de privacidade e dados do titular (SPEC-045, RF-54, RB-43, OPEN-067).
// Funções puras: sem Next.js nem Prisma.
import { semSegredos } from "./auditoria";

// Versão vigente dos termos. Mudar a versão faz todo usuário aceitar de novo (AC-045-03).
export const VERSAO_TERMOS = "1.0";
export const DATA_TERMOS = "14/11/2026";

export const MENSAGEM_ACEITAR_TERMOS = "Aceite os termos de uso e a política de privacidade para continuar.";

export type Encarregado = { nome: string | null; email: string | null };

// RB-43: sem aceite da versão vigente, só o aceite, os termos e o Sair.
export function precisaAceitar(versoesAceitas: readonly string[], vigente: string = VERSAO_TERMOS): boolean {
  return !versoesAceitas.includes(vigente);
}

export const TERMOS_DE_USO: readonly string[] = [
  "O StudyTrack é o sistema acadêmico da instituição. Ele mostra notas, frequência, atividades, requerimentos e documentos de quem estuda, leciona ou coordena.",
  "A conta é pessoal: não compartilhe a sua senha. Tudo o que é feito com a conta fica registrado na auditoria em nome do titular.",
  "Professores e coordenação registram apenas dados acadêmicos das turmas e cursos sob a responsabilidade deles. A secretaria cuida das contas, das fichas e dos documentos oficiais.",
  "Depois de 5 tentativas erradas de entrar, o e-mail fica bloqueado por 15 minutos.",
  "Uso indevido (acessar dados de outra pessoa, tentar burlar o sistema) pode levar à suspensão da conta e às medidas do regimento da instituição.",
];

export function politicaDePrivacidade(encarregado: Encarregado): string[] {
  const contato = encarregado.nome || encarregado.email
    ? `Encarregado pelo tratamento de dados: ${[encarregado.nome, encarregado.email].filter(Boolean).join(" — ")}.`
    : "Encarregado pelo tratamento de dados: secretaria acadêmica da instituição.";
  return [
    "Tratamos seus dados de cadastro e acadêmicos para cumprir o contrato de ensino e as obrigações legais da instituição (LGPD, art. 7º, II e V).",
    "Não vendemos nem compartilhamos seus dados com terceiros. Eles só saem do sistema nos documentos oficiais e nas exportações exigidas por lei (Censo da Educação Superior).",
    "Você pode baixar todos os seus dados a qualquer momento em Meus dados. O pedido fica registrado na auditoria.",
    "O histórico escolar tem guarda permanente; por isso a conta não é apagada a pedido, mas pode ser desativada pela secretaria.",
    contato,
  ];
}

// "O que guardamos" na página Meus dados (SPEC-045).
export const DADOS_GUARDADOS: readonly { dado: string; finalidade: string; prazo: string }[] = [
  { dado: "Nome, e-mail, CPF, nascimento e telefone", finalidade: "Cadastro e documentos", prazo: "Enquanto houver vínculo + 5 anos" },
  { dado: "Notas, frequência e histórico", finalidade: "Vida acadêmica (obrigação legal)", prazo: "Permanente (histórico escolar)" },
  { dado: "Requerimentos e notificações", finalidade: "Atendimento", prazo: "5 anos" },
  { dado: "Aceites e acessos", finalidade: "Segurança e auditoria", prazo: "5 anos" },
];

// INV-045-02 e INV-045-03: o pacote leva só o que foi lido do titular e nunca senha, hash ou token.
export function pacoteDeDados<T extends Record<string, unknown>>(dados: T, geradoEm: Date) {
  return {
    sistema: "StudyTrack",
    descricao: "Dados pessoais e acadêmicos do titular (LGPD, art. 18).",
    geradoEm: geradoEm.toISOString(),
    versaoDosTermos: VERSAO_TERMOS,
    ...semSegredos(dados),
  };
}

export function nomeDoArquivoDeDados(nome: string, data: Date): string {
  const base = nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `meus-dados-${base || "titular"}-${data.toISOString().slice(0, 10)}.json`;
}
