// Caso de uso "Importar estudantes por planilha" (SPEC-021, RF-30, UC-20). Quem pode: Coordenador da turma
// (RB-04), conferido na rota pelo perfil e aqui pela query (ADR-003). Prévia não grava (INV-021-02); a
// confirmação grava tudo ou nada numa transação (INV-021-01), com a auditoria (SPEC-019).
import { randomInt } from "node:crypto";
import { lerCsv, preverImportacao, resumoDaPrevia, type ContaExistente } from "@/domain/importacao";
import { gerarHashSenha } from "@/server/auth/senha";
import { auditar, turmaParaAuditoria } from "@/server/dados/auditoria";
import { turmaSobResponsabilidade } from "@/server/dados/estrutura";
import { prisma } from "@/server/dados/prisma";
import type { Falha, Resultado } from "./cadastros";
import { travaDoPeriodo } from "./periodos";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });
const TAMANHO_MAXIMO = 200_000;

// INV-021-04: senha provisória aleatória, 12 caracteres sem os ambíguos (0/O, 1/l/I), em 3 blocos.
const ALFABETO = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function gerarSenhaProvisoria(): string {
  const bloco = () => Array.from({ length: 4 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
  return `${bloco()}-${bloco()}-${bloco()}`;
}

export async function importarEstudantes(entrada: Record<string, unknown>, turmaId: string, coordenadorId: string) {
  const turma = await turmaSobResponsabilidade(coordenadorId, turmaId);
  if (!turma) return falha({ tipo: "fora-do-escopo" });
  const trava = await travaDoPeriodo({ id: turmaId });
  if (trava) return falha(trava);

  const csv = typeof entrada.csv === "string" ? entrada.csv : "";
  if (!csv.trim()) return falha({ tipo: "invalido", erros: { csv: "Escolha o arquivo CSV." } });
  if (csv.length > TAMANHO_MAXIMO) return falha({ tipo: "invalido", erros: { csv: "Arquivo grande demais (máximo de 200 KB)." } });
  const leitura = lerCsv(csv);
  if (!leitura.ok) return falha({ tipo: "invalido", erros: { csv: leitura.erro } });

  const emails = [...new Set(leitura.linhas.map((l) => l.email))];
  const existentes = await prisma.usuario.findMany({
    where: { email: { in: emails } },
    select: { email: true, perfil: true, ativo: true, cursoId: true, matriculas: { where: { turmaId }, select: { turmaId: true } } },
  });
  const contas = new Map<string, ContaExistente>(existentes.map((c) => [c.email, { perfil: c.perfil, ativo: c.ativo, cursoId: c.cursoId, matriculado: c.matriculas.length > 0 }]));
  const linhas = preverImportacao(leitura.linhas, contas, turma.cursoId);
  const resumo = resumoDaPrevia(linhas);

  if (entrada.confirmar !== true) return sucesso({ gravado: false, linhas, resumo, senhas: [] });
  // AC-021-03: com qualquer erro a confirmação é recusada, mesmo se enviada direto à API.
  if (resumo.erros > 0) return falha({ tipo: "invalido", erros: { csv: `A planilha tem ${resumo.erros} linha(s) com erro. Corrija e envie de novo: nada foi gravado.` } });
  if (resumo.criar + resumo.matricular === 0) return falha({ tipo: "invalido", erros: { csv: "Todos os estudantes da planilha já estão matriculados nesta turma." } });

  const novas = await Promise.all(
    linhas.filter((l) => l.acao === "criar").map(async (l) => {
      const senha = gerarSenhaProvisoria();
      return { nome: l.nome, email: l.email, senha, senhaHash: await gerarHashSenha(senha) };
    }),
  );
  const paraMatricular = linhas.filter((l) => l.acao === "matricular").map((l) => l.email);

  await prisma.$transaction(
    async (tx) => {
      const ids: string[] = [];
      for (const n of novas) {
        // RB-15 / INV-021-04: conta nova de Estudante, do curso da turma, com troca de senha obrigatória.
        const criada = await tx.usuario.create({ data: { nome: n.nome, email: n.email, senhaHash: n.senhaHash, perfil: "Estudante", trocarSenha: true, cursoId: turma.cursoId }, select: { id: true } });
        ids.push(criada.id);
      }
      const existentesIds = (await tx.usuario.findMany({ where: { email: { in: paraMatricular } }, select: { id: true } })).map((u) => u.id);
      await tx.matricula.createMany({ data: [...ids, ...existentesIds].map((estudanteId) => ({ estudanteId, turmaId })), skipDuplicates: true });
      const contexto = await turmaParaAuditoria(turmaId, tx);
      await auditar(tx, {
        autorId: coordenadorId,
        acao: "importacao",
        ...contexto,
        descricao: `${contexto.rotulo}: ${novas.length} conta(s) nova(s), ${novas.length + existentesIds.length} matrícula(s)`,
        depois: { contasNovas: novas.map((n) => n.email), matriculados: paraMatricular },
      });
    },
    { timeout: 60_000 },
  );

  return sucesso({ gravado: true, linhas, resumo, senhas: novas.map(({ nome, email, senha }) => ({ nome, email, senha })) });
}
