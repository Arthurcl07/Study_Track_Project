// SPEC-047 e SPEC-057 — página de erro, registro de erros e saúde do sistema: código e mascaramento (unitário);
// rota que falha, registro e saúde (integração). A página de erro em si é conferida no teste de tela (e2e).
import { afterAll, describe, expect, it } from "vitest";
import { codigoDoErro, codigoValido, estadoDoTempo, mascararDadosPessoais, rotaSemIdentificadores } from "@/domain/erros";
import { GET as saudeApi } from "@/app/api/saude/route";
import { comRegistroDeErro, erroPeloCodigo } from "@/server/dados/erros";
import { prisma } from "@/server/dados/prisma";
import { removerUsuariosDeTeste, requisicaoComSessao } from "../apoio";
import { API, entrar } from "../apoio-secretaria";

const codigos: string[] = [];
afterAll(async () => {
  await prisma.registroErro.deleteMany({ where: { codigo: { in: codigos } } });
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-047 / SPEC-057 — regras puras (sem banco)", () => {
  it("INV-047-02: o código sai do digest, igual no servidor e no navegador", () => {
    expect(codigoDoErro("1234567890")).toBe(codigoDoErro("1234567890"));
    expect(codigoDoErro("1234567890")).not.toBe(codigoDoErro("987"));
    expect(codigoValido(codigoDoErro("abc"))).toBe(true);
    expect(codigoValido("ERR-12")).toBe(false);
  });

  it("AC-057-02 / INV-057-01: e-mail, CPF, número longo, senha e token são mascarados", () => {
    const texto = mascararDadosPessoais(
      'Falha para ana.souza@studytrack.test cpf 529.982.247-25 matrícula 20260073 senha=Segredo123 token eyJhbGciOi.eyJzdWIi.assinatura',
    );
    expect(texto).not.toMatch(/ana\.souza|529\.982|20260073|Segredo123|eyJ/);
    expect(texto).toContain("[e-mail]");
    expect(texto).toContain("[cpf]");
    expect(texto).toContain("[número]");
    expect(rotaSemIdentificadores("/coordenador/turmas/3f2a9c1e-1111-4222-8333-123456789abc?x=1")).toBe("/coordenador/turmas/…");
    expect([estadoDoTempo(80), estadoDoTempo(600), estadoDoTempo(1500)]).toEqual(["Normal", "Atencao", "Risco"]);
  });
});

describe("SPEC-057 — registro e saúde (integração)", () => {
  it("AC-057-01 / AC-047-02: rota que falha responde 500 com o código, e o erro fica registrado (mascarado)", async () => {
    const rota = comRegistroDeErro(async (_r: Request) => {
      throw new Error("Consulta falhou para pedro.lima@studytrack.test");
    });
    const resposta = await rota(new Request(`${API}/qualquer/3f2a9c1e-1111-4222-8333-123456789abc`, { method: "PATCH" }));
    expect(resposta.status).toBe(500);
    const corpo = await resposta.json();
    expect(corpo.codigo).toMatch(/^ERR-[0-9A-F]{6}$/);
    expect(JSON.stringify(corpo)).not.toContain("Consulta falhou");
    codigos.push(corpo.codigo);
    const registro = await erroPeloCodigo(corpo.codigo);
    expect(registro).toMatchObject({ metodo: "PATCH", rota: "/api/qualquer/…" });
    expect(registro!.mensagem).toContain("[e-mail]");
    expect(registro!.mensagem).not.toContain("pedro.lima");
  });

  it("AC-057-03 / AC-057-04 / INV-057-02: o administrador vê banco, tempos e erros; a coordenação recebe 403", async () => {
    const admin = await entrar("Administrador");
    const r = await saudeApi(requisicaoComSessao(`${API}/saude`, admin.token));
    expect(r.status).toBe(200);
    const saude = await r.json();
    expect(saude.banco.ok).toBe(true);
    expect(saude.consultas.map((c: { nome: string }) => c.nome)).toContain("Painel de evasão");
    expect(typeof saude.erros24h).toBe("number");
    const coordenador = await entrar("Coordenador");
    expect((await saudeApi(requisicaoComSessao(`${API}/saude`, coordenador.token))).status).toBe(403);
  });
});
