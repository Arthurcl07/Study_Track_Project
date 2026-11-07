// Peças do boletim e do histórico escolar (SPEC-020, RF-29): folha A4 com cabeçalho do StudyTrack, dados do
// estudante e rodapé com a emissão. Layout aprovado em docs/layout/prototipo.html#doc-boletim e #doc-historico.
import type { Resultado } from "@/domain/documentos";
import { ROTULO_RESULTADO } from "@/domain/documentos";
import { BarraDocumento } from "./barra-documento";
import { Logotipo } from "./marca";

const COR_RESULTADO: Record<Resultado, string> = {
  Aprovado: "font-bold text-normal",
  AprovadoExame: "font-bold text-normal",
  Trancada: "font-semibold text-slate-600",
  Cancelada: "font-semibold text-risco",
  ReprovadoNota: "font-bold text-risco",
  ReprovadoFrequencia: "font-bold text-risco",
  ReprovadoNotaFrequencia: "font-bold text-risco",
  SemRegistro: "font-semibold text-mudo",
  EmCurso: "font-semibold text-info",
};

export function ResultadoTurma({ resultado }: { resultado: Resultado }) {
  return <span className={COR_RESULTADO[resultado]}>{ROTULO_RESULTADO[resultado]}</span>;
}

export const emissao = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " às");

export function FolhaDocumento({
  titulo,
  subtitulo,
  dados,
  voltar,
  rodape,
  instituicao,
  children,
}: {
  // SPEC-033 (RF-42): com os dados da instituição, o cabeçalho e a assinatura saem com eles.
  instituicao?: { nome: string; cnpj: string | null; endereco: string | null; cidadeUf: string | null; responsavelSecretaria: string | null; logotipo: string | null } | null;
  titulo: string;
  subtitulo?: React.ReactNode;
  dados: { rotulo: string; valor: React.ReactNode }[];
  voltar: string;
  rodape: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#e9edf3] print:bg-white">
      <BarraDocumento voltar={voltar} />
      <article className="folha-documento mx-auto my-5 max-w-[820px] bg-white px-4 py-6 text-[13px] shadow-[0_4px_18px_rgba(15,23,42,0.12)] sm:px-11 sm:py-10">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-marinho pb-3.5">
          {instituicao ? (
            <div className="flex min-w-0 items-center gap-3">
              {instituicao.logotipo && (
                // eslint-disable-next-line @next/next/no-img-element -- data URL guardada no banco (até 200 KB).
                <img src={instituicao.logotipo} alt={`Logotipo de ${instituicao.nome}`} className="h-14 w-14 shrink-0 rounded-lg object-contain" />
              )}
              <div className="min-w-0">
                <p className="text-[15px] font-bold">{instituicao.nome}</p>
                <p className="mt-0.5 text-mudo">
                  {[instituicao.cnpj && `CNPJ ${instituicao.cnpj}`, instituicao.endereco, instituicao.cidadeUf].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <Logotipo />
              <p className="mt-1.5 text-mudo">Sistema de acompanhamento acadêmico</p>
            </div>
          )}
          <div className="text-right">
            <h1 className="text-xl font-bold tracking-wide uppercase">{titulo}</h1>
            {subtitulo && <p className="mt-1">{subtitulo}</p>}
          </div>
        </header>
        <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {dados.map((d) => (
            <div key={d.rotulo} className="min-w-0">
              <dt className="text-[11px] tracking-wide text-mudo uppercase">{d.rotulo}</dt>
              <dd className="break-words">{d.valor}</dd>
            </div>
          ))}
        </dl>
        {children}
        {instituicao?.responsavelSecretaria && (
          <p className="mx-auto mt-10 w-72 max-w-full border-t border-texto pt-1.5 text-center text-xs">
            {instituicao.responsavelSecretaria}
            <br />
            Secretaria acadêmica
          </p>
        )}
        <footer className="mt-6 flex flex-wrap justify-between gap-3 border-t border-traco pt-2.5 text-[11px] text-mudo">{rodape}</footer>
      </article>
    </div>
  );
}

// Tabela do documento: rola dentro do cartão no celular, sem rolagem horizontal da página.
export function TabelaDocumento({ cabecalho, children }: { cabecalho: { texto: string; numero?: boolean }[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-[12.5px]">
        <thead>
          <tr className="bg-nevoa text-[10.5px] font-semibold tracking-wide text-mudo uppercase">
            {cabecalho.map((c) => (
              <th key={c.texto} className={`px-2 py-1.5 ${c.numero ? "text-right" : "text-left"}`}>{c.texto}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
