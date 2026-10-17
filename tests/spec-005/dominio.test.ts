// SPEC-005 — regras de domínio de frequência, atividades e entregas (unitário, sem banco).
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ehDataValida,
  hojeEmBrasilia,
  statusEntrega,
  validarAtividade,
  validarDataEntrega,
} from "@/domain/atividades";
import { classificarSituacao } from "@/domain/situacao-academica";
import { MENSAGEM_FREQUENCIA_INVALIDA, validarPercentualFrequencia } from "@/domain/frequencia";

describe("SPEC-005 — status de entrega (OPEN-010, RB-08)", () => {
  const prazo = "2026-10-20";

  it.each([
    ["RB-08 / AC-005-04 / INV-005-02: prazo encerrado e sem entrega", null, "2026-10-21", "Atrasada"],
    ["AC-005-05: entregue antes do prazo", "2026-10-18", "2026-10-25", "NoPrazo"],
    ["AC-005-05: entregue no último dia do prazo", "2026-10-20", "2026-10-25", "NoPrazo"],
    ["RB-08 / AC-005-06: entregue depois do prazo", "2026-10-21", "2026-10-25", "Atrasada"],
    ["AC-005-07: prazo ainda não encerrado e sem entrega", null, "2026-10-19", "Pendente"],
    ["Caso 12.3: último dia do prazo, ainda sem entrega", null, "2026-10-20", "Pendente"],
  ] as const)("%s", (_caso, dataEntrega, hoje, esperado) => {
    expect(statusEntrega(prazo, dataEntrega, hoje)).toBe(esperado);
  });

  it("OPEN-010: o dia de hoje é o de Brasília, qualquer que seja o fuso do servidor", () => {
    expect(hojeEmBrasilia(new Date("2026-10-17T02:30:00Z"))).toBe("2026-10-16"); // 23:30 em Brasília
    expect(hojeEmBrasilia(new Date("2026-10-17T03:30:00Z"))).toBe("2026-10-17"); // 00:30 em Brasília
  });

  it("Datas de calendário inválidas são recusadas", () => {
    expect(ehDataValida("2026-10-20")).toBe(true);
    expect(ehDataValida("2026-02-30")).toBe(false);
    expect(ehDataValida("20/10/2026")).toBe(false);
    expect(ehDataValida(undefined)).toBe(false);
  });
});

describe("SPEC-005 — validações", () => {
  it("AC-005-03 / RF-08: atividade sem prazo ou sem descrição é recusada e indica o campo", () => {
    const semPrazo = validarAtividade({ descricao: "Lista 1" });
    expect(semPrazo.ok).toBe(false);
    if (!semPrazo.ok) expect(Object.keys(semPrazo.erros)).toEqual(["prazo"]);

    const vazia = validarAtividade({ descricao: "  ", prazo: "2026-13-01" });
    expect(vazia.ok).toBe(false);
    if (!vazia.ok) expect(Object.keys(vazia.erros).sort()).toEqual(["descricao", "prazo"]);

    expect(validarAtividade({ descricao: " Lista 1 ", prazo: "2026-10-20" })).toEqual({
      ok: true,
      dados: { descricao: "Lista 1", prazo: "2026-10-20" },
    });
  });

  it("OPEN-003: data da entrega vazia vira hoje; data futura é recusada", () => {
    expect(validarDataEntrega("", "2026-10-16")).toEqual({ ok: true, dados: "2026-10-16" });
    expect(validarDataEntrega(undefined, "2026-10-16")).toEqual({ ok: true, dados: "2026-10-16" });
    expect(validarDataEntrega("2026-10-10", "2026-10-16")).toEqual({ ok: true, dados: "2026-10-10" });
    expect(validarDataEntrega("2026-10-17", "2026-10-16").ok).toBe(false);
    expect(validarDataEntrega("ontem", "2026-10-16").ok).toBe(false);
  });

  it("RF-07: frequência de 0 a 100%, aceitando vírgula e o símbolo %", () => {
    expect(validarPercentualFrequencia("74,5")).toEqual({ ok: true, dados: 74.5 });
    expect(validarPercentualFrequencia("80%")).toEqual({ ok: true, dados: 80 });
    expect(validarPercentualFrequencia(0)).toEqual({ ok: true, dados: 0 });
    expect(validarPercentualFrequencia(100)).toEqual({ ok: true, dados: 100 });
    for (const invalido of [-1, 100.1, "", "abc", null]) {
      expect(validarPercentualFrequencia(invalido)).toEqual({ ok: false, erros: { percentual: MENSAGEM_FREQUENCIA_INVALIDA } });
    }
  });

  it("INV-005-01 / Caso 12.1: frequência de 74,9% leva a Risco e 75% não (regra única da SPEC-003)", () => {
    expect(classificarSituacao(null, 74.9)).toBe("Risco");
    expect(classificarSituacao(null, 75)).toBe("Normal");
  });

  it("INV-005-06: o status de entrega só é decidido em src/domain/atividades.ts", () => {
    const raiz = path.resolve(__dirname, "../../src");
    const arquivos: string[] = [];
    const varrer = (pasta: string) => {
      for (const nome of readdirSync(pasta)) {
        const caminho = path.join(pasta, nome);
        if (statSync(caminho).isDirectory()) varrer(caminho);
        else if (/\.(ts|tsx)$/.test(nome)) arquivos.push(caminho);
      }
    };
    varrer(raiz);
    const comRegra = arquivos.filter((arquivo) => /function statusEntrega\s*\(/.test(readFileSync(arquivo, "utf-8")));
    expect(comRegra.map((a) => path.relative(raiz, a).replaceAll("\\", "/"))).toEqual(["domain/atividades.ts"]);
  });
});
