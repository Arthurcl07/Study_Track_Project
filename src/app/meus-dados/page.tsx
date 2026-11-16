import Link from "next/link";
import { Casca } from "@/components/casca";
import { BaixarMeusDados } from "@/components/termos";
import { CabecalhoPagina, Cartao, CLASSE_LINK } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { DADOS_GUARDADOS } from "@/domain/lgpd";
import { aceiteVigente, encarregadoDeDados } from "@/server/academico/lgpd";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-045 / RF-54: o que a instituição guarda, o download dos próprios dados e o aceite vigente.
// Layout aprovado em docs/layout/prototipo.html#lgpd-meus-dados.
export default async function MeusDados() {
  const sessao = await exigirAcessoPagina(RECURSOS.meusDados);
  const [aceite, encarregado] = await Promise.all([aceiteVigente(sessao.usuarioId), encarregadoDeDados()]);
  const quando = aceite?.aceitoEm.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
  return (
    <Casca sessao={sessao} ativo="meusdados">
      <CabecalhoPagina titulo="Meus dados" subtitulo="O que a instituição guarda sobre você e por quê (LGPD)." />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Cartao titulo="O que guardamos">
          <table className="tabela-responsiva w-full text-[15px]">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                <th className="pb-2.5">Dado</th>
                <th className="pb-2.5">Para quê</th>
                <th className="pb-2.5">Por quanto tempo</th>
              </tr>
            </thead>
            <tbody>
              {DADOS_GUARDADOS.map((d) => (
                <tr key={d.dado} className="border-t border-traco align-top">
                  <td data-rotulo="Dado" className="py-3 pr-3">{d.dado}</td>
                  <td data-rotulo="Para quê" className="py-3 pr-3">{d.finalidade}</td>
                  <td data-rotulo="Tempo" className="py-3">{d.prazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Cartao>
        <div className="space-y-5">
          <Cartao titulo="Baixar meus dados">
            <p className="mb-4 text-sm text-mudo">
              Arquivo com sua conta, ficha, matrículas, notas, presenças, entregas, requerimentos, notificações e aceites. Fica registrado na auditoria.
            </p>
            <BaixarMeusDados />
          </Cartao>
          <Cartao titulo="Aceite">
            <p className="text-sm">{aceite ? `Termos e Política de privacidade v${aceite.versao} aceitos em ${quando}.` : "Sem aceite registrado."}</p>
            <p className="mt-2 text-sm">
              <Link href="/termos" className={CLASSE_LINK}>Ler os termos</Link>
              {encarregado.email ? <> · Encarregado: {encarregado.email}</> : null}
            </p>
          </Cartao>
        </div>
      </div>
    </Casca>
  );
}
