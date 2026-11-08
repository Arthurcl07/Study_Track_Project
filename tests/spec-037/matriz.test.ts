// SPEC-037 — matriz curricular: situação, integralização e ciclo (unitário) e edição e "Meu curso" (integração).
import { afterAll, describe, expect, it } from "vitest";
import { criaCiclo, integralizacao, situacaoNaMatriz, validarLinhaDaMatriz, type DisciplinaDaMatriz, type HistoricoDoEstudante } from "@/domain/matriz";
import { PUT as matrizApi } from "@/app/api/cursos/[id]/matriz/[disciplinaId]/route";
import { consultarCursoDoEstudante, salvarLinhaDaMatriz } from "@/server/academico/matriz";
import { prisma } from "@/server/dados/prisma";
import { criarUsuarioDeTeste, removerUsuariosDeTeste } from "../apoio";
import { aprovarEm, disciplinaNoCurso, sessao } from "../apoio-n3";
import { API, contexto, entrar, requisicao } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

const linha = (disciplinaId: string, cargaHoraria: number, extra: Partial<DisciplinaDaMatriz> = {}): DisciplinaDaMatriz => ({ disciplinaId, nome: disciplinaId.toUpperCase(), cargaHoraria, semestre: 1, obrigatoria: true, requisitos: [], ...extra });
const historico = (h: Partial<Record<keyof HistoricoDoEstudante, string[]>>): HistoricoDoEstudante => ({
  aprovadas: new Set(h.aprovadas),
  aproveitadas: new Set(h.aproveitadas),
  cursando: new Set(h.cursando),
  reprovadas: new Set(h.reprovadas),
});

describe("SPEC-037 — regras puras (sem banco)", () => {
  it("RB-35 / AC-037-03 / AC-037-05: integralização por carga obrigatória aprovada ou aproveitada; optativa não conta", () => {
    const matriz = [linha("a", 120), linha("b", 60), linha("c", 120), linha("opt", 60, { obrigatoria: false })];
    const i = integralizacao(matriz, historico({ aprovadas: ["a", "opt"], aproveitadas: ["b"] }));
    expect([i.horasObrigatorias, i.horasConcluidas, i.percentual, i.faltam]).toEqual([300, 180, 60, ["C"]]);
    expect(integralizacao([linha("opt", 60, { obrigatoria: false })], historico({})).percentual).toBeNull();
  });

  it("AC-037-04: com pré-requisito não concluído, a disciplina fica Bloqueada com o que falta", () => {
    const b = linha("b", 60, { requisitos: ["a"] });
    expect(situacaoNaMatriz(b, historico({ reprovadas: ["a"] }))).toEqual({ situacao: "Bloqueada", faltam: ["a"] });
    expect(situacaoNaMatriz(b, historico({ aproveitadas: ["a"] })).situacao).toBe("Pendente");
    expect(situacaoNaMatriz(b, historico({ aprovadas: ["a"], cursando: ["b"] })).situacao).toBe("Cursando");
    expect(situacaoNaMatriz(b, historico({ aprovadas: ["a"], reprovadas: ["b"] })).situacao).toBe("Reprovada");
  });

  it("RB-41 / INV-037-02: pré-requisito da mesma matriz, sem ciclo nem ele mesmo", () => {
    const arestas = new Map([["b", ["a"]], ["c", ["b"]]]);
    expect(criaCiclo(arestas, "a", ["c"])).toBe(true);
    expect(criaCiclo(arestas, "a", ["b"])).toBe(true);
    expect(criaCiclo(arestas, "d", ["c"])).toBe(false);
    const daMatriz = new Set(["a", "b"]);
    expect(validarLinhaDaMatriz({ requisitos: ["a"] }, "a", daMatriz).ok).toBe(false);
    expect(validarLinhaDaMatriz({ requisitos: ["x"] }, "a", daMatriz).ok).toBe(false);
    expect(validarLinhaDaMatriz({ semestre: 11 }, "a", daMatriz).ok).toBe(false);
    expect(validarLinhaDaMatriz({ semestre: "2", obrigatoria: true, requisitos: ["b", "b"] }, "a", daMatriz)).toEqual({ ok: true, dados: { semestre: 2, obrigatoria: true, requisitos: ["b"] } });
  });
});

describe("SPEC-037 — matriz do curso (integração)", () => {
  it("AC-037-01 / AC-037-02 / AC-037-06: o coordenador edita a linha; ciclo é 400; outro coordenador, 404", async () => {
    const coordenador = await entrar("Coordenador");
    const cursoId = coordenador.usuario.cursoId;
    const a = await disciplinaNoCurso(cursoId);
    const b = await disciplinaNoCurso(cursoId);
    const salvar = (disciplinaId: string, corpo: Record<string, unknown>, token = coordenador.token) =>
      matrizApi(requisicao(`${API}/cursos/${cursoId}/matriz/${disciplinaId}`, "PUT", token, corpo), contexto({ id: cursoId, disciplinaId }));

    expect((await salvar(b.id, { semestre: 2, obrigatoria: true, requisitos: [a.id] })).status).toBe(200);
    const gravada = await prisma.cursoDisciplina.findUniqueOrThrow({ where: { cursoId_disciplinaId: { cursoId, disciplinaId: b.id } }, include: { requisitos: true } });
    expect([gravada.semestre, gravada.obrigatoria, gravada.requisitos.map((r) => r.requisitoId)]).toEqual([2, true, [a.id]]);
    expect(await prisma.registroAuditoria.count({ where: { acao: "matriz.alterada", cursoId } })).toBe(1);

    const ciclo = await salvar(a.id, { semestre: 1, obrigatoria: true, requisitos: [b.id] });
    expect(ciclo.status).toBe(400);
    expect((await ciclo.json()).campos.requisitos).toMatch(/ciclo/);

    const outro = await entrar("Coordenador");
    expect((await salvar(a.id, { semestre: 1 }, outro.token)).status).toBe(404);
  });

  it("AC-037-03 / INV-037-03: Meu curso mostra 60% com 120 h aprovadas e 60 h aproveitadas de 300 h", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const cursoId = coordenador.cursoId;
    const [a, b, c, opt] = [await disciplinaNoCurso(cursoId, 120, { semestre: 1 }), await disciplinaNoCurso(cursoId, 60, { semestre: 1 }), await disciplinaNoCurso(cursoId, 120, { semestre: 2 }), await disciplinaNoCurso(cursoId, 60, { semestre: 2, obrigatoria: false })];
    const estudante = await criarUsuarioDeTeste("Estudante", { cursoId });
    await aprovarEm(estudante.id, a.id, cursoId);
    await aprovarEm(estudante.id, opt.id, cursoId);
    await prisma.aproveitamento.create({ data: { estudanteId: estudante.id, disciplinaId: b.id, instituicaoOrigem: "Outra", disciplinaOrigem: "B", cargaHoraria: 60, autorId: coordenador.id } });
    await salvarLinhaDaMatriz(cursoId, c.id, { semestre: 2, obrigatoria: true, requisitos: [a.id] }, coordenador.id);

    const curso = await consultarCursoDoEstudante(sessao(estudante.id, "Estudante"), estudante.id);
    expect(curso!.integralizacao.percentual).toBe(60);
    const situacoes = Object.fromEntries(curso!.semestres.flatMap((s) => s.disciplinas).map((d) => [d.disciplinaId, d.situacao]));
    expect(situacoes).toEqual({ [a.id]: "Aprovada", [b.id]: "Aproveitada", [c.id]: "Pendente", [opt.id]: "Aprovada" });
    // Escopo: o coordenador do curso vê; outro estudante não vê o curso deste.
    expect(await consultarCursoDoEstudante(sessao(coordenador.id, "Coordenador"), estudante.id)).not.toBeNull();
    const outro = await criarUsuarioDeTeste("Estudante");
    expect(await consultarCursoDoEstudante(sessao(outro.id, "Estudante"), estudante.id)).toBeNull();
  });
});
