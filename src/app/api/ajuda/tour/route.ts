// POST /api/ajuda/tour — marca o tour como visto ({ visto: true }) ou pede para revê-lo ({ visto: false })
// (SPEC-059, INV-059-01). Cada usuário só mexe no próprio.
import { RECURSOS } from "@/domain/autorizacao";
import { lerCorpo } from "@/server/academico/respostas";
import { autorizarApi } from "@/server/auth/guardas";
import { comRegistroDeErro } from "@/server/dados/erros";
import { prisma } from "@/server/dados/prisma";

async function rotaPOST(requisicao: Request) {
  const acesso = await autorizarApi(requisicao, RECURSOS.ajuda);
  if ("negado" in acesso) return acesso.negado;
  const { visto } = await lerCorpo(requisicao);
  const atualizado = await prisma.usuario.update({ where: { id: acesso.sessao.usuarioId }, data: { tourVistoEm: visto === false ? null : new Date() }, select: { tourVistoEm: true } });
  return Response.json({ tourVistoEm: atualizado.tourVistoEm });
}

export const POST = comRegistroDeErro(rotaPOST);
