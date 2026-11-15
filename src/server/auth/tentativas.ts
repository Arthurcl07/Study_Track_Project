// Contagem de tentativas de login por e-mail (SPEC-046, RB-44). A regra fica em src/domain/login.ts;
// aqui só a leitura e a gravação. Nunca grava a senha (RNF-02).
import { aposErro, estaBloqueado, type Tentativas } from "@/domain/login";
import { auditar } from "@/server/dados/auditoria";
import { prisma } from "@/server/dados/prisma";
import { normalizarEmail } from "@/server/dados/usuarios";

export async function bloqueioDoEmail(email: string, agora = new Date()): Promise<Date | null> {
  const estado = await prisma.tentativaLogin.findUnique({ where: { email: normalizarEmail(email) } });
  return estaBloqueado(estado, agora) ? estado!.bloqueadoAte : null;
}

// Soma uma tentativa errada; ao bloquear, audita em nome da conta, se ela existir (SPEC-046, escopo).
export async function registrarErro(email: string, agora = new Date()): Promise<Tentativas & { bloqueou: boolean }> {
  const chave = normalizarEmail(email);
  return prisma.$transaction(async (tx) => {
    const anterior = await tx.tentativaLogin.findUnique({ where: { email: chave } });
    const novo = aposErro(anterior, agora);
    await tx.tentativaLogin.upsert({
      where: { email: chave },
      create: { email: chave, erradas: novo.erradas, bloqueadoAte: novo.bloqueadoAte },
      update: { erradas: novo.erradas, bloqueadoAte: novo.bloqueadoAte },
    });
    if (novo.bloqueou) {
      const conta = await tx.usuario.findUnique({ where: { email: chave }, select: { id: true, nome: true } });
      if (conta) {
        await auditar(tx, {
          acao: "login.bloqueado",
          descricao: `Login de ${conta.nome} bloqueado por tentativas erradas`,
          autorId: conta.id,
          depois: { erradas: novo.erradas, bloqueadoAte: novo.bloqueadoAte },
        });
      }
    }
    return novo;
  });
}

// INV-046-03: login certo zera a contagem; se havia um bloqueio (já vencido), registra a liberação.
export async function zerarTentativas(email: string, usuarioId: string, nome: string) {
  const chave = normalizarEmail(email);
  await prisma.$transaction(async (tx) => {
    const anterior = await tx.tentativaLogin.findUnique({ where: { email: chave } });
    if (!anterior) return;
    await tx.tentativaLogin.delete({ where: { email: chave } });
    if (anterior.bloqueadoAte) {
      await auditar(tx, { acao: "login.desbloqueado", descricao: `Login de ${nome} liberado depois do bloqueio`, autorId: usuarioId });
    }
  });
}
