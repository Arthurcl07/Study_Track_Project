// SPEC-059 — ajuda e tour: conteúdo por perfil (unitário); tour visto e rever o tour (integração). O tour na tela
// é conferido no teste de tela (e2e).
import { afterAll, describe, expect, it } from "vitest";
import { manualDoPerfil, mostrarTour, perguntasFrequentes, tourDoPerfil } from "@/domain/ajuda";
import { PERFIS } from "@/domain/perfil";
import { REGRA_PADRAO } from "@/domain/situacao-academica";
import { POST as tourApi } from "@/app/api/ajuda/tour/route";
import { prisma } from "@/server/dados/prisma";
import { removerUsuariosDeTeste, requisicaoJson } from "../apoio";
import { API, entrar } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-059 — conteúdo por perfil (sem banco)", () => {
  it("AC-059-01: tour de 5 a 6 passos por perfil, cada um apontando para um item do menu", () => {
    for (const perfil of PERFIS) {
      const passos = tourDoPerfil(perfil);
      expect(passos.length).toBeGreaterThanOrEqual(5);
      expect(passos.length).toBeLessThanOrEqual(6);
      expect(passos.every((p) => p.alvo && p.titulo && p.texto)).toBe(true);
    }
    expect(tourDoPerfil("Coordenador").map((p) => p.alvo)).toContain("evasao");
  });

  it("AC-059-04: manual do estudante e perguntas com a regra vigente", () => {
    expect(manualDoPerfil("Estudante").map((m) => m.titulo)).toContain("Meu curso");
    expect(manualDoPerfil("Administrador").map((m) => m.titulo)).toContain("Configurações");
    const faq = perguntasFrequentes("Estudante", { ...REGRA_PADRAO, mediaMinima: 7 });
    expect(faq.find((p) => p.pergunta.includes("Atenção"))!.resposta).toContain("7,0");
  });

  it("INV-059-01: o tour aparece até ser visto", () => {
    expect([mostrarTour(null), mostrarTour(new Date())]).toEqual([true, false]);
  });
});

describe("SPEC-059 — tour (integração)", () => {
  it("AC-059-02 / AC-059-03: concluir marca como visto; rever volta a mostrar", async () => {
    const { usuario, token } = await entrar("Coordenador");
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: usuario.id } })).tourVistoEm).toBeNull();
    expect((await tourApi(requisicaoJson(`${API}/ajuda/tour`, { visto: true }, token))).status).toBe(200);
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: usuario.id } })).tourVistoEm).not.toBeNull();
    await tourApi(requisicaoJson(`${API}/ajuda/tour`, { visto: false }, token));
    expect((await prisma.usuario.findUniqueOrThrow({ where: { id: usuario.id } })).tourVistoEm).toBeNull();
  });
});
