"use client";

// Tela do professor (SPEC-005, RF-08): atividades da turma com prazo, entregues e atrasadas, e cadastro
// de nova atividade. Os contadores chegam prontos do servidor (status derivado em src/domain, OPEN-010).
// Layout aprovado em docs/layout/prototipo.html#professor-atividades.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Cartao,
  CLASSE_BOTAO_PRIMARIO,
  CLASSE_CAMPO,
  CLASSE_LINK,
  CLASSE_ROTULO,
  ErroCampo,
  EstadoVazio,
  formatarDataCurta,
  Mensagem,
} from "./ui";

export type TurmaComAtividades = {
  id: string;
  rotulo: string;
  totalEstudantes: number;
  atividades: { id: string; descricao: string; prazo: string; entregues: number; atrasadas: number }[];
};

export function AtividadesTurma({ turmas, turmaInicial }: { turmas: TurmaComAtividades[]; turmaInicial?: string }) {
  const router = useRouter();
  const [turmaId, setTurmaId] = useState(turmas.some((t) => t.id === turmaInicial) ? turmaInicial! : (turmas[0]?.id ?? ""));
  const [erro, setErro] = useState<string | null>(null);
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const turma = turmas.find((t) => t.id === turmaId);

  function trocarTurma(id: string) {
    setTurmaId(id);
    setErro(null);
    setCampos({});
    setSucesso(null);
  }

  async function cadastrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    setErro(null);
    setCampos({});
    setSucesso(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/turmas/${turmaId}/atividades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(formulario))),
      });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.erro ?? "Não foi possível salvar.");
        setCampos(retorno.campos ?? {});
        return;
      }
      formulario.reset();
      setSucesso("Atividade cadastrada.");
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
            <select id="turma" value={turmaId} onChange={(e) => trocarTurma(e.target.value)} className={CLASSE_CAMPO}>
              {turmas.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
            </select>
          </div>
        </div>
      </Cartao>

      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Atividades da turma (${turma?.atividades.length ?? 0})`}>
          {!turma || turma.atividades.length === 0 ? (
            <EstadoVazio>Nenhuma atividade nesta turma. Cadastre a primeira ao lado.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Atividade</th>
                  <th className="pb-2.5">Prazo</th>
                  <th className="pb-2.5 text-right">Entregues</th>
                  <th className="pb-2.5 text-right">Atrasadas</th>
                </tr>
              </thead>
              <tbody>
                {turma.atividades.map((a) => (
                  <tr key={a.id} className="border-t border-traco">
                    <td data-rotulo="Atividade" className="py-3 pr-2">
                      <Link href={`/professor/atividades/${a.id}`} className={CLASSE_LINK}>{a.descricao}</Link>
                    </td>
                    <td data-rotulo="Prazo" className="py-3 pr-2 tabular-nums">{formatarDataCurta(a.prazo)}</td>
                    <td data-rotulo="Entregues" className="py-3 text-right tabular-nums">{a.entregues} de {turma.totalEstudantes}</td>
                    <td data-rotulo="Atrasadas" className={`py-3 text-right tabular-nums ${a.atrasadas > 0 ? "font-semibold text-risco" : ""}`}>
                      {a.atrasadas}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>

        <Cartao titulo="Nova atividade">
          <form onSubmit={cadastrar} className="space-y-4" noValidate>
            <div>
              <label htmlFor="descricao" className={CLASSE_ROTULO}>Descrição</label>
              <input id="descricao" name="descricao" aria-invalid={Boolean(campos.descricao)} className={CLASSE_CAMPO} />
              <ErroCampo mensagem={campos.descricao} />
            </div>
            <div>
              <label htmlFor="prazo" className={CLASSE_ROTULO}>Prazo</label>
              <input id="prazo" name="prazo" type="date" aria-invalid={Boolean(campos.prazo)} className={CLASSE_CAMPO} />
              <ErroCampo mensagem={campos.prazo} />
            </div>
            {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
            {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
            <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
              {enviando ? "Salvando..." : "Cadastrar atividade"}
            </button>
          </form>
        </Cartao>
      </div>
    </div>
  );
}
