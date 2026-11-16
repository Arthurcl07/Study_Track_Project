// SPEC-046 — limite de tentativas no login: contagem, janela e bloqueio (unitário); rota com bloqueio e
// desbloqueio (integração).
import { afterAll, describe, expect, it } from "vitest";
import { aposErro, estaBloqueado, LIMITE_TENTATIVAS, mensagemDeErro, MENSAGEM_CREDENCIAIS_INVALIDAS, MINUTOS_BLOQUEIO } from "@/domain/login";
import { POST as loginApi } from "@/app/api/auth/login/route";
import { prisma } from "@/server/dados/prisma";
import { criarUsuarioDeTeste, emailDeTeste, removerUsuariosDeTeste, requisicaoDeLogin } from "../apoio";

const emailsUsados: string[] = [];
afterAll(async () => {
  await prisma.tentativaLogin.deleteMany({ where: { email: { in: emailsUsados } } });
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-046 — regras puras (sem banco)", () => {
  const agora = new Date("2026-11-14T13:00:00Z");

  it("RB-44 / INV-046-01: a 5ª errada seguida bloqueia por 15 minutos", () => {
    let estado = null as ReturnType<typeof aposErro> | null;
    for (let i = 1; i < LIMITE_TENTATIVAS; i++) {
      estado = aposErro(estado, agora);
      expect(estado).toMatchObject({ erradas: i, bloqueadoAte: null, bloqueou: false });
    }
    estado = aposErro(estado, agora);
    expect(estado.bloqueou).toBe(true);
    expect(estado.bloqueadoAte!.getTime() - agora.getTime()).toBe(MINUTOS_BLOQUEIO * 60_000);
    expect(estaBloqueado(estado, new Date(agora.getTime() + 14 * 60_000))).toBe(true);
    expect(estaBloqueado(estado, new Date(agora.getTime() + 16 * 60_000))).toBe(false);
  });

  it("RB-44: depois do bloqueio vencido, a contagem recomeça do zero", () => {
    const vencido = { erradas: 5, bloqueadoAte: new Date(agora.getTime() - 1000) };
    expect(aposErro(vencido, agora)).toMatchObject({ erradas: 1, bloqueou: false });
  });

  it("AC-046-01: o aviso de tentativas restantes começa na 3ª errada", () => {
    expect(mensagemDeErro(2)).toBe(MENSAGEM_CREDENCIAIS_INVALIDAS);
    expect(mensagemDeErro(3)).toMatch(/Restam 2 tentativas/);
    expect(mensagemDeErro(4)).toMatch(/Resta 1 tentativa/);
  });
});

describe("SPEC-046 — rota de login (integração)", () => {
  async function tentar(email: string, senha: string) {
    const r = await loginApi(requisicaoDeLogin(email, senha));
    return { status: r.status, corpo: await r.json() };
  }

  it("AC-046-01 / AC-046-02 / AC-046-03: 3ª errada avisa, 5ª bloqueia (com auditoria) e a senha certa é recusada no bloqueio", async () => {
    const u = await criarUsuarioDeTeste("Professor");
    emailsUsados.push(u.email);
    expect((await tentar(u.email, "errada-1")).status).toBe(401);
    expect((await tentar(u.email, "errada-2")).status).toBe(401);
    const terceira = await tentar(u.email, "errada-3");
    expect(terceira).toMatchObject({ status: 401, corpo: { restantes: 2 } });
    expect(terceira.corpo.erro).toMatch(/Restam 2 tentativas/);
    await tentar(u.email, "errada-4");
    const quinta = await tentar(u.email, "errada-5");
    expect(quinta.status).toBe(429);
    expect(quinta.corpo.erro).toMatch(/bloqueado até \d{2}:\d{2}/);
    expect(await prisma.registroAuditoria.count({ where: { autorId: u.id, acao: "login.bloqueado" } })).toBe(1);
    expect((await tentar(u.email, u.senha)).status).toBe(429);
    // INV-046-03 / RNF-02: só o e-mail e a contagem ficam gravados, nunca a senha.
    expect(JSON.stringify(await prisma.tentativaLogin.findUnique({ where: { email: u.email } }))).not.toContain("errada-");
  });

  it("AC-046-04 / INV-046-03: bloqueio vencido, a senha certa entra e a contagem é zerada", async () => {
    const u = await criarUsuarioDeTeste("Professor");
    emailsUsados.push(u.email);
    await prisma.tentativaLogin.create({ data: { email: u.email, erradas: 5, bloqueadoAte: new Date(Date.now() - 60_000) } });
    expect((await tentar(u.email, u.senha)).status).toBe(200);
    expect(await prisma.tentativaLogin.findUnique({ where: { email: u.email } })).toBeNull();
    expect(await prisma.registroAuditoria.count({ where: { autorId: u.id, acao: "login.desbloqueado" } })).toBe(1);
  });

  it("AC-046-05 / INV-046-02: e-mail sem conta recebe as mesmas respostas", async () => {
    const email = emailDeTeste("sem-conta");
    emailsUsados.push(email);
    const respostas = [];
    for (let i = 0; i < LIMITE_TENTATIVAS; i++) respostas.push(await tentar(email, "qualquer"));
    expect(respostas.map((r) => r.status)).toEqual([401, 401, 401, 401, 429]);
    expect(respostas[2].corpo.erro).toMatch(/Restam 2 tentativas/);
  });
});
