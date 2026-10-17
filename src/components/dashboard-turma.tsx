"use client";

// Dashboard da turma do professor (SPEC-008, RF-13) com criação de plano de recuperação (RF-14, UC-04).
// A regra "só Risco" vale no servidor (RB-11); aqui só se esconde o botão para quem não pode.
// Layout aprovado em docs/layout/prototipo.html#professor-turma.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { DashboardTurma } from "@/server/academico/planos";
import {
  Cartao, CLASSE_BOTAO_PRIMARIO, CLASSE_CAMPO, CLASSE_LINK, CLASSE_ROTULO, corDaFrequencia, corDaMedia, ErroCampo, EstadoVazio,
  formatarNumero as numero, Mensagem, SeloSituacao,
} from "./ui";

export function DashboardTurmaProfessor({ turma }: { turma: DashboardTurma }) {
  const router = useRouter();
  const [estudanteId, setEstudanteId] = useState("");
  const [itens, setItens] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [erroCampo, setErroCampo] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);

  const estudante = turma.estudantes.find((e) => e.id === estudanteId);

  function escolher(id: string) {
    setEstudanteId(id);
    setItens("");
    setErro(null);
    setErroCampo(undefined);
  }

  async function criar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setErroCampo(undefined);
    setEnviando(true);
    try {
      const resposta = await fetch("/api/planos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turmaId: turma.id, estudanteId, itens }),
      });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.erro ?? "Não foi possível criar o plano.");
        setErroCampo(retorno.campos?.itens ?? retorno.campos?.selecao);
        return;
      }
      router.push(`/professor/planos/${retorno.id}`);
    } catch {
      setErro("Não foi possível criar o plano. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
      <Cartao titulo="Estudantes da turma">
        {turma.estudantes.length === 0 ? (
          <EstadoVazio>Nenhum estudante matriculado nesta turma.</EstadoVazio>
        ) : (
          <table className="tabela-responsiva w-full text-[15px]">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                <th className="pr-2 pb-2.5">Estudante</th>
                <th className="px-2 pb-2.5 text-right">Média</th>
                <th className="px-2 pb-2.5 text-right">Frequência</th>
                <th className="pb-2.5 pl-3">Situação</th>
                <th className="px-2 pb-2.5">Plano</th>
              </tr>
            </thead>
            <tbody>
              {turma.estudantes.map((e) => (
                <tr key={e.id} className={`border-t border-traco ${e.id === estudanteId ? "bg-azul-suave" : ""}`}>
                  <td data-rotulo="Estudante" className="py-3 pr-2">{e.nome}</td>
                  <td data-rotulo="Média" className={`px-2 py-3 text-right tabular-nums ${corDaMedia(e.media) && `font-semibold ${corDaMedia(e.media)}`}`}>{e.media === null ? "—" : numero(e.media)}</td>
                  <td data-rotulo="Frequência" className={`px-2 py-3 text-right tabular-nums ${corDaFrequencia(e.frequencia) && `font-semibold ${corDaFrequencia(e.frequencia)}`}`}>{e.frequencia === null ? "—" : `${numero(e.frequencia)}%`}</td>
                  <td data-rotulo="Situação" className="py-3 pr-2 pl-3">
                    {e.situacao ? <SeloSituacao situacao={e.situacao} /> : <span className="text-mudo">Sem dados</span>}
                  </td>
                  <td data-rotulo="Plano" className="px-2 py-3">
                    {e.plano && e.plano.status === "Ativo" ? (
                      <Link href={`/professor/planos/${e.plano.id}`} className={CLASSE_LINK}>Ver plano ({e.plano.progresso.percentual}%)</Link>
                    ) : e.situacao === "Risco" ? (
                      <button type="button" onClick={() => escolher(e.id)} className="font-medium text-azul hover:underline">Criar plano</button>
                    ) : e.plano ? (
                      <Link href={`/professor/planos/${e.plano.id}`} className="text-mudo hover:underline">Encerrado</Link>
                    ) : (
                      <span className="text-mudo">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Cartao>

      <Cartao titulo={estudante ? `Novo plano · ${estudante.nome}` : "Plano de recuperação"}>
        {!estudante ? (
          <p className="text-sm text-mudo">
            Só estudantes em ■ Risco recebem plano de recuperação. Clique em “Criar plano” ao lado de um deles.
          </p>
        ) : (
          <form onSubmit={criar} className="space-y-4" noValidate>
            <p className="text-sm text-mudo">Escreva um item por linha. O progresso começa em 0%.</p>
            <div>
              <label htmlFor="itens" className={CLASSE_ROTULO}>Itens do plano</label>
              <textarea
                id="itens"
                rows={6}
                value={itens}
                onChange={(ev) => setItens(ev.target.value)}
                aria-invalid={Boolean(erroCampo)}
                placeholder={"Refazer a lista de exercícios 1\nPlantão de dúvidas com o professor"}
                className={CLASSE_CAMPO}
              />
              <ErroCampo mensagem={erroCampo} />
            </div>
            {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
            <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
              {enviando ? "Criando..." : "Criar plano de recuperação"}
            </button>
          </form>
        )}
      </Cartao>
    </div>
  );
}
