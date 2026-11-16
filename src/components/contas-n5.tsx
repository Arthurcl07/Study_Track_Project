"use client";

// SPEC-053 / RF-62: trocar o perfil de uma conta (RB-48) e importar professores por planilha (nome;email).
// As regras valem no servidor; aqui só se mostra a mensagem que ele devolver.
// Layout aprovado em docs/layout/prototipo.html#contas-perfil-importar.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { csvDasSenhas } from "@/domain/importacao";
import { PERFIS, type Perfil } from "@/domain/perfil";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_LINK, CLASSE_ROTULO, ErroCampo, Mensagem } from "./ui";

export function TrocarPerfil({ conta, cursos, aoFechar }: { conta: { id: string; nome: string; perfil: Perfil }; cursos: { id: string; nome: string }[]; aoFechar: (aviso?: string) => void }) {
  const [perfil, setPerfil] = useState<Perfil>(PERFIS.find((p) => p !== conta.perfil) ?? conta.perfil);
  const [erro, setErro] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(evento.currentTarget));
    setEnviando(true);
    setErro(null);
    setErros({});
    const resposta = await fetch(`/api/contas/${conta.id}/perfil`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) }).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!resposta?.ok) {
      setErros(retorno.campos ?? {});
      setErro(retorno.campos ? null : (retorno.erro ?? "Não foi possível trocar o perfil."));
      return;
    }
    aoFechar(`${retorno.nome} agora é ${retorno.perfil}.`);
  }

  return (
    <form onSubmit={salvar} noValidate className="space-y-3 rounded-xl border border-azul-suave bg-nevoa p-4">
      <p className="font-semibold">Trocar perfil · <span className="font-normal">{conta.nome}</span> <span className="text-mudo">(hoje {conta.perfil})</span></p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`perfil-${conta.id}`} className={CLASSE_ROTULO}>Novo perfil</label>
          <select id={`perfil-${conta.id}`} name="perfil" value={perfil} onChange={(e) => setPerfil(e.target.value as Perfil)} className={CLASSE_CAMPO}>
            {PERFIS.filter((p) => p !== conta.perfil).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <ErroCampo mensagem={erros.perfil} />
        </div>
        {perfil === "Estudante" && (
          <div>
            <label htmlFor={`curso-${conta.id}`} className={CLASSE_ROTULO}>Curso</label>
            <select id={`curso-${conta.id}`} name="cursoId" defaultValue="" className={CLASSE_CAMPO}>
              <option value="">Escolha o curso</option>
              {cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <ErroCampo mensagem={erros.cursoId} />
          </div>
        )}
      </div>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      <p className="text-sm text-mudo">Só troca sem turmas, cursos ou matrículas que o novo perfil não pode ter. Fica na auditoria.</p>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={enviando} className={CLASSE_BOTAO_PRIMARIO}>{enviando ? "Trocando..." : "Trocar perfil"}</button>
        <button type="button" onClick={() => aoFechar()} className={CLASSE_BOTAO_SECUNDARIO}>Cancelar</button>
      </div>
    </form>
  );
}

type Linha = { linha: number; nome: string; email: string; erro?: string };
type Senha = { nome: string; email: string; senha: string };

function baixar(nome: string, conteudo: string) {
  const url = URL.createObjectURL(new Blob(["﻿" + conteudo], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

export function ImportarProfessores() {
  const router = useRouter();
  const [csv, setCsv] = useState("");
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [resumo, setResumo] = useState<{ novos: number; erros: number } | null>(null);
  const [senhas, setSenhas] = useState<Senha[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(conteudo: string, confirmar: boolean) {
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await fetch("/api/contas/importar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ csv: conteudo, confirmar }) });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.campos?.csv ?? retorno.erro ?? "Não foi possível ler a planilha.");
        return;
      }
      setLinhas(retorno.linhas);
      setResumo({ novos: retorno.novos, erros: retorno.erros });
      if (retorno.gravado) {
        setSenhas(retorno.senhas);
        router.refresh();
      }
    } catch {
      setErro("Não foi possível ler a planilha.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="csv-professores" className={CLASSE_ROTULO}>Arquivo CSV</label>
          <input
            id="csv-professores"
            type="file"
            accept=".csv,text/csv"
            className={`${CLASSE_CAMPO} py-1.5`}
            onChange={async (e) => {
              const arquivo = e.target.files?.[0];
              setLinhas(null);
              setSenhas(null);
              if (!arquivo) return;
              const texto = await arquivo.text();
              setCsv(texto);
              enviar(texto, false);
            }}
          />
        </div>
        <button type="button" onClick={() => baixar("modelo-professores.csv", "nome;email\r\nRita Paes;rita.paes@faculdade.test\r\n")} className={`text-sm ${CLASSE_LINK}`}>
          Baixar modelo (nome;email)
        </button>
      </div>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {resumo && (
        <div className="flex flex-wrap gap-2 text-[13px]">
          <span className="rounded-full bg-normal-fundo px-2.5 py-0.5 font-semibold text-normal">● {resumo.novos} professor(es) novo(s)</span>
          <span className={`rounded-full px-2.5 py-0.5 font-semibold ${resumo.erros ? "bg-risco-fundo text-risco" : "bg-traco text-mudo"}`}>■ {resumo.erros} com erro</span>
        </div>
      )}
      {linhas && !senhas && (
        <>
          <ul className="max-h-56 space-y-1 overflow-y-auto text-sm">
            {linhas.map((l) => (
              <li key={l.linha} className={l.erro ? "text-risco" : ""}>
                Linha {l.linha}: {l.nome || "—"} · {l.email || "—"}{l.erro ? ` — ${l.erro}` : ""}
              </li>
            ))}
          </ul>
          <button type="button" disabled={enviando || !resumo || resumo.erros > 0 || resumo.novos === 0} onClick={() => enviar(csv, true)} className={CLASSE_BOTAO_PRIMARIO}>
            {enviando ? "Importando..." : `Confirmar e criar ${resumo?.novos ?? 0} conta(s)`}
          </button>
        </>
      )}
      {senhas && (
        <div className="space-y-2">
          <Mensagem tipo="sucesso">{senhas.length} professor(es) criado(s). As senhas aparecem só agora; no primeiro acesso cada um define a própria.</Mensagem>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase"><th className="pb-1.5">Nome</th><th className="pb-1.5">E-mail</th><th className="pb-1.5">Senha provisória</th></tr>
            </thead>
            <tbody>
              {senhas.map((s) => (
                <tr key={s.email} className="border-t border-traco"><td className="py-1.5 pr-2">{s.nome}</td><td className="py-1.5 pr-2 break-all">{s.email}</td><td className="py-1.5"><code>{s.senha}</code></td></tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={() => baixar("senhas-professores.csv", csvDasSenhas(senhas))} className={CLASSE_BOTAO_SECUNDARIO}>Baixar as senhas (CSV)</button>
        </div>
      )}
    </div>
  );
}
