"use client";

// Tela do professor (SPEC-005, RF-07): escolher turma e estudante e registrar o percentual de frequência.
// A situação mostrada vem do indicador recalculado no servidor (SPEC-003). Layout aprovado em
// docs/layout/prototipo.html#professor-frequencia.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Cartao, CLASSE_BOTAO_PRIMARIO, CLASSE_CAMPO, CLASSE_ROTULO, ErroCampo, EstadoVazio, Mensagem, SeloSituacao } from "./ui";

export type TurmaParaFrequencia = {
  id: string;
  rotulo: string;
  estudantes: { id: string; nome: string; percentual: number | null; situacao: "Normal" | "Atencao" | "Risco" | null }[];
};

const formatarPercentual = (valor: number) => `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export function RegistroFrequencia({ turmas }: { turmas: TurmaParaFrequencia[] }) {
  const router = useRouter();
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const [estudanteId, setEstudanteId] = useState("");
  const [percentual, setPercentual] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [erroCampo, setErroCampo] = useState<string | undefined>();
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const turma = turmas.find((t) => t.id === turmaId);
  const estudante = turma?.estudantes.find((e) => e.id === estudanteId);

  function limpar() {
    setErro(null);
    setErroCampo(undefined);
    setSucesso(null);
  }

  function escolher(id: string) {
    setEstudanteId(id);
    setPercentual("");
    limpar();
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    limpar();
    setEnviando(true);
    try {
      const resposta = await fetch("/api/frequencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turmaId, estudanteId, percentual }),
      });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.erro ?? "Não foi possível salvar.");
        setErroCampo(retorno.campos?.percentual ?? retorno.campos?.selecao);
        return;
      }
      setSucesso("Frequência registrada. Situação atualizada.");
      setPercentual("");
      router.refresh();
    } catch {
      setErro("Não foi possível salvar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (turmas.length === 0) return <EstadoVazio>Você ainda não leciona nenhuma turma.</EstadoVazio>;

  return (
    <div className="space-y-5">
      <Cartao>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="turma" className={CLASSE_ROTULO}>Turma</label>
            <select id="turma" value={turmaId} onChange={(e) => { setTurmaId(e.target.value); escolher(""); }} className={CLASSE_CAMPO}>
              {turmas.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
            </select>
          </div>
        </div>
      </Cartao>

      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Estudantes da turma (${turma?.estudantes.length ?? 0})`}>
          {!turma || turma.estudantes.length === 0 ? (
            <EstadoVazio>Nenhum estudante matriculado nesta turma.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Estudante</th>
                  <th className="pb-2.5 text-right">Frequência</th>
                  <th className="pb-2.5 pl-3">Situação</th>
                  <th className="pb-2.5"><span className="sr-only">Ação</span></th>
                </tr>
              </thead>
              <tbody>
                {turma.estudantes.map((e) => (
                  <tr key={e.id} className={`border-t border-traco ${e.id === estudanteId ? "bg-azul-suave" : ""}`}>
                    <td data-rotulo="Estudante" className="px-2 py-3">{e.nome}</td>
                    <td data-rotulo="Frequência" className={`px-2 py-3 text-right tabular-nums ${e.percentual === null ? "text-mudo" : ""}`}>
                      {e.percentual === null ? "—" : formatarPercentual(e.percentual)}
                    </td>
                    <td data-rotulo="Situação" className="px-2 py-3 pl-3">
                      {e.situacao ? <SeloSituacao situacao={e.situacao} /> : <span className="text-mudo">—</span>}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button type="button" onClick={() => escolher(e.id)} className="font-medium text-azul hover:underline">
                        {e.percentual === null ? "Registrar" : "Alterar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>

        <Cartao titulo={estudante ? `Frequência · ${estudante.nome}` : "Registrar frequência"}>
          {!estudante ? (
            <>
              <p className="text-sm text-mudo">Clique em um estudante na tabela.</p>
              {sucesso && <div className="mt-3"><Mensagem tipo="sucesso">{sucesso}</Mensagem></div>}
            </>
          ) : (
            <form onSubmit={salvar} className="space-y-4" noValidate>
              <p className="text-sm text-mudo">
                {estudante.percentual === null
                  ? "Ainda sem frequência registrada."
                  : `Frequência atual: ${formatarPercentual(estudante.percentual)}.`}{" "}
                Abaixo de 75% a situação vira Risco.
              </p>
              <div>
                <label htmlFor="percentual" className={CLASSE_ROTULO}>Frequência (%)</label>
                <input
                  id="percentual"
                  inputMode="decimal"
                  value={percentual}
                  onChange={(e) => setPercentual(e.target.value)}
                  aria-invalid={Boolean(erroCampo)}
                  className={CLASSE_CAMPO}
                />
                <ErroCampo mensagem={erroCampo} />
              </div>
              {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
              {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
              <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
                {enviando ? "Salvando..." : "Salvar frequência"}
              </button>
            </form>
          )}
        </Cartao>
      </div>
    </div>
  );
}
