// Dados de demonstração dos Níveis 5 e 6 (SPEC-045 a SPEC-059). Idempotente: a cada execução, o estado da
// apresentação volta ao mesmo ponto.
// - SPEC-052: regra de avaliação padrão (6,0 · 5,0 · 75% · 5,0) e indicadores dos períodos abertos recalculados com
//   ela; períodos encerrados sem regra guardada recebem a padrão.
// - SPEC-045: encarregado de dados da instituição. As contas da apresentação já aceitaram os termos e viram o tour,
//   menos a da coordenadora (Marina), que mostra o primeiro acesso: aceite, depois o tour.
// - SPEC-046: nenhum e-mail bloqueado. SPEC-058: os alunos importados numa demonstração anterior são removidos,
//   para a importação de exemplo (docs/exemplos) poder ser repetida.
import { VERSAO_TERMOS } from "../src/domain/lgpd";
import { REGRA_PADRAO } from "../src/domain/situacao-academica";
import { aplicarRegra } from "../src/server/academico/regras";
import { prisma } from "../src/server/dados/prisma";
import { regraParaGuardar } from "../src/server/dados/regras";

const CONTAS_COM_ACEITE = [
  "admin@studytrack.test", "professor@studytrack.test", "estudante@studytrack.test", "carla.mendes@studytrack.test",
  "ana.souza@studytrack.test", "henrique.dias@studytrack.test",
];
const CONTA_DO_PRIMEIRO_ACESSO = "coordenador@studytrack.test";
export const DOMINIO_DO_SISTEMA_ANTERIOR = "@anterior.faculdade-exemplo.test";

export async function exemplosDosNiveis5e6() {
  await prisma.instituicao.updateMany({
    where: { id: 1 },
    data: { ...REGRA_PADRAO, encarregadoNome: "Renata Duarte", encarregadoEmail: "privacidade@faculdade-exemplo.test" },
  });
  const mudancas = await prisma.$transaction((tx) => aplicarRegra({ periodoLetivo: { status: "Aberto" } }, REGRA_PADRAO, tx), { timeout: 120_000, maxWait: 10_000 });
  await prisma.periodoLetivo.updateMany({ where: { status: "Encerrado", regraMediaMinima: null }, data: regraParaGuardar(REGRA_PADRAO) });

  const contas = await prisma.usuario.findMany({ where: { email: { in: [...CONTAS_COM_ACEITE, CONTA_DO_PRIMEIRO_ACESSO] } }, select: { id: true, email: true } });
  const comAceite = contas.filter((c) => c.email !== CONTA_DO_PRIMEIRO_ACESSO).map((c) => c.id);
  await prisma.aceiteTermos.createMany({ data: comAceite.map((usuarioId) => ({ usuarioId, versao: VERSAO_TERMOS })), skipDuplicates: true });
  await prisma.usuario.updateMany({ where: { id: { in: comAceite }, tourVistoEm: null }, data: { tourVistoEm: new Date() } });
  const primeiro = contas.find((c) => c.email === CONTA_DO_PRIMEIRO_ACESSO);
  if (primeiro) {
    await prisma.aceiteTermos.deleteMany({ where: { usuarioId: primeiro.id } });
    await prisma.usuario.update({ where: { id: primeiro.id }, data: { tourVistoEm: null } });
  }

  await prisma.tentativaLogin.deleteMany({});
  const importados = await prisma.usuario.deleteMany({ where: { email: { endsWith: DOMINIO_DO_SISTEMA_ANTERIOR } } });

  const mudaram = mudancas.total - mudancas.semMudanca;
  console.log(
    `Níveis 5 e 6 prontos: regra padrão (${mudaram} indicador(es) corrigido(s)), encarregado de dados, aceite das contas da apresentação (Marina mostra o primeiro acesso)` +
      (importados.count ? `, ${importados.count} aluno(s) importado(s) removido(s)` : "") + ".",
  );
}
