// Caso de uso "Importar do sistema anterior" (SPEC-058, RF-64, RB-49, UC-50). Só a secretaria (recurso secretaria).
// Prévia não grava; confirmar grava contas, fichas, histórico anterior e auditoria numa transação só (INV-058-01).
import { hojeEmBrasilia } from "@/domain/atividades";
import { aprovadoNoAnterior, COLUNAS_ALUNOS, COLUNAS_HISTORICO, lerPlanilha, validarAlunos, validarHistorico, type ErroDeLinha } from "@/domain/importacao-anterior";
import { integralizacao } from "@/domain/matriz";
import { gerarHashSenha } from "@/server/auth/senha";
import { auditar } from "@/server/dados/auditoria";
import { prisma } from "@/server/dados/prisma";
import { regraVigente } from "@/server/dados/regras";
import type { Falha, Resultado } from "./cadastros";
import { gerarSenhaProvisoria } from "./importacao";
import { matrizDoCurso } from "./matriz";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });
const TAMANHO_MAXIMO = 2_000_000;
const normalizar = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

export async function importarDoSistemaAnterior(entrada: Record<string, unknown>, administradorId: string) {
  const textoAlunos = typeof entrada.alunos === "string" ? entrada.alunos : "";
  const textoHistorico = typeof entrada.historico === "string" ? entrada.historico : "";
  if (!textoAlunos.trim()) return falha({ tipo: "invalido", erros: { alunos: "Escolha a planilha de alunos." } });
  if (textoAlunos.length + textoHistorico.length > TAMANHO_MAXIMO) return falha({ tipo: "invalido", erros: { alunos: "Arquivos grandes demais (máximo de 2 MB)." } });
  const lidaAlunos = lerPlanilha(textoAlunos, COLUNAS_ALUNOS, "alunos");
  if (!lidaAlunos.ok) return falha({ tipo: "invalido", erros: { alunos: lidaAlunos.erro } });
  const lidaHistorico = textoHistorico.trim() ? lerPlanilha(textoHistorico, COLUNAS_HISTORICO, "histórico") : ({ ok: true, linhas: [] } as const);
  if (!lidaHistorico.ok) return falha({ tipo: "invalido", erros: { historico: lidaHistorico.erro } });

  const emails = lidaAlunos.linhas.map((l) => l.valores.email.toLowerCase());
  const matriculas = lidaAlunos.linhas.map((l) => l.valores.matricula);
  const [cursos, contas, fichas, regra] = await Promise.all([
    prisma.curso.findMany({ select: { id: true, nome: true } }),
    prisma.usuario.findMany({ where: { email: { in: emails } }, select: { email: true } }),
    prisma.fichaEstudante.findMany({ where: { OR: [{ numeroMatricula: { in: matriculas } }, { cpf: { not: null } }] }, select: { numeroMatricula: true, cpf: true } }),
    regraVigente(),
  ]);
  const { alunos, erros: errosAlunos } = validarAlunos(
    lidaAlunos.linhas,
    {
      cursos: new Map(cursos.map((c) => [normalizar(c.nome), c])),
      emails: new Set(contas.map((c) => c.email)),
      matriculas: new Set(fichas.map((f) => f.numeroMatricula)),
      cpfs: new Set(fichas.flatMap((f) => (f.cpf ? [f.cpf] : []))),
    },
    hojeEmBrasilia(),
  );
  const cursosUsados = [...new Set(alunos.map((a) => a.cursoId))];
  const matrizes = new Map(await Promise.all(cursosUsados.map(async (id) => [id, await matrizDoCurso(id)] as const)));
  const { registros, erros: errosHistorico } = validarHistorico(
    lidaHistorico.linhas,
    alunos,
    new Map([...matrizes].map(([id, m]) => [id, new Map(m.map((d) => [normalizar(d.nome), { id: d.disciplinaId, nome: d.nome }]))])),
  );
  const erros: ErroDeLinha[] = [...errosAlunos, ...errosHistorico];
  const aprovados = registros.filter((r) => aprovadoNoAnterior(r, regra)).length;
  // Integralização que cada aluno terá com os aprovados (só o que veio do sistema anterior).
  const previa = alunos.map((a) => {
    const dele = registros.filter((r) => r.matricula === a.matricula);
    const aprovadas = new Set(dele.filter((r) => aprovadoNoAnterior(r, regra)).map((r) => r.disciplinaId));
    const i = integralizacao(matrizes.get(a.cursoId) ?? [], { aprovadas, aproveitadas: new Set(), cursando: new Set(), reprovadas: new Set() });
    return { nome: a.nome, matricula: a.matricula, curso: a.curso, registros: dele.length, integralizacao: i.percentual };
  });
  const resumo = { alunos: alunos.length, registros: registros.length, aprovados, erros: erros.length };

  if (entrada.confirmar !== true) return sucesso({ gravado: false, resumo, previa, erros, senhas: [] as { nome: string; email: string; senha: string }[] });
  // AC-058-03 / AC-058-04: com qualquer erro, nada é gravado.
  if (erros.length > 0) return falha({ tipo: "invalido", erros: { alunos: `As planilhas têm ${erros.length} linha(s) com erro. Corrija e envie de novo: nada foi gravado.` } });

  const comSenha = await Promise.all(alunos.map(async (a) => { const senha = gerarSenhaProvisoria(); return { ...a, senha, senhaHash: await gerarHashSenha(senha) }; }));
  await prisma.$transaction(
    async (tx) => {
      const ids = new Map<string, string>();
      for (const a of comSenha) {
        // RB-15: senha provisória; o gatilho do banco cria a ficha, que recebe a matrícula do sistema anterior.
        const conta = await tx.usuario.create({ data: { nome: a.nome, email: a.email, senhaHash: a.senhaHash, perfil: "Estudante", trocarSenha: true, cursoId: a.cursoId }, select: { id: true } });
        await tx.fichaEstudante.update({
          where: { estudanteId: conta.id },
          data: { numeroMatricula: a.matricula, cpf: a.cpf, dataNascimento: a.nascimento ? new Date(`${a.nascimento}T00:00:00Z`) : null, telefone: a.telefone },
        });
        ids.set(a.matricula, conta.id);
      }
      if (registros.length > 0) {
        await tx.historicoAnterior.createMany({
          data: registros.map((r) => ({ estudanteId: ids.get(r.matricula)!, disciplinaId: r.disciplinaId, periodo: r.periodo, media: r.media, frequencia: r.frequencia })),
        });
      }
      // SPEC-019: um registro por curso (o coordenador vê os do curso dele).
      for (const cursoId of cursosUsados) {
        const doCurso = alunos.filter((a) => a.cursoId === cursoId);
        const nRegistros = registros.filter((r) => doCurso.some((a) => a.matricula === r.matricula)).length;
        await auditar(tx, {
          autorId: administradorId,
          acao: "importacao.anterior",
          cursoId,
          descricao: `${doCurso[0].curso}: ${doCurso.length} aluno(s) e ${nRegistros} registro(s) de histórico do sistema anterior`,
          depois: { matriculas: doCurso.map((a) => a.matricula), registros: nRegistros },
        });
      }
    },
    { timeout: 120_000, maxWait: 10_000 },
  );
  return sucesso({ gravado: true, resumo, previa, erros, senhas: comSenha.map(({ nome, email, senha }) => ({ nome, email, senha })) });
}
