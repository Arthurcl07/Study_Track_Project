// SPEC-034 — busca e paginação: paginar e normalizar (unitário) e listas com escopo (integração).
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { normalizarBusca, paginar } from "@/domain/secretaria";
import { GET as contasApi } from "@/app/api/contas/route";
import { GET as estudantesApi } from "@/app/api/estudantes/route";
import { prisma } from "@/server/dados/prisma";
import { removerUsuariosDeTeste } from "../apoio";
import { API, entrar, requisicao, turmaComEstudantes } from "../apoio-secretaria";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-034 — regras puras (sem banco)", () => {
  it("AC-034-01 / AC-034-05 / INV-034-02: páginas de 25; página fora do intervalo vira a última", () => {
    expect(paginar(60, 1)).toMatchObject({ pagina: 1, paginas: 3, de: 1, ate: 25, pular: 0 });
    expect(paginar(60, 9)).toMatchObject({ pagina: 3, de: 51, ate: 60 });
    expect(paginar(0, 4)).toMatchObject({ pagina: 1, paginas: 1, de: 0, ate: 0 });
    expect(paginar(10, "abc").pagina).toBe(1);
  });

  it("AC-034-02: busca sem maiúsculas e sem acentos", () => {
    expect(normalizarBusca("  JOÃO Pereira ")).toBe("joao pereira");
  });
});

describe("SPEC-034 — listas (integração)", () => {
  it("AC-034-02 / AC-034-03: encontra pelo nome sem acento e pela matrícula", async () => {
    const admin = await entrar("Administrador");
    const marca = randomUUID().slice(0, 8);
    const { estudantes: [e] } = await turmaComEstudantes(1);
    await prisma.usuario.update({ where: { id: e.id }, data: { nome: `Joaquím Ávila ${marca}` } });
    const pelaBusca = async (q: string) => (await (await contasApi(requisicao(`${API}/contas?q=${encodeURIComponent(q)}`, "GET", admin.token))).json()).itens.map((c: { id: string }) => c.id);
    expect(await pelaBusca(`joaquim avila ${marca}`)).toEqual([e.id]);
    const { numeroMatricula } = await prisma.fichaEstudante.findUniqueOrThrow({ where: { estudanteId: e.id } });
    const lista = await (await estudantesApi(requisicao(`${API}/estudantes?q=${numeroMatricula}`, "GET", admin.token))).json();
    expect(lista.estudantes.map((x: { id: string }) => x.id)).toContain(e.id);
  });

  it("AC-034-01: 25 por página com o total", async () => {
    const admin = await entrar("Administrador");
    const r = await (await contasApi(requisicao(`${API}/contas`, "GET", admin.token))).json();
    expect(r.itens.length).toBeLessThanOrEqual(25);
    expect(r.pagina.total).toBe(await prisma.usuario.count());
  });

  it("AC-034-04 / INV-034-01: coordenador não encontra estudante de outro curso", async () => {
    const { coordenador, estudantes: [meu] } = await turmaComEstudantes(1);
    const { estudantes: [deFora] } = await turmaComEstudantes(1);
    const busca = async (id: string) => {
      const { numeroMatricula } = await prisma.fichaEstudante.findUniqueOrThrow({ where: { estudanteId: id } });
      return (await (await estudantesApi(requisicao(`${API}/estudantes?q=${numeroMatricula}`, "GET", coordenador.token))).json()).estudantes.map((x: { id: string }) => x.id);
    };
    expect(await busca(meu.id)).toEqual([meu.id]);
    expect(await busca(deFora.id)).toEqual([]);
  });
});
