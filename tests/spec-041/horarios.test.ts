// SPEC-041 — grade horária e salas: sobreposição e validação (unitário) e choques, vagas, grade e salas (integração).
import { afterAll, describe, expect, it } from "vitest";
import { motivoVagasAcimaDaSala, sobrepoe, validarHorario, validarSala, validarVagas } from "@/domain/horarios";
import { POST as horarioApi } from "@/app/api/turmas/[id]/horarios/route";
import { definirVagas, excluirSala, gradeDaSemana, incluirHorario, salvarSala } from "@/server/academico/horarios";
import { prisma } from "@/server/dados/prisma";
import { PREFIXO_DISCIPLINA_TESTE, criarPeriodoDeTeste, criarUsuarioDeTeste, removerUsuariosDeTeste } from "../apoio";
import { disciplinaNoCurso, salaDeTeste, sessao, turmaNoPeriodo } from "../apoio-n3";
import { API, contexto, entrar, requisicao } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-041 — regras puras (sem banco)", () => {
  it("RB-39: sobrepõe no mesmo dia quando um começa antes do outro terminar", () => {
    const seg = { diaSemana: 1, inicio: "19:00", fim: "20:40" };
    expect(sobrepoe(seg, { diaSemana: 1, inicio: "20:00", fim: "21:00" })).toBe(true);
    expect(sobrepoe(seg, { diaSemana: 1, inicio: "20:40", fim: "22:00" })).toBe(false);
    expect(sobrepoe(seg, { diaSemana: 2, inicio: "19:00", fim: "20:40" })).toBe(false);
  });

  it("AC-041-05 / INV-041-02: horário com fim antes do início, sala e vagas", () => {
    expect(validarHorario({ diaSemana: 1, inicio: "20:00", fim: "19:00", salaId: "s" })).toMatchObject({ ok: false, erros: { fim: expect.any(String) } });
    expect(validarHorario({ diaSemana: 7, inicio: "19:00", fim: "20:00", salaId: "" })).toMatchObject({ ok: false, erros: { diaSemana: expect.any(String), salaId: expect.any(String) } });
    expect(validarSala({ nome: "Lab 1", capacidade: "0" }).ok).toBe(false);
    expect([motivoVagasAcimaDaSala(40, [30, 50]), motivoVagasAcimaDaSala(30, [30]), motivoVagasAcimaDaSala(40, [])]).toEqual([expect.stringContaining("30 lugares"), null, null]);
    expect([validarVagas(""), validarVagas("25"), validarVagas("-1").ok]).toEqual([{ ok: true, vagas: null }, { ok: true, vagas: 25 }, false]);
  });
});

describe("SPEC-041 — horários e salas (integração)", () => {
  async function cenario() {
    const periodo = await criarPeriodoDeTeste();
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const cursoId = coordenador.cursoId;
    const [p1, p2] = [await criarUsuarioDeTeste("Professor"), await criarUsuarioDeTeste("Professor")];
    const turma = async (professorId: string) => turmaNoPeriodo({ periodo: periodo.nome, disciplinaId: (await disciplinaNoCurso(cursoId)).id, professorId, cursoId });
    const [a, b, c] = [await turma(p1.id), await turma(p2.id), await turma(p1.id)];
    const [sala30, sala50] = [await salaDeTeste(30), await salaDeTeste(50)];
    return { coordenador, cursoId, a, b, c, sala30, sala50 };
  }
  const horario = (diaSemana: number, inicio: string, fim: string, salaId: string) => ({ diaSemana, inicio, fim, salaId });

  it("AC-041-01 / AC-041-02 / AC-041-05: choque de sala e de professor são 409; fim antes do início, 400", async () => {
    const { coordenador, a, b, c, sala30, sala50 } = await cenario();
    expect((await incluirHorario(a.id, horario(1, "19:00", "20:40", sala30.id), coordenador.id)).ok).toBe(true);
    expect(await incluirHorario(b.id, horario(1, "20:00", "21:00", sala30.id), coordenador.id)).toMatchObject({ ok: false, falha: { tipo: "conflito", erro: expect.stringMatching(/^Choque de sala/) } });
    expect(await incluirHorario(c.id, horario(1, "19:30", "21:00", sala50.id), coordenador.id)).toMatchObject({ ok: false, falha: { tipo: "conflito", erro: expect.stringMatching(/^Choque de professor/) } });
    expect((await incluirHorario(b.id, horario(1, "20:40", "22:20", sala30.id), coordenador.id)).ok).toBe(true);
    expect(await prisma.registroAuditoria.count({ where: { acao: "turma.horario", turmaId: a.id } })).toBe(1);

    const tokenCoordenador = await entrar("Coordenador");
    const viaApi = (token: string) => horarioApi(requisicao(`${API}/turmas/${a.id}/horarios`, "POST", token, horario(2, "20:00", "19:00", sala30.id)), contexto({ id: a.id }));
    // Coordenador de outro curso: 404; fim antes do início: 400.
    expect((await viaApi(tokenCoordenador.token)).status).toBe(404);
    expect(await incluirHorario(a.id, horario(2, "20:00", "19:00", sala30.id), coordenador.id)).toMatchObject({ ok: false, falha: { tipo: "invalido" } });
  });

  it("AC-041-03 / INV-041-02: vagas acima da menor sala são recusadas", async () => {
    const { coordenador, a, b, sala30 } = await cenario();
    await incluirHorario(a.id, horario(3, "19:00", "20:40", sala30.id), coordenador.id);
    expect(await definirVagas(a.id, { vagas: 40 }, coordenador.id)).toMatchObject({ ok: false, falha: { tipo: "invalido", erros: { vagas: expect.stringContaining("30 lugares") } } });
    expect((await definirVagas(a.id, { vagas: 30 }, coordenador.id)).ok).toBe(true);
    // Turma com 40 vagas não ganha horário numa sala de 30.
    expect((await definirVagas(b.id, { vagas: 40 }, coordenador.id)).ok).toBe(true);
    expect(await incluirHorario(b.id, horario(4, "19:00", "20:40", sala30.id), coordenador.id)).toMatchObject({ ok: false, falha: { tipo: "conflito", erro: expect.stringContaining("30 lugares") } });
  });

  it("AC-041-04 / AC-041-06 / INV-041-03: grade do estudante com sala; sala em uso não sai; nome único", async () => {
    const { coordenador, cursoId, a, b, sala30, sala50 } = await cenario();
    await incluirHorario(a.id, horario(1, "19:00", "20:40", sala30.id), coordenador.id);
    await incluirHorario(b.id, horario(2, "19:00", "20:40", sala50.id), coordenador.id);
    const estudante = await criarUsuarioDeTeste("Estudante", { cursoId });
    await prisma.matricula.createMany({ data: [{ estudanteId: estudante.id, turmaId: a.id }, { estudanteId: estudante.id, turmaId: b.id }] });
    const grade = await gradeDaSemana(sessao(estudante.id, "Estudante"));
    expect(grade.map((h) => [h.diaSemana, h.inicio, h.sala])).toEqual([[1, "19:00", sala30.nome], [2, "19:00", sala50.nome]]);

    const admin = await entrar("Administrador");
    expect(await excluirSala(sala30.id, admin.usuario.id)).toMatchObject({ ok: false, falha: { tipo: "conflito" } });
    const livre = await salaDeTeste();
    expect((await excluirSala(livre.id, admin.usuario.id)).ok).toBe(true);
    const nome = `${PREFIXO_DISCIPLINA_TESTE}sala-unica-${Date.now()}`;
    expect((await salvarSala({ nome, capacidade: 20 }, admin.usuario.id)).ok).toBe(true);
    expect(await salvarSala({ nome, capacidade: 25 }, admin.usuario.id)).toMatchObject({ ok: false, falha: { tipo: "invalido", erros: { nome: expect.any(String) } } });
  });
});
