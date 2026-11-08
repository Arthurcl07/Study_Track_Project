// SPEC-042 — aproveitamento de estudos e conclusão do curso: RB-40 (unitário) e registro, conclusão e histórico (integração).
import { afterAll, describe, expect, it } from "vitest";
import { motivoParaNaoConcluir, validarAproveitamento } from "@/domain/matriz";
import { POST as aproveitamentoApi } from "@/app/api/estudantes/[id]/aproveitamentos/route";
import { PUT as situacaoApi } from "@/app/api/estudantes/[id]/situacao/route";
import { consultarHistorico } from "@/server/academico/documentos";
import { integralizacaoDoEstudante } from "@/server/academico/matriz";
import { prisma } from "@/server/dados/prisma";
import { criarUsuarioDeTeste, removerUsuariosDeTeste } from "../apoio";
import { aprovarEm, disciplinaNoCurso, sessao } from "../apoio-n3";
import { API, contexto, entrar, requisicao } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-042 — regras puras (sem banco)", () => {
  it("RB-40 / INV-042-02: Concluído só com 100% de integralização", () => {
    expect(motivoParaNaoConcluir({ percentual: 80, faltam: ["Redes"] })).toMatch(/100%.*80%.*Redes/);
    expect(motivoParaNaoConcluir({ percentual: null, faltam: [] })).toMatch(/não tem disciplina obrigatória/);
    expect(motivoParaNaoConcluir({ percentual: 100, faltam: [] })).toBeNull();
  });

  it("Validação do aproveitamento: origem, carga e nota de 0 a 10 (vírgula aceita)", () => {
    expect(validarAproveitamento({ disciplinaId: "d", instituicaoOrigem: "X", disciplinaOrigem: "Y", nota: "8,5", cargaHoraria: "60" })).toEqual({ ok: true, dados: { disciplinaId: "d", instituicaoOrigem: "X", disciplinaOrigem: "Y", nota: 8.5, cargaHoraria: 60 } });
    expect(validarAproveitamento({ disciplinaId: "d", instituicaoOrigem: "X", disciplinaOrigem: "Y", nota: "11", cargaHoraria: "0" })).toMatchObject({ ok: false, erros: { nota: expect.any(String), cargaHoraria: expect.any(String) } });
  });
});

describe("SPEC-042 — aproveitamento e conclusão (integração)", () => {
  async function cenario() {
    const admin = await entrar("Administrador");
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const cursoId = coordenador.cursoId;
    const [a, b] = [await disciplinaNoCurso(cursoId, 60), await disciplinaNoCurso(cursoId, 60)];
    const estudante = await criarUsuarioDeTeste("Estudante", { cursoId });
    await aprovarEm(estudante.id, a.id, cursoId);
    return { admin, cursoId, a, b, estudante };
  }
  const aproveitar = (token: string, estudanteId: string, disciplinaId: string) =>
    aproveitamentoApi(requisicao(`${API}/estudantes/${estudanteId}/aproveitamentos`, "POST", token, { disciplinaId, instituicaoOrigem: "Faculdade X", disciplinaOrigem: "Algoritmos I", nota: "8,0", cargaHoraria: 60 }), contexto({ id: estudanteId }));
  const concluir = (token: string, estudanteId: string) =>
    situacaoApi(requisicao(`${API}/estudantes/${estudanteId}/situacao`, "PUT", token, { situacao: "Concluido", data: "2026-11-08", motivo: "Colação de grau" }), contexto({ id: estudanteId }));

  it("AC-042-01 / AC-042-02 / INV-042-01: registra na disciplina da matriz; aprovada ou repetida é 409", async () => {
    const { admin, cursoId, a, b, estudante } = await cenario();
    expect((await integralizacaoDoEstudante(estudante.id, cursoId)).integralizacao.percentual).toBe(50);
    expect((await aproveitar(admin.token, estudante.id, b.id)).status).toBe(201);
    expect((await integralizacaoDoEstudante(estudante.id, cursoId)).integralizacao.percentual).toBe(100);
    expect(await prisma.registroAuditoria.count({ where: { acao: "aproveitamento.registrado", autorId: admin.usuario.id } })).toBe(1);
    expect((await aproveitar(admin.token, estudante.id, b.id)).status).toBe(409);
    expect((await aproveitar(admin.token, estudante.id, a.id)).status).toBe(409);
    // Disciplina fora da matriz do curso do estudante.
    const fora = await disciplinaNoCurso((await criarUsuarioDeTeste("Coordenador")).cursoId);
    expect((await aproveitar(admin.token, estudante.id, fora.id)).status).toBe(400);
    // Só a secretaria registra (RB-13).
    const coord = await entrar("Coordenador");
    expect((await aproveitar(coord.token, estudante.id, b.id)).status).toBe(403);
  });

  it("AC-042-03 / AC-042-04 / AC-042-05: Concluído só a 100%; o histórico mostra a data e o aproveitamento", async () => {
    const { admin, b, estudante } = await cenario();
    const recusado = await concluir(admin.token, estudante.id);
    expect(recusado.status).toBe(400);
    expect((await recusado.json()).campos.situacao).toMatch(/50%/);

    await aproveitar(admin.token, estudante.id, b.id);
    expect((await concluir(admin.token, estudante.id)).ok).toBe(true);
    const historico = await consultarHistorico(sessao(admin.usuario.id, "Administrador"), { estudante: estudante.id });
    expect(historico!.concluidoEm).toBe("2026-11-08");
    expect(historico!.aproveitamentos).toEqual([expect.objectContaining({ origem: "Faculdade X · Algoritmos I", nota: 8, cargaHoraria: 60 })]);
    expect(historico!.resumo.cargaHorariaAprovada).toBe(120);
  });
});
