// SPEC-031 — situação do estudante no curso: transições (unitário) e efeito nas matrículas e nas listas (integração).
import { afterAll, describe, expect, it } from "vitest";
import { efeitoNasMatriculas, validarMudancaDeSituacao } from "@/domain/secretaria";
import { PUT as cursoApi } from "@/app/api/estudantes/[id]/curso/route";
import { PUT as situacaoApi } from "@/app/api/estudantes/[id]/situacao/route";
import { POST as matricularApi } from "@/app/api/turmas/[id]/matriculas/route";
import { consultarAulas } from "@/server/academico/chamada";
import { consultarHistorico } from "@/server/academico/documentos";
import { recalcularIndicador } from "@/server/academico/indicador";
import type { Sessao } from "@/server/auth/token";
import { turmaParaChamada } from "@/server/dados/chamada";
import { prisma } from "@/server/dados/prisma";
import { criarCursoDeTeste, criarPeriodoDeTeste, removerUsuariosDeTeste } from "../apoio";
import { API, contexto, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const mudar = (id: string, corpo: Record<string, unknown>, token: string) => situacaoApi(requisicao(`${API}/estudantes/${id}/situacao`, "PUT", token, corpo), contexto({ id }));

describe("SPEC-031 — regras puras (sem banco)", () => {
  it("RB-30: efeito nas matrículas e validação", () => {
    expect([efeitoNasMatriculas("Trancado"), efeitoNasMatriculas("Transferido"), efeitoNasMatriculas("Cancelado"), efeitoNasMatriculas("Concluido"), efeitoNasMatriculas("Ativo")]).toEqual(["Trancada", "Cancelada", "Cancelada", null, null]);
    const hoje = "2026-11-06";
    expect(validarMudancaDeSituacao({ situacao: "Trancado", data: hoje, motivo: "Pedido" }, "Ativo", hoje).ok).toBe(true);
    const falha = validarMudancaDeSituacao({ situacao: "Ativo", data: "2026-11-07", motivo: "" }, "Ativo", hoje);
    expect(falha.ok ? [] : Object.keys(falha.erros).sort()).toEqual(["data", "motivo", "situacao"]);
  });
});

describe("SPEC-031 — situação no curso (integração)", () => {
  it("AC-031-01 / AC-031-02 / AC-031-05 / INV-031-01: trancar marca só as matrículas de período aberto e tira da chamada", async () => {
    const admin = await entrar("Administrador");
    const { turma, professor, estudantes: [a, b], cursoId } = await turmaComEstudantes(2);
    const encerrado = await criarPeriodoDeTeste("Encerrado");
    const antiga = await prisma.turma.create({ data: { nome: "Antiga", periodo: encerrado.nome, disciplinaId: turma.disciplinaId, professorId: professor.id, cursoId } });
    await prisma.matricula.create({ data: { estudanteId: a.id, turmaId: antiga.id } });

    const r = await mudar(a.id, { situacao: "Trancado", data: "2026-11-01", motivo: "Pedido do estudante" }, admin.token);
    expect(r.status).toBe(200);
    expect((await r.json()).matriculasAlteradas).toBe(1);
    expect((await prisma.matricula.findUniqueOrThrow({ where: { estudanteId_turmaId: { estudanteId: a.id, turmaId: turma.id } } })).situacao).toBe("Trancada");
    expect((await prisma.matricula.findUniqueOrThrow({ where: { estudanteId_turmaId: { estudanteId: a.id, turmaId: antiga.id } } })).situacao).toBe("Cursando");

    const chamada = await turmaParaChamada(professor.id, turma.id);
    expect(chamada!.matriculas.map((m) => m.estudanteId)).toEqual([b.id]);
    expect(await consultarAulas(professor.id, turma.id)).toEqual([]);

    const historico = await consultarHistorico({ usuarioId: a.id, nome: "A", perfil: "Estudante" } as Sessao, {});
    expect(historico!.periodos.flatMap((p) => p.linhas).find((l) => l.id === turma.id)?.resultado).toBe("Trancada");
    expect(await prisma.registroAuditoria.count({ where: { autorId: admin.usuario.id, acao: "estudante.situacao" } })).toBe(1);
  });

  it("AC-031-03: matrícula trancada não conta no dashboard nem nos alertas", async () => {
    const admin = await entrar("Administrador");
    const { turma, estudantes: [a] } = await turmaComEstudantes(1);
    await prisma.frequencia.create({ data: { estudanteId: a.id, turmaId: turma.id, percentual: 10 } });
    await recalcularIndicador(a.id, turma.id);
    const contar = () => prisma.indicadorAcademico.count({ where: { turmaId: turma.id, situacao: "Risco", matricula: { situacao: "Cursando" } } });
    expect(await contar()).toBe(1);
    await mudar(a.id, { situacao: "Cancelado", data: "2026-11-01", motivo: "Desistência" }, admin.token);
    expect(await contar()).toBe(0);
  });

  it("AC-031-04 / INV-031-03: estudante não ativo não é matriculado", async () => {
    const admin = await entrar("Administrador");
    const { coordenador, cursoId, turma } = await turmaComEstudantes(0);
    const fora = await entrar("Estudante", { cursoId });
    await mudar(fora.usuario.id, { situacao: "Trancado", data: "2026-11-01", motivo: "Pedido" }, admin.token);
    const r = await matricularApi(requisicao(`${API}/turmas/${turma.id}/matriculas`, "POST", coordenador.token, { email: fora.usuario.email }), contexto({ id: turma.id }));
    expect(r.status).toBe(409);
  });

  it("AC-031-06 / AC-031-07: troca de curso só sem matrícula cursando em período aberto", async () => {
    const admin = await entrar("Administrador");
    const { coordenador, estudantes: [a] } = await turmaComEstudantes(1);
    const outroCurso = await criarCursoDeTeste(coordenador.usuario.id);
    const trocar = () => cursoApi(requisicao(`${API}/estudantes/${a.id}/curso`, "PUT", admin.token, { cursoId: outroCurso }), contexto({ id: a.id }));
    expect((await trocar()).status).toBe(409);
    await prisma.matricula.updateMany({ where: { estudanteId: a.id }, data: { situacao: "Cancelada" } });
    expect((await trocar()).status).toBe(200);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: a.id } })).cursoId).toBe(outroCurso);
  });

  it("AC-031-08: coordenador não altera a situação", async () => {
    const { coordenador, estudantes: [a] } = await turmaComEstudantes(1);
    expect((await mudar(a.id, { situacao: "Trancado", data: "2026-11-01", motivo: "x" }, coordenador.token)).status).toBe(403);
  });
});
