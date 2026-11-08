// Dados de demonstração do Nível 1 (SPEC-026 a SPEC-035), fictícios e idempotentes: dados da instituição, tipos das
// avaliações, uma substitutiva e um exame final, um dia com aula dupla, um abono, um estudante trancado e um pedido de
// senha pendente. Frequência e situação saem das regras do sistema (recalcularFrequencia e recalcularIndicador).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { recalcularIndicador } from "../src/server/academico/indicador";
import { auditar } from "../src/server/dados/auditoria";
import { paraData } from "../src/server/dados/atividades";
import { recalcularFrequencia } from "../src/server/dados/chamada";
import { prisma } from "../src/server/dados/prisma";
import { AULAS_2026_2 } from "./simulacao";

// Contas de demonstração usadas na apresentação: a secretaria não mexe nelas.
const CONTAS_DA_APRESENTACAO = ["estudante@studytrack.test", "carla.mendes@studytrack.test", "ana.souza@studytrack.test"];

export async function exemplosDaSecretaria(base: { administradorId: string }) {
  // SPEC-029: mesma regra da migração — o que não começa com "Prova" é Trabalho (só as avaliações ainda "Prova").
  await prisma.avaliacao.updateMany({ where: { tipo: "Prova", NOT: { nome: { startsWith: "Prova", mode: "insensitive" } } }, data: { tipo: "Trabalho" } });

  // SPEC-033: dados da instituição (fictícios; CNPJ com dígitos válidos, de exemplo).
  await prisma.instituicao.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nome: "Faculdade Exemplo de Tecnologia",
      cnpj: "12.345.678/0001-95",
      endereco: "Rua das Flores, 100 — Centro",
      cidadeUf: "Campinas/SP",
      telefone: "(19) 3333-4444",
      email: "secretaria@faculdade-exemplo.test",
      responsavelSecretaria: "Renata Duarte",
    },
  });
  // Logotipo fictício (prisma/assets), só quando a instituição ainda não tem um: o enviado pela tela não é trocado.
  const semLogo = await prisma.instituicao.findFirst({ where: { id: 1, logotipo: null }, select: { id: true } });
  if (semLogo) {
    const png = readFileSync(join(process.cwd(), "prisma", "assets", "logo-faculdade-exemplo.png"));
    await prisma.instituicao.update({ where: { id: 1 }, data: { logotipo: `data:image/png;base64,${png.toString("base64")}` } });
  }
  console.log("Instituição pronta: Faculdade Exemplo de Tecnologia");

  // SPEC-029: substitutiva (ainda sem notas) em Modelagem de Software e exame final do João em Cálculo Básico (2026/1).
  const msa = await prisma.turma.findFirst({ where: { nome: "Turma MS-A", periodo: "2026/2" }, select: { id: true } });
  if (msa && !(await prisma.avaliacao.findFirst({ where: { turmaId: msa.id, tipo: "Substitutiva" } }))) {
    await prisma.avaliacao.create({ data: { turmaId: msa.id, nome: "Substitutiva", tipo: "Substitutiva", peso: 1, data: paraData("2026-12-03") } });
  }
  const cb = await prisma.turma.findFirst({ where: { nome: "Turma CB-ECO", periodo: "2026/1" }, select: { id: true } });
  const joao = await prisma.usuario.findUnique({ where: { email: "estudante@studytrack.test" }, select: { id: true } });
  if (cb && joao) {
    const exame =
      (await prisma.avaliacao.findFirst({ where: { turmaId: cb.id, tipo: "Exame" } })) ??
      (await prisma.avaliacao.create({ data: { turmaId: cb.id, nome: "Exame final", tipo: "Exame", peso: 1, data: paraData("2026-06-26") } }));
    const matriculado = await prisma.matricula.findUnique({ where: { estudanteId_turmaId: { estudanteId: joao.id, turmaId: cb.id } } });
    if (matriculado) {
      await prisma.nota.upsert({ where: { avaliacaoId_estudanteId: { avaliacaoId: exame.id, estudanteId: joao.id } }, update: {}, create: { avaliacaoId: exame.id, estudanteId: joao.id, valor: 7 } });
    }
  }

  // SPEC-028: aula dupla no último dia de chamada de Sistemas Operacionais (a 2ª aula com as mesmas presenças da 1ª).
  const sob = await prisma.turma.findFirst({ where: { nome: "Turma SO-B", periodo: "2026/2" }, select: { id: true } });
  const ultimoDia = AULAS_2026_2[AULAS_2026_2.length - 1];
  if (sob) {
    const primeira = await prisma.aula.findUnique({ where: { turmaId_data_numero: { turmaId: sob.id, data: paraData(ultimoDia), numero: 1 } }, select: { presencas: true } });
    const segunda = await prisma.aula.findUnique({ where: { turmaId_data_numero: { turmaId: sob.id, data: paraData(ultimoDia), numero: 2 } } });
    if (primeira && !segunda) {
      const aula = await prisma.aula.create({ data: { turmaId: sob.id, data: paraData(ultimoDia), numero: 2 } });
      await prisma.presenca.createMany({ data: primeira.presencas.map((p) => ({ aulaId: aula.id, estudanteId: p.estudanteId, presente: p.presente })) });
      for (const p of primeira.presencas) {
        await recalcularFrequencia(p.estudanteId, sob.id, prisma);
        await recalcularIndicador(p.estudanteId, sob.id);
      }
    }
  }

  // SPEC-032: abono por atestado médico para um estudante da simulação que faltou num dia de 2026/2.
  const falta = await prisma.presenca.findFirst({
    where: { presente: false, aula: { turma: { periodo: "2026/2" } }, estudante: { email: { notIn: CONTAS_DA_APRESENTACAO } } },
    select: { estudanteId: true, estudante: { select: { nome: true, cursoId: true } }, aula: { select: { data: true, turmaId: true } } },
    orderBy: [{ aula: { data: "asc" } }, { estudanteId: "asc" }],
  });
  if (falta && (await prisma.abono.count({ where: { estudanteId: falta.estudanteId } })) === 0) {
    await prisma.$transaction(async (tx) => {
      await tx.abono.create({ data: { estudanteId: falta.estudanteId, inicio: falta.aula.data, fim: falta.aula.data, motivo: "AtestadoMedico", observacao: "Atestado de 1 dia", autorId: base.administradorId } });
      await recalcularFrequencia(falta.estudanteId, falta.aula.turmaId, tx);
      await recalcularIndicador(falta.estudanteId, falta.aula.turmaId, tx);
      await auditar(tx, { autorId: base.administradorId, acao: "abono.registrado", cursoId: falta.estudante.cursoId, descricao: `${falta.estudante.nome}: atestado médico de 1 dia (exemplo)` });
    });
    console.log(`Abono de exemplo: ${falta.estudante.nome}`);
  }

  // SPEC-031: um estudante de Administração trancado (as matrículas de 2026/2 ficam Trancadas).
  const trancar = await prisma.usuario.findFirst({
    where: { perfil: "Estudante", curso: { nome: "Administração" }, email: { notIn: CONTAS_DA_APRESENTACAO } },
    select: { id: true, nome: true, cursoId: true, ficha: { select: { situacaoCurso: true } } },
    orderBy: { nome: "asc" },
  });
  if (trancar && trancar.ficha?.situacaoCurso === "Ativo") {
    await prisma.$transaction(async (tx) => {
      await tx.fichaEstudante.update({ where: { estudanteId: trancar.id }, data: { situacaoCurso: "Trancado", situacaoDesde: paraData("2026-10-30"), situacaoMotivo: "Pedido do estudante (requerimento de exemplo)" } });
      const { count } = await tx.matricula.updateMany({ where: { estudanteId: trancar.id, situacao: "Cursando", turma: { periodoLetivo: { status: "Aberto" } } }, data: { situacao: "Trancada" } });
      await auditar(tx, { autorId: base.administradorId, acao: "estudante.situacao", cursoId: trancar.cursoId, descricao: `${trancar.nome}: Ativo → Trancado (exemplo, ${count} matrícula(s) trancada(s))` });
    });
    console.log(`Estudante trancado de exemplo: ${trancar.nome}`);
  }

  // SPEC-027: um pedido de senha pendente (a professora Júlia Reis "esqueceu a senha").
  const julia = await prisma.usuario.findUnique({ where: { email: "julia.reis@studytrack.test" }, select: { id: true } });
  if (julia && (await prisma.pedidoSenha.count({ where: { usuarioId: julia.id } })) === 0) {
    await prisma.pedidoSenha.create({ data: { usuarioId: julia.id } });
    console.log("Pedido de senha de exemplo: julia.reis@studytrack.test");
  }
}
