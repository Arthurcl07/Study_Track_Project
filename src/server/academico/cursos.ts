// Casos de uso de cursos (SPEC-015, RF-22, UC-14). Quem pode: Administrador, verificado nas rotas pela matriz
// de autorização; aqui ficam as regras de nome único e de coordenador válido (RB-17).
import { MENSAGEM_COORDENADOR_INVALIDO, MENSAGEM_NOME_CURSO_EM_USO, podeCoordenar, validarCurso } from "@/domain/cursos";
import * as dados from "@/server/dados/cursos";
import type { Falha, Resultado } from "./cadastros";

const sucesso = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const falha = <T>(f: Falha): Resultado<T> => ({ ok: false, falha: f });
const nomeEmUso = { tipo: "invalido", erros: { nome: MENSAGEM_NOME_CURSO_EM_USO } } as const;

export const listarCursos = dados.listarCursos;

// AC-015-01 a AC-015-03: nome obrigatório e único; coordenador ativo com perfil Coordenador.
export async function criarCurso(entrada: Record<string, unknown>) {
  const validacao = validarCurso(entrada);
  if (!validacao.ok) return falha({ tipo: "invalido", erros: validacao.erros });
  if (!podeCoordenar(await dados.contaParaCoordenar(validacao.dados.coordenadorId))) {
    return falha({ tipo: "invalido", erros: { coordenadorId: MENSAGEM_COORDENADOR_INVALIDO } });
  }
  if (await dados.cursoComNome(validacao.dados.nome)) return falha(nomeEmUso);
  try {
    return sucesso(await dados.criarCurso(validacao.dados));
  } catch (erro) {
    // Corrida entre dois cadastros com o mesmo nome: o índice único do banco decide (INV-015-02).
    if ((erro as { code?: string }).code === "P2002") return falha(nomeEmUso);
    throw erro;
  }
}

// AC-015-04: o novo coordenador passa a ver as turmas do curso e o anterior deixa de ver, na hora.
export async function trocarCoordenador(cursoId: string, entrada: Record<string, unknown>) {
  if (!(await dados.buscarCurso(cursoId))) return falha({ tipo: "nao-encontrado", erro: "Curso não encontrado." });
  const coordenadorId = typeof entrada.coordenadorId === "string" ? entrada.coordenadorId.trim() : "";
  if (!coordenadorId) return falha({ tipo: "invalido", erros: { coordenadorId: "Escolha o novo coordenador." } });
  if (!podeCoordenar(await dados.contaParaCoordenar(coordenadorId))) {
    return falha({ tipo: "invalido", erros: { coordenadorId: MENSAGEM_COORDENADOR_INVALIDO } });
  }
  return sucesso(await dados.trocarCoordenador(cursoId, coordenadorId));
}
