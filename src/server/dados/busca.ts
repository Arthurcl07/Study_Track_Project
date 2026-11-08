// SPEC-034 (RF-43, OPEN-056): busca por nome, e-mail ou número de matrícula sem diferenciar maiúsculas e acentos.
// O banco compara o nome sem acento (translate) e devolve os ids; quem chama junta os ids ao filtro de escopo na
// mesma query (ADR-003, INV-034-01).
import { Prisma } from "@prisma/client";
import { normalizarBusca } from "@/domain/secretaria";
import { prisma } from "./prisma";

const COM_ACENTO = "áàâãäéèêëíìîïóòôõöúùûüçñ";
const SEM_ACENTO = "aaaaaeeeeiiiiooooouuuucn";

// null = sem busca (não filtra); lista vazia = nada bate.
export async function idsQueBatem(busca: unknown): Promise<string[] | null> {
  const termo = normalizarBusca(busca);
  if (!termo) return null;
  const padrao = `%${termo.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const linhas = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT u."id" FROM "Usuario" u
    LEFT JOIN "FichaEstudante" f ON f."estudanteId" = u."id"
    WHERE translate(lower(u."nome"), ${COM_ACENTO}, ${SEM_ACENTO}) LIKE ${padrao}
       OR lower(u."email") LIKE ${padrao}
       OR f."numeroMatricula" LIKE ${padrao}
    LIMIT 5000`);
  return linhas.map((l) => l.id);
}

export const filtroDeBusca = (ids: string[] | null): Prisma.UsuarioWhereInput => (ids === null ? {} : { id: { in: ids } });
