// SPEC-040 — calendário acadêmico: dia letivo e validação (unitário) e chamada, cadastro e mês (integração).
import { afterAll, describe, expect, it } from "vitest";
import { diasDaGradeDoMes, motivoSemAula, validarEvento } from "@/domain/calendario";
import { POST as calendarioApi } from "@/app/api/calendario/route";
import { consultarMes, salvarEvento } from "@/server/academico/calendario";
import { registrarChamada } from "@/server/academico/chamada";
import { paraData } from "@/server/dados/atividades";
import { prisma } from "@/server/dados/prisma";
import { criarPeriodoDeTeste, removerUsuariosDeTeste } from "../apoio";
import { sessao } from "../apoio-n3";
import { API, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const evento = (tipo: "Feriado" | "Recesso" | "InicioAulas" | "FimAulas", inicio: string, fim = inicio) => ({ tipo, titulo: tipo, inicio, fim });

describe("SPEC-040 — regras puras (sem banco)", () => {
  it("RB-38 / INV-040-01: sem aula em feriado, recesso ou fora do intervalo das aulas", () => {
    const eventos = [evento("Feriado", "2026-11-20"), evento("Recesso", "2026-12-21", "2027-01-05"), evento("InicioAulas", "2026-08-11"), evento("FimAulas", "2026-12-12")];
    expect(motivoSemAula("2026-11-20", eventos)).toMatch(/feriado/);
    expect(motivoSemAula("2026-12-22", eventos)).toMatch(/recesso/);
    expect(motivoSemAula("2026-08-10", eventos)).toMatch(/começam em 11\/08\/2026/);
    expect(motivoSemAula("2026-12-15", eventos)).toMatch(/terminaram em 12\/12\/2026/);
    expect(motivoSemAula("2026-11-19", eventos)).toBeNull();
    expect(motivoSemAula("2026-11-19", [])).toBeNull();
  });

  it("AC-040-03: evento com fim antes do início é recusado; fim vazio vale o dia", () => {
    expect(validarEvento({ periodo: "2026/2", tipo: "Recesso", titulo: "R", inicio: "2026-12-21", fim: "2026-12-20" })).toMatchObject({ ok: false, erros: { fim: expect.any(String) } });
    expect(validarEvento({ periodo: "2026/2", tipo: "Feriado", titulo: "F", inicio: "2026-11-20", fim: "" })).toMatchObject({ ok: true, dados: { fim: "2026-11-20" } });
    expect(validarEvento({ periodo: "2026/2", tipo: "Festa", titulo: "F", inicio: "2026-11-20" }).ok).toBe(false);
    const grade = diasDaGradeDoMes("2026-11");
    expect([grade[0].data, grade.length % 7, grade.filter((d) => d.doMes).length]).toEqual(["2026-11-01", 0, 30]);
  });
});

describe("SPEC-040 — calendário (integração)", () => {
  async function cenario() {
    const periodo = await criarPeriodoDeTeste();
    const admin = await entrar("Administrador");
    const base = await turmaComEstudantes(1, periodo.nome);
    const aulas = [base.estudantes.map((e) => ({ estudanteId: e.id, presente: true }))];
    return { ...base, periodo, admin, aulas };
  }

  it("AC-040-01 / AC-040-02: chamada recusada no feriado e depois do fim das aulas", async () => {
    const { periodo, admin, turma, professor, aulas } = await cenario();
    for (const e of [
      { tipo: "Feriado", titulo: "Consciência Negra", inicio: "2026-11-20", fim: "" },
      { tipo: "InicioAulas", titulo: "Início", inicio: "2026-08-11", fim: "" },
      { tipo: "FimAulas", titulo: "Fim", inicio: "2026-12-12", fim: "" },
    ]) expect((await salvarEvento({ periodo: periodo.nome, ...e }, admin.usuario.id)).ok).toBe(true);
    expect(await prisma.registroAuditoria.count({ where: { acao: "calendario.evento", autorId: admin.usuario.id } })).toBe(3);

    const feriado = await registrarChamada({ turmaId: turma.id, data: "2026-11-20", aulas }, professor.id, "2026-11-25");
    expect(feriado).toMatchObject({ ok: false, falha: { tipo: "invalido", erros: { data: expect.stringMatching(/feriado/) } } });
    const depois = await registrarChamada({ turmaId: turma.id, data: "2026-12-15", aulas }, professor.id, "2026-12-16");
    expect(depois).toMatchObject({ ok: false, falha: { tipo: "invalido", erros: { data: expect.stringMatching(/terminaram/) } } });
    expect((await registrarChamada({ turmaId: turma.id, data: "2026-11-19", aulas }, professor.id, "2026-11-25")).ok).toBe(true);
  });

  it("AC-040-03 / AC-040-05: só a secretaria cadastra; datas fora de ordem são 400", async () => {
    const { periodo, admin, professor, coordenador } = await cenario();
    const cadastrar = (token: string, corpo: Record<string, unknown>) => calendarioApi(requisicao(`${API}/calendario`, "POST", token, corpo));
    const corpo = { periodo: periodo.nome, tipo: "Recesso", titulo: "Recesso de fim de ano", inicio: "2026-12-21", fim: "2027-01-05" };
    expect((await cadastrar(admin.token, { ...corpo, fim: "2026-12-01" })).status).toBe(400);
    expect((await cadastrar(admin.token, corpo)).status).toBe(201);
    expect((await cadastrar(coordenador.token, corpo)).status).toBe(403);
    const { token: tokenProfessor } = await entrar("Professor");
    expect(professor.id).toBeTruthy();
    expect((await cadastrar(tokenProfessor, corpo)).status).toBe(403);
  });

  it("AC-040-04 / INV-040-02: o estudante vê os eventos e os prazos das próprias turmas, não os das outras", async () => {
    const { periodo, admin, turma, estudantes } = await cenario();
    const outra = await turmaComEstudantes(1, periodo.nome);
    await salvarEvento({ periodo: periodo.nome, tipo: "Feriado", titulo: "Feriado de teste", inicio: "2026-11-20", fim: "" }, admin.usuario.id);
    await prisma.atividade.create({ data: { turmaId: turma.id, descricao: "Lista da minha turma", prazo: paraData("2026-11-25") } });
    await prisma.atividade.create({ data: { turmaId: outra.turma.id, descricao: "Lista de outra turma", prazo: paraData("2026-11-26") } });
    const itens = await consultarMes(sessao(estudantes[0].id, "Estudante"), "2026-11");
    const titulos = itens.map((i) => i.titulo).join(" | ");
    expect(titulos).toContain("Feriado de teste");
    expect(titulos).toContain("Lista da minha turma");
    expect(titulos).not.toContain("Lista de outra turma");
    expect(itens.find((i) => i.titulo.startsWith("Lista da minha"))).toMatchObject({ tipo: "Prazo", data: "2026-11-25" });
  });
});
