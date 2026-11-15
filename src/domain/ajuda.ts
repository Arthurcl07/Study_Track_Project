// Ajuda: tour do primeiro acesso e manual de cada perfil (SPEC-059, RF-65). Funções puras: sem Next.js nem Prisma.
// Os itens do tour apontam para os itens do menu (o id de cada item da casca).
import type { Perfil } from "./perfil";
import { REGRA_PADRAO, textoDaRegra, type RegraAvaliacao } from "./situacao-academica";

export type PassoDoTour = { alvo: string; titulo: string; texto: string };
export type ItemDoManual = { titulo: string; texto: string };
export type Pergunta = { pergunta: string; resposta: string };

const TOUR: Record<Perfil, PassoDoTour[]> = {
  Estudante: [
    { alvo: "inicio", titulo: "Seu dashboard", texto: "Média, frequência e situação de cada disciplina, os alertas e o simulador “Quanto preciso tirar?”." },
    { alvo: "atividades", titulo: "Minhas atividades", texto: "Prazos das atividades, o que está pendente e o que já foi entregue." },
    { alvo: "meucurso", titulo: "Meu curso", texto: "A matriz do curso, o que você já cursou e quanto falta para se formar." },
    { alvo: "requerimentos", titulo: "Requerimentos", texto: "Peça revisão de prova, segunda chamada, declaração ou trancamento, com protocolo e prazo." },
    { alvo: "documentos", titulo: "Documentos", texto: "Boletim e histórico escolar prontos para baixar em PDF." },
    { alvo: "ajuda", titulo: "Ajuda", texto: "O manual e as perguntas frequentes ficam aqui. Dá para rever este tour quando quiser." },
  ],
  Professor: [
    { alvo: "inicio", titulo: "Suas turmas", texto: "Cada turma com a situação dos estudantes, os alertas e o diário de classe." },
    { alvo: "notas", titulo: "Notas e avaliações", texto: "Cadastre provas e trabalhos e lance as notas; a situação de cada estudante muda na hora." },
    { alvo: "frequencia", titulo: "Chamada", texto: "Registre a presença de cada aula (até 4 por dia); a frequência é calculada sozinha." },
    { alvo: "relatorios", titulo: "Relatórios", texto: "O relatório das suas turmas em tela, Excel, PDF ou CSV." },
    { alvo: "requerimentos", titulo: "Requerimentos", texto: "Revisões de prova e segundas chamadas que os estudantes pedem para você." },
    { alvo: "ajuda", titulo: "Ajuda", texto: "O manual do professor e as perguntas frequentes. Dá para rever este tour quando quiser." },
  ],
  Coordenador: [
    { alvo: "inicio", titulo: "Visão do curso", texto: "Quantos estão em Risco, quem sumiu das aulas e o que os professores estão devendo, num só lugar." },
    { alvo: "turmas", titulo: "Turmas e estudantes", texto: "Crie turmas, matricule estudantes, monte horários e importe planilhas." },
    { alvo: "relatorios", titulo: "Relatórios", texto: "Filtre por curso, turma e situação e baixe em Excel, PDF ou CSV." },
    { alvo: "evasao", titulo: "Evasão", texto: "Estudantes com 3 faltas seguidas ou sem presença há 14 dias. Você é avisado quando alguém entra na lista." },
    { alvo: "acompanhamento", titulo: "Acompanhamento", texto: "Chamadas atrasadas, notas por lançar e diários não fechados de cada professor." },
    { alvo: "diarios", titulo: "Diários", texto: "Homologue os diários fechados pelos professores e imprima a ata de resultados." },
  ],
  Administrador: [
    { alvo: "inicio", titulo: "Painel da secretaria", texto: "Contas, estudantes por situação no curso e pedidos de senha pendentes." },
    { alvo: "contas", titulo: "Contas", texto: "Crie contas, troque o perfil, desative e importe professores por planilha." },
    { alvo: "estudantes", titulo: "Estudantes", texto: "Ficha de cada estudante, situação no curso, abonos e documentos." },
    { alvo: "configuracoes", titulo: "Configurações", texto: "Regras de avaliação da instituição, com a prévia do efeito antes de salvar." },
    { alvo: "saude", titulo: "Saúde do sistema", texto: "Banco, tempo das consultas e os erros recentes, com a busca pelo código." },
    { alvo: "ajuda", titulo: "Ajuda", texto: "O manual da secretaria e as perguntas frequentes. Dá para rever este tour quando quiser." },
  ],
};

export function tourDoPerfil(perfil: Perfil): PassoDoTour[] {
  return TOUR[perfil];
}

// INV-059-01: o tour aparece até ser concluído ou pulado.
export const mostrarTour = (tourVistoEm: Date | null | undefined) => !tourVistoEm;

const MANUAL: Record<Perfil, ItemDoManual[]> = {
  Estudante: [
    { titulo: "Dashboard", texto: "Sua média, frequência e situação em cada disciplina, os alertas, os próximos prazos e o simulador de notas." },
    { titulo: "Minhas atividades", texto: "Prazos das atividades de cada turma, com o status No prazo, Pendente ou Atrasada." },
    { titulo: "Meu curso", texto: "A matriz do curso, o que você já cursou (inclusive no sistema anterior e por aproveitamento) e quanto falta para se formar." },
    { titulo: "Rematrícula", texto: "Escolha as turmas do próximo semestre quando a janela estiver aberta." },
    { titulo: "Requerimentos", texto: "Peça revisão de prova, segunda chamada, declaração, trancamento de disciplina ou do curso." },
    { titulo: "Documentos", texto: "Boletim de cada período e histórico escolar em PDF." },
    { titulo: "Meus dados", texto: "O que a instituição guarda sobre você e o download de todos os seus dados (LGPD)." },
  ],
  Professor: [
    { titulo: "Dashboard", texto: "Suas turmas com a situação dos estudantes, os alertas e o cartão do diário." },
    { titulo: "Notas e avaliações", texto: "Cadastre provas, trabalhos, substitutiva e exame e lance ou corrija notas." },
    { titulo: "Chamada", texto: "Presença de cada aula; feriados do calendário não aceitam chamada." },
    { titulo: "Atividades", texto: "Atividades com prazo e o registro das entregas." },
    { titulo: "Turma", texto: "Dashboard da turma, plano de recuperação e os documentos oficiais: ata, diário impresso e lista de presença." },
    { titulo: "Relatórios", texto: "Relatório das suas turmas em tela, Excel, PDF ou CSV." },
  ],
  Coordenador: [
    { titulo: "Dashboard", texto: "Totais do curso, estudantes em Risco, em evasão e as pendências dos professores." },
    { titulo: "Disciplinas, turmas e estudantes", texto: "Cadastro, matrícula, horários, vagas e importação por planilha." },
    { titulo: "Evasão", texto: "Quem sumiu das aulas (3 faltas seguidas ou 14 dias sem presença). Nada é gravado: a lista é recalculada a cada abertura." },
    { titulo: "Acompanhamento", texto: "Chamada atrasada há mais de 7 dias, prova sem nota e diário não fechado, por professor." },
    { titulo: "Diários", texto: "Homologue ou devolva os diários; com o diário homologado, a ata de resultados fica disponível." },
    { titulo: "Relatórios e auditoria", texto: "Relatório em Excel, PDF ou CSV e as ações acadêmicas dos seus cursos." },
  ],
  Administrador: [
    { titulo: "Contas", texto: "Criar, editar, trocar perfil, desativar e importar professores por planilha." },
    { titulo: "Estudantes", texto: "Ficha, situação no curso, abonos de faltas, aproveitamentos e documentos." },
    { titulo: "Períodos e virada", texto: "Abrir e encerrar períodos (o encerramento guarda a regra de avaliação) e copiar turmas para o próximo semestre." },
    { titulo: "Configurações", texto: "Regras de avaliação: média mínima, limite de Risco, frequência mínima e nota do exame, com prévia do efeito." },
    { titulo: "Importar do sistema anterior", texto: "Alunos e histórico por planilha, com prévia; tudo ou nada." },
    { titulo: "Saúde do sistema", texto: "Banco, tempo das consultas e erros recentes; o código que aparece na página de erro é achado aqui." },
  ],
};

export function manualDoPerfil(perfil: Perfil): ItemDoManual[] {
  return MANUAL[perfil];
}

const umaCasa = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function perguntasFrequentes(perfil: Perfil, regra: RegraAvaliacao = REGRA_PADRAO): Pergunta[] {
  const comuns: Pergunta[] = [
    { pergunta: "O que é Atenção e Risco?", resposta: `Atenção: média entre ${umaCasa(regra.limiteRisco)} e ${umaCasa(regra.mediaMinima)}. Risco: média abaixo de ${umaCasa(regra.limiteRisco)} ou frequência abaixo de ${regra.frequenciaMinima}%. Regra atual: ${textoDaRegra(regra)}.` },
    { pergunta: "Esqueci minha senha", resposta: "No login, clique em Esqueci minha senha; a secretaria libera uma senha provisória." },
    { pergunta: "Errei a senha várias vezes", resposta: "Depois de 5 tentativas erradas, o e-mail fica bloqueado por 15 minutos. Espere ou peça uma senha nova." },
  ];
  const especificas: Record<Perfil, Pergunta[]> = {
    Estudante: [{ pergunta: "Como tranco uma disciplina?", resposta: "Em Requerimentos, escolha Trancamento de disciplina e a turma; a secretaria defere." }],
    Professor: [{ pergunta: "Por que não consigo lançar nota?", resposta: "Turma de período encerrado ou com o diário fechado fica somente leitura." }],
    Coordenador: [{ pergunta: "Quando sai a ata de resultados?", resposta: "Assim que você homologa o diário da turma (ou quando o período é encerrado)." }],
    Administrador: [{ pergunta: "Mudar a regra muda as notas antigas?", resposta: "Não. Períodos encerrados guardam a regra com que foram encerrados; só os abertos são recalculados." }],
  };
  return [...especificas[perfil], ...comuns];
}
