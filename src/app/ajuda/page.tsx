import Link from "next/link";
import { Casca } from "@/components/casca";
import { ReverTour } from "@/components/rever-tour";
import { CabecalhoPagina, Cartao, CLASSE_LINK } from "@/components/ui";
import { manualDoPerfil, perguntasFrequentes } from "@/domain/ajuda";
import { painelDoPerfil, RECURSOS } from "@/domain/autorizacao";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { regraVigente } from "@/server/dados/regras";

const NOME_DO_PERFIL = { Estudante: "do estudante", Professor: "do professor", Coordenador: "da coordenação", Administrador: "da secretaria" } as const;

// SPEC-059 / RF-65 (UC-51): manual do perfil, perguntas frequentes e "Rever o tour".
// Layout aprovado em docs/layout/prototipo.html#ajuda.
export default async function Ajuda() {
  const sessao = await exigirAcessoPagina(RECURSOS.ajuda);
  const regra = await regraVigente();
  return (
    <Casca sessao={sessao} ativo="ajuda">
      <CabecalhoPagina
        titulo="Ajuda"
        subtitulo={`Manual ${NOME_DO_PERFIL[sessao.perfil]} e perguntas frequentes.`}
        acao={<ReverTour destino={painelDoPerfil(sessao.perfil)} />}
      />
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Cartao titulo={`Manual ${NOME_DO_PERFIL[sessao.perfil]}`}>
          <dl className="space-y-3 text-sm">
            {manualDoPerfil(sessao.perfil).map((m) => (
              <div key={m.titulo}>
                <dt className="font-semibold">{m.titulo}</dt>
                <dd className="mt-0.5 text-mudo">{m.texto}</dd>
              </div>
            ))}
          </dl>
        </Cartao>
        <Cartao titulo="Perguntas frequentes">
          <div className="space-y-2">
            {perguntasFrequentes(sessao.perfil, regra).map((p) => (
              <details key={p.pergunta} className="rounded-[10px] border border-traco px-3 py-2">
                <summary className="cursor-pointer text-sm font-semibold">{p.pergunta}</summary>
                <p className="mt-1.5 text-sm">{p.resposta}</p>
              </details>
            ))}
          </div>
          <p className="mt-4 text-sm">Privacidade e seus dados: <Link href="/meus-dados" className={CLASSE_LINK}>Meus dados</Link> · <Link href="/termos" className={CLASSE_LINK}>Termos</Link></p>
        </Cartao>
      </div>
    </Casca>
  );
}
