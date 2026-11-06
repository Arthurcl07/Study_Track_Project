"use client";

// Importação de estudantes por planilha CSV no detalhe da turma (SPEC-021, RF-30). Primeiro a prévia (nada é
// gravado); sem erros, a confirmação grava tudo e mostra as senhas provisórias uma única vez.
// Layout aprovado em docs/layout/prototipo.html#coord-importacao e #coord-importacao-ok.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { csvDasSenhas, type LinhaPrevia } from "@/domain/importacao";
import { Icone } from "./icones";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_LINK, CLASSE_ROTULO, ErroCampo, Mensagem } from "./ui";

type Resumo = { criar: number; matricular: number; jaMatriculados: number; erros: number };
type Senha = { nome: string; email: string; senha: string };

const SELOS: Record<LinhaPrevia["acao"], { classe: string; rotulo: string }> = {
  criar: { classe: "bg-normal-fundo text-normal", rotulo: "● Conta nova" },
  matricular: { classe: "bg-azul-suave text-azul-escuro", rotulo: "↺ Só matrícula" },
  "ja-matriculado": { classe: "bg-traco text-mudo", rotulo: "– Já matriculado" },
  erro: { classe: "bg-risco-fundo text-risco", rotulo: "■ " },
};

function baixar(nome: string, conteudo: string) {
  const url = URL.createObjectURL(new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export function ImportacaoPlanilha({ turmaId }: { turmaId: string }) {
  const router = useRouter();
  const [csv, setCsv] = useState("");
  const [arquivo, setArquivo] = useState("");
  const [linhas, setLinhas] = useState<LinhaPrevia[] | null>(null);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [senhas, setSenhas] = useState<Senha[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(conteudo: string, confirmar: boolean) {
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/turmas/${turmaId}/importacao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: conteudo, confirmar }),
      });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.campos?.csv ?? retorno.erro ?? "Não foi possível ler a planilha.");
        return;
      }
      setLinhas(retorno.linhas);
      setResumo(retorno.resumo);
      if (retorno.gravado) {
        setSenhas(retorno.senhas);
        router.refresh();
      }
    } catch {
      setErro("Não foi possível enviar a planilha. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function escolher(evento: React.ChangeEvent<HTMLInputElement>) {
    const file = evento.target.files?.[0];
    setLinhas(null);
    setResumo(null);
    setSenhas(null);
    if (!file) return;
    const texto = await file.text();
    setArquivo(file.name);
    setCsv(texto);
    await enviar(texto, false);
  }

  function recomecar() {
    setCsv("");
    setArquivo("");
    setLinhas(null);
    setResumo(null);
    setSenhas(null);
    setErro(null);
  }

  if (senhas && resumo) {
    return (
      <div className="space-y-4">
        <Mensagem tipo="sucesso">Importação concluída: {resumo.criar} conta(s) nova(s) e {resumo.criar + resumo.matricular} matrícula(s).</Mensagem>
        {senhas.length > 0 && (
          <>
            <p className="rounded-[10px] bg-info-fundo px-3 py-2.5 text-sm text-info">
              As senhas provisórias aparecem só agora. Entregue a cada estudante: no primeiro acesso, ele define a própria senha.
            </p>
            <button type="button" onClick={() => baixar("senhas-provisorias.csv", csvDasSenhas(senhas))} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>
              <Icone nome="download" className="h-4 w-4" /> Baixar lista (CSV)
            </button>
            <ul className="max-h-72 overflow-y-auto text-sm">
              {senhas.map((s) => (
                <li key={s.email} className="border-t border-traco py-2 first:border-t-0">
                  <span className="font-medium">{s.nome}</span>
                  <span className="block break-all text-mudo">{s.email}</span>
                  <code className="text-[14px]">{s.senha}</code>
                </li>
              ))}
            </ul>
          </>
        )}
        <button type="button" onClick={recomecar} className={`w-full ${CLASSE_BOTAO_SECUNDARIO}`}>Importar outra planilha</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="planilha" className={CLASSE_ROTULO}>Arquivo CSV</label>
        <input key={arquivo || "vazio"} id="planilha" type="file" accept=".csv,text/csv" onChange={escolher} className={CLASSE_CAMPO} />
        <ErroCampo mensagem={erro ?? undefined} />
        <button type="button" onClick={() => baixar("modelo-estudantes.csv", "nome;email\r\nAna Lima;ana.lima@exemplo.com\r\n")} className={`mt-2 text-sm ${CLASSE_LINK}`}>
          Baixar modelo (nome;email)
        </button>
      </div>
      {enviando && <p className="text-sm text-mudo">Lendo a planilha...</p>}
      {linhas && resumo && (
        <>
          {resumo.erros > 0 ? (
            <Mensagem tipo="erro">{resumo.erros} linha(s) com erro. Corrija a planilha e envie de novo: nada foi gravado.</Mensagem>
          ) : (
            <Mensagem tipo="info">Prévia de {arquivo}: confira e confirme. Nada foi gravado ainda.</Mensagem>
          )}
          <div className="flex flex-wrap gap-2 text-[13px]">
            <span className={`rounded-full px-2.5 py-0.5 font-semibold ${SELOS.criar.classe}`}>● {resumo.criar} conta(s) nova(s)</span>
            <span className={`rounded-full px-2.5 py-0.5 font-semibold ${SELOS.matricular.classe}`}>↺ {resumo.matricular} só matrícula</span>
            <span className={`rounded-full px-2.5 py-0.5 font-semibold ${SELOS["ja-matriculado"].classe}`}>– {resumo.jaMatriculados} já matriculado(s)</span>
            <span className={`rounded-full px-2.5 py-0.5 font-semibold ${SELOS.erro.classe}`}>■ {resumo.erros} com erro</span>
          </div>
          <ul className="max-h-80 overflow-y-auto text-sm">
            {linhas.map((l) => (
              <li key={l.linha} className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 border-t border-traco py-2 first:border-t-0">
                <span className="min-w-0">
                  <span className="text-mudo">Linha {l.linha} · </span>
                  <span className="font-medium">{l.nome || "(sem nome)"}</span>
                  <span className="block break-all text-mudo">{l.email || "(sem e-mail)"}</span>
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${SELOS[l.acao].classe}`}>
                  {l.acao === "erro" ? `■ ${l.erro}` : SELOS[l.acao].rotulo}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={recomecar} className={`flex-1 ${CLASSE_BOTAO_SECUNDARIO}`}>Cancelar</button>
            <button
              type="button"
              onClick={() => enviar(csv, true)}
              disabled={enviando || resumo.erros > 0 || resumo.criar + resumo.matricular === 0}
              className={`flex-1 ${CLASSE_BOTAO_PRIMARIO} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {enviando ? "Gravando..." : "Confirmar importação"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
