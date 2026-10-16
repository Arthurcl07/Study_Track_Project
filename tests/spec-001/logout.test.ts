// SPEC-001 / OPEN-019 — Sair: a rota apaga o cookie de sessão no navegador.
import { describe, expect, it } from "vitest";
import { POST as logout } from "@/app/api/auth/logout/route";
import { NOME_COOKIE_SESSAO } from "@/server/auth/token";

describe("SPEC-001 — sair (OPEN-019)", () => {
  it("OPEN-019: POST /api/auth/logout apaga o cookie de sessão e indica o login como destino", async () => {
    const resposta = await logout();
    const cookie = (resposta.headers.get("set-cookie") ?? "").toLowerCase();

    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({ destino: "/login" });
    expect(cookie).toContain(`${NOME_COOKIE_SESSAO}=;`);
    expect(cookie).toMatch(/max-age=0|expires=thu, 01 jan 1970/);
    expect(cookie).toContain("httponly");
  });
});
