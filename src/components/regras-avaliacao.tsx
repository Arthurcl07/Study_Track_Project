"use client";

// Configurações → Regras de avaliação (SPEC-052, RF-61, RB-47). "Ver efeito" mostra quantas matrículas mudariam de
// situação sem gravar (AC-052-01); "Salvar e recalcular" grava e recalcula os períodos abertos (AC-052-02).
// A validação vale no servidor. Layout aprovado em docs/layout/prototipo.html#config-regras.
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RegraAvaliacao } from "@/domain/situacao-academica";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_LINK, CLASSE_ROTULO, Cartao, ErroCampo, Mensagem, SeloSituacao } from "./ui";

type Mudancas = { total: number; semMudanca: number; transicoes: { de: "Normal" | "Atencao" | "Risco"; para: "Normal" | "Atencao" | "Risco"; quantidade: number }[] };

const PADRAO: RegraAvaliacao = { mediaMinima: 6, limiteRisco: 5, frequenciaMinima: 75, notaExame: 5 };
const br = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const umaCasa = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const paraTexto = (r: RegraAvaliacao) => ({ mediaMinima: umaCasa(r.mediaMinima), limiteRisco: umaCasa(r.limiteRisco), frequenciaMinima: br(r.frequenciaMinima), notaExame: umaCasa(r.notaExame) });

const CAMPOS: { nome: keyof RegraAvaliacao; rotulo: string; sufixo?: string }[] = [
  { nome: "mediaMinima", rotulo: "Média mínima (Normal)" },
  { nome: "limiteRisco", rotulo: "Abaixo disso é Risco" },
  { nome: "frequenciaMinima", rotulo: "Frequência mínima", sufixo: "%" },
  { nome: "notaExame", rotulo: "Nota final mínima no exame" },
];

export function RegrasAvaliacao({ atual }: { atual: RegraAvaliacao }) {
  const router = useRouter();
  const [valores, setValores] = useState(() => paraTexto(atual));
  const [erros, setErros] = useState<Record<string, string>>({});
  const [previa, setPrevia] = useState<Mudancas | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState<"previa" | "salvar" | null>(null);

  async function enviar(tipo: "previa" | "salvar") {
    setEnviando(tipo);
    setErros({});
    setMensagem(null);
    try {
      const resposta = await fetch(tipo === "previa" ? "/api/instituicao/regras/previa" : "/api/instituicao/regras", {
        method: tipo === "previa" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valores),
      });
      const corpo = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErros(corpo.campos ?? {});
        setMensagem({ tipo: "erro", texto: corpo.erro ?? "Não foi possível." });
        return;
      }
      setPrevia(corpo.mudancas);
      if (tipo === "salvar") {
        const mudaram = corpo.mudancas.total - corpo.mudancas.semMudanca;
        setMensagem({ tipo: "sucesso", texto: `Regras salvas. ${mudaram} matrícula(s) mudaram de situação; dashboards, alertas e relatórios já mostram a nova regra.` });
        router.refresh();
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Não foi possível." });
    } finally {
      setEnviando(null);
    }
  }

  const mudou = (Object.keys(valores) as (keyof RegraAvaliacao)[]).some((k) => valores[k] !== paraTexto(atual)[k]);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <Cartao titulo="Regras de avaliação">
        <form onSubmit={(e) => { e.preventDefault(); enviar("salvar"); }} noValidate className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {CAMPOS.map((c) => (
              <div key={c.nome}>
                <label htmlFor={c.nome} className={CLASSE_ROTULO}>{c.rotulo}{c.sufixo ? ` (${c.sufixo})` : ""}</label>
                <input
                  id={c.nome}
                  inputMode="decimal"
                  value={valores[c.nome]}
                  onChange={(e) => { setValores((v) => ({ ...v, [c.nome]: e.target.value })); setPrevia(null); }}
                  aria-invalid={Boolean(erros[c.nome])}
                  aria-describedby={erros[c.nome] ? `${c.nome}-erro` : undefined}
                  className={CLASSE_CAMPO}
                />
                <div id={`${c.nome}-erro`}><ErroCampo mensagem={erros[c.nome]} /></div>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-mudo">Faixas: média 5,0 a 8,0 · frequência 50% a 90% · exame 4,0 a 7,0. Períodos encerrados mantêm a regra com que foram encerrados.</p>
          {mensagem && <Mensagem tipo={mensagem.tipo}>{mensagem.texto}</Mensagem>}
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => enviar("previa")} disabled={enviando !== null} className={CLASSE_BOTAO_SECUNDARIO}>
              {enviando === "previa" ? "Calculando..." : "Ver efeito"}
            </button>
            <button type="submit" disabled={enviando !== null} className={CLASSE_BOTAO_PRIMARIO}>
              {enviando === "salvar" ? "Recalculando..." : "Salvar e recalcular"}
            </button>
            <button type="button" onClick={() => { setValores(paraTexto(PADRAO)); setPrevia(null); }} className={`text-sm ${CLASSE_LINK}`}>
              Voltar ao padrão (6,0 · 5,0 · 75% · 5,0)
            </button>
          </div>
        </form>
      </Cartao>
      <Cartao titulo="Efeito da mudança">
        {previa ? (
          <div aria-live="polite">
            <p className="mb-3 text-sm">Nos períodos abertos ({previa.total} matrículas com indicador):</p>
            {previa.transicoes.length === 0 ? (
              <p className="text-sm text-mudo">Ninguém muda de situação.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {previa.transicoes.map((t) => (
                  <li key={`${t.de}-${t.para}`} className="flex flex-wrap items-center gap-2">
                    <SeloSituacao situacao={t.de} /> → <SeloSituacao situacao={t.para} /> <strong className="tabular-nums">{t.quantidade} matrícula(s)</strong>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-sm">Sem mudança: <strong className="tabular-nums">{previa.semMudanca}</strong></p>
            <p className="mt-3 text-[13px] text-mudo">{mudou ? "Nada foi gravado ainda. \"Salvar e recalcular\" atualiza dashboards, alertas e relatórios na hora." : "Esta é a regra em vigor."}</p>
          </div>
        ) : (
          <p className="text-sm text-mudo">Mude um valor e clique em <b>Ver efeito</b> para saber quantos estudantes mudariam de situação antes de salvar.</p>
        )}
      </Cartao>
    </div>
  );
}
