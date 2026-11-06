// Regras do mural de comunicados (SPEC-025, RF-34, RB-26, OPEN-047). Funções puras: sem Next.js nem Prisma.
import type { ErrosDeCampo, Validacao } from "./estrutura-academica";

export const LIMITE_TITULO = 120;
export const LIMITE_TEXTO = 2000;

export type Alcance = { tipo: "turma"; turmaId: string } | { tipo: "curso"; cursoId: string };
export type DadosComunicado = { titulo: string; texto: string; alcance: Alcance };

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// AC-025-05: título e texto obrigatórios e com limite; alcance "turma" (com a turma) ou "curso" (com o curso).
export function validarComunicado(entrada: Record<string, unknown>): Validacao<DadosComunicado> {
  const erros: ErrosDeCampo = {};
  const titulo = texto(entrada.titulo);
  const corpo = texto(entrada.texto);
  if (!titulo) erros.titulo = "Informe o título.";
  else if (titulo.length > LIMITE_TITULO) erros.titulo = `O título pode ter até ${LIMITE_TITULO} caracteres.`;
  if (!corpo) erros.texto = "Escreva o texto do comunicado.";
  else if (corpo.length > LIMITE_TEXTO) erros.texto = `O texto pode ter até ${LIMITE_TEXTO.toLocaleString("pt-BR")} caracteres.`;

  const tipo = texto(entrada.alcance) || "turma";
  let alcance: Alcance | null = null;
  if (tipo === "curso") {
    const cursoId = texto(entrada.cursoId);
    if (cursoId) alcance = { tipo: "curso", cursoId };
    else erros.cursoId = "Escolha o curso.";
  } else if (tipo === "turma") {
    const turmaId = texto(entrada.turmaId);
    if (turmaId) alcance = { tipo: "turma", turmaId };
    else erros.turmaId = "Escolha a turma.";
  } else erros.alcance = "Escolha para quem é o comunicado.";

  return Object.keys(erros).length > 0 || !alcance ? { ok: false, erros } : { ok: true, dados: { titulo, texto: corpo, alcance } };
}
