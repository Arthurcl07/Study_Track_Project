// SPEC-001 — autorização por perfil: domínio (unitário) e servidor (integração).
import { randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import { afterAll, describe, expect, it } from "vitest";
import { PERFIS, ehPerfilValido } from "@/domain/perfil";
import { RECURSOS, podeAcessar } from "@/domain/autorizacao";
import { GET as apiCoordenacao } from "@/app/api/coordenacao/route";
import { prisma } from "@/server/dados/prisma";
import { gerarHashSenha } from "@/server/auth/senha";
import { GET as listarTurmas } from "@/app/api/turmas/route";
import { GET as buscarTurma } from "@/app/api/turmas/[id]/route";
import {
  PREFIXO_DISCIPLINA_TESTE,
  criarUsuarioDeTeste,
  entrarComo,
  parametros,
  removerUsuariosDeTeste,
  requisicaoComSessao,
} from "../apoio";

const URL_COORDENACAO = "http://localhost/api/coordenacao";

afterAll(async () => {
  await removerUsuariosDeTeste();
  await prisma.$disconnect();
});

describe("SPEC-001 — autorização", () => {
  it("AC-001-03: Estudante autenticado que chama a função exclusiva de Coordenador tem o acesso negado", async () => {
    const estudante = await criarUsuarioDeTeste("Estudante");
    const coordenador = await criarUsuarioDeTeste("Coordenador");

    const negado = await apiCoordenacao(requisicaoComSessao(URL_COORDENACAO, await entrarComo(estudante.email, estudante.senha)));
    const liberado = await apiCoordenacao(requisicaoComSessao(URL_COORDENACAO, await entrarComo(coordenador.email, coordenador.senha)));

    expect(negado.status).toBe(403);
    expect(await negado.json()).toEqual({ erro: "Acesso negado." });
    expect(liberado.status).toBe(200);
    expect((await liberado.json()).perfil).toBe("Coordenador");
  });

  it("INV-001-03: o servidor recusa pedido sem sessão ou com JWT forjado, sem depender da interface", async () => {
    const semSessao = await apiCoordenacao(requisicaoComSessao(URL_COORDENACAO));

    // Token que se declara Coordenador, mas assinado com outro segredo.
    const forjado = await new SignJWT({ nome: "Invasor", perfil: "Coordenador" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(randomUUID())
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("segredo-que-nao-e-o-do-servidor-0123456789"));
    const comForjado = await apiCoordenacao(requisicaoComSessao(URL_COORDENACAO, forjado));

    expect(semSessao.status).toBe(401);
    expect(comForjado.status).toBe(401);
  });

  it("INV-001-03: a regra de domínio nega por padrão (perfil inválido ou recurso desconhecido)", () => {
    for (const perfil of PERFIS) expect(podeAcessar(perfil, "recurso-inexistente")).toBe(false);
    expect(podeAcessar(undefined, RECURSOS.areaCoordenacao)).toBe(false);
    expect(podeAcessar("Admin", RECURSOS.areaCoordenacao)).toBe(false);
    expect(podeAcessar("Estudante", RECURSOS.areaCoordenacao)).toBe(false);
    expect(podeAcessar("Professor", RECURSOS.areaCoordenacao)).toBe(false);
    expect(podeAcessar("Coordenador", RECURSOS.areaCoordenacao)).toBe(true);
  });

  it("INV-001-01: todo usuário tem exatamente um perfil dentre Estudante, Professor ou Coordenador", async () => {
    expect(PERFIS).toEqual(["Estudante", "Professor", "Coordenador"]);
    expect(ehPerfilValido("Admin")).toBe(false);

    const hash = await gerarHashSenha("x");
    const inserir = (perfil: string | null) =>
      prisma.$executeRawUnsafe(
        `INSERT INTO "Usuario" (id, nome, email, "senhaHash", perfil) VALUES ($1, $2, $3, $4, $5::"Perfil")`,
        randomUUID(), "Sem perfil válido", `inv-${randomUUID()}@vitest.studytrack.test`, hash, perfil,
      );
    // O banco rejeita perfil fora da lista e perfil ausente.
    await expect(inserir("Admin")).rejects.toThrow();
    await expect(inserir(null)).rejects.toThrow();

    const usuarios = await prisma.usuario.findMany({ select: { perfil: true } });
    for (const { perfil } of usuarios) expect(ehPerfilValido(perfil)).toBe(true);
  });

  // INV-001-04: escrito junto com a SPEC-002, quando passaram a existir turmas e matrículas.
  // Notas e frequência (SPEC-003 em diante) reforçam este invariante nos testes das próprias Specs.
  it("INV-001-04: Estudante nunca recebe dados de outro estudante ao consultar turmas", async () => {
    const coordenador = await criarUsuarioDeTeste("Coordenador");
    const professor = await criarUsuarioDeTeste("Professor");
    const estudante = await criarUsuarioDeTeste("Estudante");
    const colega = await criarUsuarioDeTeste("Estudante");
    const disciplina = await prisma.disciplina.create({ data: { nome: `${PREFIXO_DISCIPLINA_TESTE}${randomUUID()}`, cargaHoraria: 40 } });
    const criarTurma = () =>
      prisma.turma.create({
        data: { nome: "T", periodo: "2026/2", disciplinaId: disciplina.id, professorId: professor.id, coordenadorId: coordenador.id },
      });
    const comum = await criarTurma();
    const soDoColega = await criarTurma();
    await prisma.matricula.createMany({
      data: [
        { estudanteId: estudante.id, turmaId: comum.id },
        { estudanteId: colega.id, turmaId: comum.id },
        { estudanteId: colega.id, turmaId: soDoColega.id },
      ],
    });
    const token = await entrarComo(estudante.email, estudante.senha);

    const lista = await (await listarTurmas(requisicaoComSessao("http://localhost/api/turmas", token))).json();
    const textoResposta = JSON.stringify(lista);

    expect(lista.map((t: { id: string }) => t.id)).toEqual([comum.id]);
    expect(textoResposta).not.toContain(colega.id);
    expect(textoResposta).not.toContain(colega.email);
    const alheia = await buscarTurma(requisicaoComSessao(`http://localhost/api/turmas/${soDoColega.id}`, token), parametros(soDoColega.id));
    expect(alheia.status).toBe(404);
  });
});
