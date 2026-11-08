import { Casca } from "@/components/casca";
import { PedidosSenha } from "@/components/pedidos-senha";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { listarPedidos } from "@/server/auth/pedidos-senha";

// SPEC-027 / RF-36 (UC-26): pedidos de redefinição de senha, só para o Administrador (secretaria).
// Layout aprovado em docs/layout/prototipo.html#senha-pedidos.
export default async function PaginaPedidosSenha() {
  const sessao = await exigirAcessoPagina(RECURSOS.pedidosSenha);
  const { pendentes, resolvidos } = await listarPedidos();
  const linha = (p: (typeof pendentes)[number]) => ({
    id: p.id,
    nome: p.usuario.nome,
    email: p.usuario.email,
    perfil: p.usuario.perfil,
    proprio: p.usuario.id === sessao.usuarioId,
    criadoEm: p.criadoEm.toISOString(),
    resolvidoEm: p.resolvidoEm?.toISOString() ?? null,
    status: p.status,
    resolvidoPor: p.resolvidoPor?.nome ?? null,
  });

  return (
    <Casca sessao={sessao} ativo="pedidos">
      <CabecalhoPagina
        titulo="Pedidos de senha"
        subtitulo="Confira a identidade da pessoa antes de aprovar. A senha provisória aparece uma única vez."
      />
      <PedidosSenha pendentes={pendentes.map(linha)} resolvidos={resolvidos.map(linha)} />
    </Casca>
  );
}
