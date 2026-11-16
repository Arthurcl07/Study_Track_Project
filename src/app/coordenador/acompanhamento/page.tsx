import Link from "next/link";
import { Casca } from "@/components/casca";
import { CabecalhoPagina, Cartao, CartaoNumero, CLASSE_LINK, EstadoVazio } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { acompanhamentoDosProfessores } from "@/server/academico/acompanhamento";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-051 / RF-60 (UC-46): chamada, notas e diário de cada professor dos cursos do coordenador (RB-46).
// Layout aprovado em docs/layout/prototipo.html#acompanhamento.
export default async function Acompanhamento() {
  const sessao = await exigirAcessoPagina(RECURSOS.acompanhamento);
  const a = await acompanhamentoDosProfessores(sessao.usuarioId);
  return (
    <Casca sessao={sessao} ativo="acompanhamento">
      <CabecalhoPagina titulo="Acompanhamento dos professores" subtitulo="Chamada, notas e diário de cada professor dos seus cursos, no período aberto." />
      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <CartaoNumero rotulo="Professores com pendência" valor={a.comPendencia} cor={a.comPendencia > 0 ? "text-atencao" : ""} detalhe={`de ${a.professores.length}`} />
        <CartaoNumero rotulo="Chamadas atrasadas" valor={a.chamadas} />
        <CartaoNumero rotulo="Avaliações sem nota" valor={a.notas} />
        <CartaoNumero rotulo="Diários não fechados" valor={a.diarios} />
      </div>
      {a.professores.length === 0 ? (
        <EstadoVazio>Nenhuma turma de período aberto nos seus cursos.</EstadoVazio>
      ) : (
        <div className="space-y-4">
          {a.professores.map((p) => (
            <Cartao
              key={p.id}
              titulo={p.nome}
              acao={
                p.pendencias > 0 ? (
                  <span className="inline-flex rounded-full bg-atencao-fundo px-2.5 py-0.5 text-[13px] font-semibold text-atencao">▲ {p.pendencias} pendência(s)</span>
                ) : (
                  <span className="inline-flex rounded-full bg-normal-fundo px-2.5 py-0.5 text-[13px] font-semibold text-normal">● Em dia</span>
                )
              }
            >
              <ul className="space-y-1.5 text-sm">
                {p.turmas.filter((t) => t.pendencias.length > 0).map((t) => (
                  <li key={t.id}>
                    <Link href={`/coordenador/turmas/${t.id}`} className={CLASSE_LINK}>{t.rotulo}</Link> — {t.pendencias.map((x) => x.texto).join("; ")}
                  </li>
                ))}
                {p.pendencias === 0 && <li className="text-mudo">{p.turmas.length} turma(s), chamada e notas em dia.</li>}
              </ul>
            </Cartao>
          ))}
        </div>
      )}
      <p className="mt-4 text-[13px] text-mudo">Chamada atrasada: sem aula registrada há mais de 7 dias. Nota atrasada: prova ou trabalho de mais de 7 dias sem a nota de todos. Diário: aulas terminaram e o diário segue aberto.</p>
    </Casca>
  );
}
