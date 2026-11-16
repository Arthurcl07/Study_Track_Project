"use client";

// Importação do sistema anterior (SPEC-058, RF-64, RB-49): duas planilhas, prévia com contagens e erros por linha;
// sem erro, a confirmação grava tudo e mostra as senhas provisórias uma vez.
// Layout aprovado em docs/layout/prototipo.html#importar-anterior.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { csvDasSenhas } from "@/domain/importacao";
import { MODELO_ALUNOS, MODELO_HISTORICO } from "@/domain/importacao-anterior";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_LINK, CLASSE_ROTULO, Cartao, EstadoVazio, Mensagem } from "./ui";

type Retorno = {
  gravado: boolean;
  resumo: { alunos: number; registros: number; aprovados: number; erros: number };
  previa: { nome: string; matricula: string; curso: string; registros: number; integralizacao: number | null }[];
  erros: { planilha: "alunos" | "historico"; linha: number; erro: string }[];
  senhas: { nome: string; email: string; senha: string }[];
};

function baixar(nome: string, conteudo: string) {
  const url = URL.createObjectURL(new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v)}%`);

export function ImportacaoAnterior() {
  const router = useRouter();
  const [alunos, setAlunos] = useState("");
  const [historico, setHistorico] = useState("");
  const [retorno, setRetorno] = useState<Retorno | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<"previa" | "confirmar" | null>(null);

  async function enviar(confirmar: boolean) {
    setErro(null);
    setEnviando(confirmar ? "confirmar" : "previa");
    try {
      const resposta = await fetch("/api/importacao-anterior", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alunos, historico, confirmar }) });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(corpo.campos?.alunos ?? corpo.campos?.historico ?? corpo.erro ?? "Não foi possível ler as planilhas.");
        return;
      }
      setRetorno(corpo);
      if (corpo.gravado) router.refresh();
    } catch {
      setErro("Não foi possível ler as planilhas.");
    } finally {
      setEnviando(null);
    }
  }

  const arquivo = (definir: (t: string) => void) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setRetorno(null);
    definir(f ? await f.text() : "");
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <Cartao titulo="Planilhas">
        <div className="space-y-4">
          <div>
            <label htmlFor="planilha-alunos" className={CLASSE_ROTULO}>Alunos (nome;email;curso;matricula;cpf;nascimento;telefone)</label>
            <input id="planilha-alunos" type="file" accept=".csv,text/csv" onChange={arquivo(setAlunos)} className={`${CLASSE_CAMPO} py-1.5`} />
          </div>
          <div>
            <label htmlFor="planilha-historico" className={CLASSE_ROTULO}>Histórico (matricula;disciplina;periodo;media;frequencia)</label>
            <input id="planilha-historico" type="file" accept=".csv,text/csv" onChange={arquivo(setHistorico)} className={`${CLASSE_CAMPO} py-1.5`} />
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <button type="button" onClick={() => baixar("modelo-alunos.csv", MODELO_ALUNOS)} className={CLASSE_LINK}>Baixar modelo de alunos</button>
            <button type="button" onClick={() => baixar("modelo-historico.csv", MODELO_HISTORICO)} className={CLASSE_LINK}>Baixar modelo de histórico</button>
          </p>
          <button type="button" disabled={!alunos || enviando !== null} onClick={() => enviar(false)} className={CLASSE_BOTAO_SECUNDARIO}>
            {enviando === "previa" ? "Lendo..." : "Ver prévia"}
          </button>
          {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
        </div>
      </Cartao>
      <Cartao titulo={retorno?.gravado ? "Importação concluída" : "Prévia"}>
        {!retorno ? (
          <EstadoVazio>Escolha as planilhas e clique em Ver prévia. Nada é gravado antes de confirmar.</EstadoVazio>
        ) : (
          <div className="space-y-3" aria-live="polite">
            <div className="flex flex-wrap gap-2 text-[13px]">
              <span className="rounded-full bg-normal-fundo px-2.5 py-0.5 font-semibold text-normal">● {retorno.resumo.alunos} aluno(s)</span>
              <span className="rounded-full bg-normal-fundo px-2.5 py-0.5 font-semibold text-normal">● {retorno.resumo.registros} registro(s) de histórico</span>
              <span className="rounded-full bg-azul-suave px-2.5 py-0.5 font-semibold text-azul-escuro">{retorno.resumo.aprovados} aprovado(s)</span>
              <span className={`rounded-full px-2.5 py-0.5 font-semibold ${retorno.resumo.erros ? "bg-risco-fundo text-risco" : "bg-traco text-mudo"}`}>■ {retorno.resumo.erros} erro(s)</span>
            </div>
            {retorno.erros.length > 0 && (
              <div role="alert" className="rounded-[10px] bg-erro-fundo px-3 py-2.5 text-sm text-risco">
                <p className="font-semibold">Nada será gravado enquanto houver erro:</p>
                <ul className="mt-1 max-h-40 list-disc space-y-0.5 overflow-y-auto pl-5">
                  {retorno.erros.slice(0, 50).map((e) => <li key={`${e.planilha}-${e.linha}`}>Linha {e.linha} {e.planilha === "alunos" ? "dos alunos" : "do histórico"}: {e.erro}</li>)}
                </ul>
              </div>
            )}
            {retorno.previa.length > 0 && !retorno.gravado && (
              <table className="tabela-responsiva w-full text-[14px]">
                <thead>
                  <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                    <th className="pb-2">Aluno</th><th className="pb-2">Curso</th><th className="pr-4 pb-2 text-right">Registros</th><th className="pb-2 text-right">Integralização</th>
                  </tr>
                </thead>
                <tbody>
                  {retorno.previa.slice(0, 100).map((p) => (
                    <tr key={p.matricula} className="border-t border-traco">
                      <td data-rotulo="Aluno" className="py-2 pr-2">{p.nome} · <span className="tabular-nums text-mudo">{p.matricula}</span></td>
                      <td data-rotulo="Curso" className="py-2 pr-2">{p.curso}</td>
                      <td data-rotulo="Registros" className="py-2 pr-4 text-right tabular-nums">{p.registros}</td>
                      <td data-rotulo="Integralização" className="py-2 text-right tabular-nums">{pct(p.integralizacao)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!retorno.gravado && (
              <button type="button" disabled={retorno.resumo.erros > 0 || retorno.resumo.alunos === 0 || enviando !== null} onClick={() => enviar(true)} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
                {enviando === "confirmar" ? "Importando..." : `Confirmar importação de ${retorno.resumo.alunos} aluno(s)`}
              </button>
            )}
            {retorno.gravado && (
              <>
                <Mensagem tipo="sucesso">{retorno.resumo.alunos} aluno(s) e {retorno.resumo.registros} registro(s) gravados. O histórico de cada um já mostra o sistema anterior. As senhas provisórias aparecem só agora.</Mensagem>
                <button type="button" onClick={() => baixar("senhas-alunos.csv", csvDasSenhas(retorno.senhas))} className={CLASSE_BOTAO_SECUNDARIO}>Baixar as senhas (CSV)</button>
              </>
            )}
          </div>
        )}
      </Cartao>
    </div>
  );
}
