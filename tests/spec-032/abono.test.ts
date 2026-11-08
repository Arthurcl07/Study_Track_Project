// SPEC-032 — abono de faltas: validação e frequência (unitário) e registrar, excluir, sobreposição e período
// encerrado (integração).
import { afterAll, describe, expect, it } from "vitest";
import { validarAbono } from "@/domain/secretaria";
import { DELETE as excluirApi } from "@/app/api/abonos/[id]/route";
import { POST as abonoApi } from "@/app/api/estudantes/[id]/abonos/route";
import { POST as chamadaApi } from "@/app/api/aulas/route";
import { abonosDaTurma } from "@/server/academico/chamada";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, entrarComo, removerUsuariosDeTeste, requisicaoJson } from "../apoio";
import { API, contexto, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const dataAntes = (dias: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
};

// 10 aulas nos últimos 10 dias; o estudante falta nas 4 primeiras (frequência 60%).
async function cenario() {
  const admin = await entrar("Administrador");
  // Período de teste, sem calendário: as 10 datas nunca caem em feriado do 2026/2 (SPEC-040).
  const dados = await turmaComEstudantes(1, (await criarPeriodoDeTeste()).nome);
  const [estudante] = dados.estudantes;
  const token = await entrarComo(dados.professor.email, dados.professor.senha);
  for (let i = 10; i >= 1; i--) {
    await chamadaApi(requisicaoJson(`${API}/aulas`, { turmaId: dados.turma.id, data: dataAntes(i), presencas: [{ estudanteId: estudante.id, presente: i < 7 }] }, token));
  }
  return { admin, ...dados, estudante };
}
const frequencia = async (estudanteId: string, turmaId: string) => (await prisma.frequencia.findFirstOrThrow({ where: { estudanteId, turmaId } })).percentual;
const abonar = (id: string, corpo: Record<string, unknown>, token: string) => abonoApi(requisicao(`${API}/estudantes/${id}/abonos`, "POST", token, corpo), contexto({ id }));

describe("SPEC-032 — regras puras (sem banco)", () => {
  it("AC-032-04 / RB-31: intervalo válido, até 180 dias, motivo da lista", () => {
    expect(validarAbono({ inicio: "2026-11-01", fim: "2026-11-05", motivo: "AtestadoMedico" }).ok).toBe(true);
    expect(validarAbono({ inicio: "2026-11-05", fim: "2026-11-01", motivo: "AtestadoMedico" }).ok).toBe(false);
    expect(validarAbono({ inicio: "2026-01-01", fim: "2026-12-31", motivo: "AtestadoMedico" }).ok).toBe(false);
    expect(validarAbono({ inicio: "2026-11-01", fim: "2026-11-02", motivo: "Viagem" }).ok).toBe(false);
  });
});

describe("SPEC-032 — abono (integração)", () => {
  it("AC-032-01 / AC-032-02: abonar 2 das 4 faltas leva de 60% a 80%; excluir volta a 60%", async () => {
    const { admin, turma, estudante } = await cenario();
    expect(await frequencia(estudante.id, turma.id)).toBe(60);
    const previa = await (await abonar(estudante.id, { inicio: dataAntes(10), fim: dataAntes(9), motivo: "AtestadoMedico", previa: true }, admin.token)).json();
    expect(previa).toMatchObject({ gravado: false, faltas: 2, turmas: 1 });
    expect(await prisma.abono.count({ where: { estudanteId: estudante.id } })).toBe(0);

    const r = await abonar(estudante.id, { inicio: dataAntes(10), fim: dataAntes(9), motivo: "AtestadoMedico", observacao: "Atestado de 2 dias" }, admin.token);
    expect(r.status).toBe(201);
    expect(await frequencia(estudante.id, turma.id)).toBe(80);
    expect(await prisma.registroAuditoria.count({ where: { autorId: admin.usuario.id, acao: "abono.registrado" } })).toBe(1);

    const { id } = await r.json();
    expect((await excluirApi(requisicao(`${API}/abonos/${id}`, "DELETE", admin.token), contexto({ id }))).status).toBe(200);
    expect(await frequencia(estudante.id, turma.id)).toBe(60);
  });

  it("AC-032-03 / INV-032-02: abonos sobrepostos não contam a mesma falta duas vezes", async () => {
    const { admin, turma, estudante } = await cenario();
    await abonar(estudante.id, { inicio: dataAntes(10), fim: dataAntes(9), motivo: "AtestadoMedico" }, admin.token);
    await abonar(estudante.id, { inicio: dataAntes(9), fim: dataAntes(8), motivo: "Outro" }, admin.token);
    expect(await frequencia(estudante.id, turma.id)).toBe(90);
  });

  it("AC-032-05: a chamada recebe os intervalos para mostrar \"Abonada\"", async () => {
    const { admin, turma, estudante } = await cenario();
    await abonar(estudante.id, { inicio: dataAntes(3), fim: dataAntes(1), motivo: "ServicoMilitar" }, admin.token);
    expect(await abonosDaTurma(turma.id)).toEqual([{ estudanteId: estudante.id, inicio: dataAntes(3), fim: dataAntes(1) }]);
  });

  it("AC-032-06 / INV-032-03: turma de período encerrado não é recalculada", async () => {
    const admin = await entrar("Administrador");
    const encerrado = await criarPeriodoDeTeste("Encerrado");
    const { turma, estudantes: [e] } = await turmaComEstudantes(1, encerrado.nome);
    const aula = await prisma.aula.create({ data: { turmaId: turma.id, data: new Date(`${dataAntes(5)}T00:00:00Z`) } });
    await prisma.presenca.create({ data: { aulaId: aula.id, estudanteId: e.id, presente: false } });
    await prisma.frequencia.create({ data: { estudanteId: e.id, turmaId: turma.id, percentual: 0 } });
    const r = await (await abonar(e.id, { inicio: dataAntes(6), fim: dataAntes(4), motivo: "AtestadoMedico" }, admin.token)).json();
    expect(r.faltas).toBe(0);
    expect(await frequencia(e.id, turma.id)).toBe(0);
  });

  it("AC-032-07: coordenador e professor não registram abono", async () => {
    const { coordenador, professor, estudantes: [e] } = await turmaComEstudantes(1);
    const tokenProfessor = await entrarComo(professor.email, professor.senha);
    for (const token of [coordenador.token, tokenProfessor]) {
      expect((await abonar(e.id, { inicio: dataAntes(2), fim: dataAntes(1), motivo: "AtestadoMedico" }, token)).status).toBe(403);
    }
  });
});
