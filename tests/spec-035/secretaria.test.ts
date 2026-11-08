// SPEC-035 — secretaria no perfil Administrador: autorização (unitário) e documentos, auditoria e dashboard (integração).
import { afterAll, describe, expect, it } from "vitest";
import { RECURSOS, podeAcessar } from "@/domain/autorizacao";
import { PUT as situacaoApi } from "@/app/api/estudantes/[id]/situacao/route";
import { GET as relatoriosApi } from "@/app/api/relatorios/route";
import { GET as historicoNotasApi } from "@/app/api/historico-notas/route";
import { consultarAuditoria } from "@/server/academico/auditoria";
import { consultarHistorico } from "@/server/academico/documentos";
import { contagemDaSecretaria } from "@/server/academico/secretaria";
import type { Sessao } from "@/server/auth/token";
import { prisma } from "@/server/dados/prisma";
import { removerUsuariosDeTeste } from "../apoio";
import { API, contexto, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-035 — autorização (sem banco)", () => {
  it("INV-035-01 / RB-13: secretaria e documentos sim; trabalho acadêmico não", () => {
    for (const r of [RECURSOS.secretaria, RECURSOS.pedidosSenha, RECURSOS.documentos, RECURSOS.estudantes]) expect(podeAcessar("Administrador", r)).toBe(true);
    for (const r of [RECURSOS.registroDesempenho, RECURSOS.registroFrequenciaAtividades, RECURSOS.relatorios, RECURSOS.historicoNotas, RECURSOS.consultaAlertas, RECURSOS.planoRecuperacao, RECURSOS.painelCoordenador]) {
      expect(podeAcessar("Administrador", r)).toBe(false);
    }
    expect(podeAcessar("Professor", RECURSOS.estudantes)).toBe(false);
    expect(podeAcessar("Coordenador", RECURSOS.secretaria)).toBe(false);
  });
});

describe("SPEC-035 — secretaria (integração)", () => {
  it("AC-035-01: a secretaria emite o histórico de qualquer estudante", async () => {
    const admin = await entrar("Administrador");
    const { estudantes: [e] } = await turmaComEstudantes(1);
    const comSessao = await consultarHistorico({ usuarioId: admin.usuario.id, nome: "A", perfil: "Administrador" } as Sessao, { estudante: e.id });
    expect(comSessao?.estudante.id).toBe(e.id);
    // Professor continua sem documentos (INV-020-05).
    expect(await consultarHistorico({ usuarioId: admin.usuario.id, nome: "P", perfil: "Professor" } as Sessao, { estudante: e.id })).toBeNull();
    expect(comSessao?.estudante.numeroMatricula).toMatch(/^\d{8}$/);
  });

  it("AC-035-02: relatórios e histórico de notas continuam negados", async () => {
    const admin = await entrar("Administrador");
    expect((await relatoriosApi(requisicao(`${API}/relatorios`, "GET", admin.token))).status).toBe(403);
    expect((await historicoNotasApi(requisicao(`${API}/historico-notas`, "GET", admin.token))).status).toBe(403);
  });

  it("AC-035-03 / INV-035-02: a auditoria do administrador mostra o que a secretaria fez, não os lançamentos do professor", async () => {
    const admin = await entrar("Administrador");
    const { estudantes: [e] } = await turmaComEstudantes(1);
    await situacaoApi(requisicao(`${API}/estudantes/${e.id}/situacao`, "PUT", admin.token, { situacao: "Transferido", data: "2026-11-01", motivo: "Mudança de cidade" }), contexto({ id: e.id }));
    const sessao = { usuarioId: admin.usuario.id, nome: "A", perfil: "Administrador" } as Sessao;
    const secretaria = await consultarAuditoria(sessao, { grupo: "Secretaria" });
    expect(secretaria!.registros.some((r) => r.acao === "estudante.situacao" && r.autor === admin.usuario.nome)).toBe(true);
    expect(secretaria!.grupos).toContain("Secretaria");
    const todos = await consultarAuditoria(sessao, {});
    expect(todos!.registros.every((r) => !r.acao.startsWith("nota."))).toBe(true);
  });

  it("AC-035-04 / AC-035-05 / INV-035-03: o dashboard conta pedidos e situações, sem nota", async () => {
    const contagem = await contagemDaSecretaria();
    expect(Object.keys(contagem.situacoes).sort()).toEqual(["Ativo", "Cancelado", "Concluido", "Trancado", "Transferido"]);
    expect(contagem.pedidosPendentes).toBe(await prisma.pedidoSenha.count({ where: { status: "Pendente" } }));
    expect(JSON.stringify(contagem)).not.toMatch(/media|frequencia|nota/i);
  });
});
