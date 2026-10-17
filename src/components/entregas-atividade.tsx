"use client";

// Tela do professor (SPEC-005, OPEN-003): status de cada estudante na atividade e registro ou desfazer
// da entrega. O status chega pronto do servidor (função de domínio, OPEN-010).
// Layout aprovado em docs/layout/prototipo.html#professor-atividade.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { StatusEntrega } from "@/domain/atividades";
import {
  Cartao,
  CLASSE_BOTAO_PRIMARIO,
  CLASSE_CAMPO,
  CLASSE_ROTULO,
  ErroCampo,
  EstadoVazio,
  formatarDataCurta,
  Mensagem,
  SeloEntrega,
} from "./ui";

export type LinhaEntrega = {
  estudanteId: string;
  nome: string;
  status: StatusEntrega;
  entrega: { id: string; dataEntrega: string } | null;
};

export function EntregasAtividade({ atividadeId, linhas, hoje }: { atividadeId: string; linhas: LinhaEntrega[]; hoje: string }) {
  const router = useRouter();
  const [estudanteId, setEstudanteId] = useState("");
  const [data, setData] = useState(hoje);
  const [erro, setErro] = useState<string | null>(null);
  const [erroCampo, setErroCampo] = useState<string | undefined>();
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const linha = linhas.find((l) => l.estudanteId === estudanteId);
  const entregues = linhas.filter((l) => l.entrega).length;

  function limpar() {
    setErro(null);
    setErroCampo(undefined);
    setSucesso(null);
  }

  function escolher(id: string) {
    setEstudanteId(id);
    setData(hoje);
    limpar();
  }

  async function registrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    limpar();
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/atividades/${atividadeId}/entregas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estudanteId, dataEntrega: data }),
      });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.erro ?? "Não foi possível salvar.");
        setErroCampo(retorno.campos?.dataEntrega ?? retorno.campos?.selecao);
        return;
      }
      setSucesso(`Entrega registrada: ${retorno.status === "Atrasada" ? "■ Atrasada (depois do prazo)" : "● No prazo"}.`);
      setEstudanteId("");
      router.refresh();
    } catch {
      setErro("Não foi possível salvar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function desfazer(entregaId: string, nome: string) {
    limpar();
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/entregas/${entregaId}`, { method: "DELETE" });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.erro ?? "Não foi possível desfazer.");
        return;
      }
      setSucesso(`Registro de entrega de ${nome} desfeito.`);
      setEstudanteId("");
      router.refresh();
    } catch {
      setErro("Não foi possível desfazer. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
      <Cartao titulo={`Entregas (${entregues} de ${linhas.length})`}>
        {linhas.length === 0 ? (
          <EstadoVazio>Nenhum estudante matriculado nesta turma.</EstadoVazio>
        ) : (
          <>
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Estudante</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Entregue em</th>
                  <th className="pb-2.5"><span className="sr-only">Ação</span></th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.estudanteId} className={`border-t border-traco ${l.estudanteId === estudanteId ? "bg-azul-suave" : ""}`}>
                    <td data-rotulo="Estudante" className="px-2 py-3">{l.nome}</td>
                    <td data-rotulo="Status" className="px-2 py-3"><SeloEntrega status={l.status} /></td>
                    <td data-rotulo="Entregue em" className={`px-2 py-3 tabular-nums ${l.entrega ? "" : "text-mudo"}`}>
                      {l.entrega ? formatarDataCurta(l.entrega.dataEntrega) : "—"}
                    </td>
                    <td className="px-2 py-3 text-right">
                      {l.entrega ? (
                        <button
                          type="button"
                          disabled={enviando}
                          onClick={() => desfazer(l.entrega!.id, l.nome)}
                          className="font-medium text-azul hover:underline disabled:opacity-60"
                        >
                          Desfazer
                        </button>
                      ) : (
                        <button type="button" onClick={() => escolher(l.estudanteId)} className="font-medium text-azul hover:underline">
                          Registrar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-[13px] text-mudo">
              Sem entrega até o fim do prazo, o status vira ■ Atrasada automaticamente. Entregue depois do prazo também fica Atrasada.
            </p>
          </>
        )}
      </Cartao>

      <Cartao titulo={linha ? `Registrar entrega · ${linha.nome}` : "Registrar entrega"}>
        {!linha ? (
          <div className="space-y-3">
            <p className="text-sm text-mudo">Clique em “Registrar” ao lado de um estudante.</p>
            {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
            {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
          </div>
        ) : (
          <form onSubmit={registrar} className="space-y-4" noValidate>
            <div>
              <label htmlFor="data-entrega" className={CLASSE_ROTULO}>Data da entrega</label>
              <input
                id="data-entrega"
                type="date"
                value={data}
                max={hoje}
                onChange={(e) => setData(e.target.value)}
                aria-invalid={Boolean(erroCampo)}
                className={CLASSE_CAMPO}
              />
              <ErroCampo mensagem={erroCampo} />
            </div>
            {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
            <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
              {enviando ? "Salvando..." : "Registrar entrega"}
            </button>
          </form>
        )}
      </Cartao>
    </div>
  );
}
