"use client";

// Mural e publicação de comunicados (SPEC-025, RF-34). As regras de alcance (RB-26) valem no servidor; aqui só se mostra
// o resultado. Layout aprovado em docs/layout/prototipo.html#comunicados-estudante e #comunicados-publicar.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LIMITE_TEXTO, LIMITE_TITULO } from "@/domain/comunicados";
import { Cartao, CLASSE_BOTAO_PRIMARIO, CLASSE_CAMPO, CLASSE_ROTULO, ErroCampo, EstadoVazio, Etiqueta, Mensagem } from "./ui";

type Comunicado = { id: string; titulo: string; texto: string; criadoEm: string; autor: string; meu: boolean; alcance: string };
type Opcoes = { turmas: { id: string; rotulo: string }[]; cursos: { id: string; nome: string }[] } | null;

const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function Item({ c }: { c: Comunicado }) {
  const router = useRouter();
  const [apagando, setApagando] = useState(false);
  async function apagar() {
    if (!window.confirm(`Apagar o comunicado "${c.titulo}"? Ele sai do mural de todos.`)) return;
    setApagando(true);
    await fetch(`/api/comunicados/${c.id}`, { method: "DELETE" }).catch(() => null);
    setApagando(false);
    router.refresh();
  }
  return (
    <article className="rounded-2xl border border-traco bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-mudo">
        <strong className="text-texto">{c.autor}{c.meu ? " (você)" : ""}</strong>
        <Etiqueta>{c.alcance}</Etiqueta>
        <time dateTime={c.criadoEm}>{quando(c.criadoEm)}</time>
        {c.meu && (
          <button type="button" onClick={apagar} disabled={apagando} className="ml-auto font-medium text-risco hover:underline disabled:opacity-60">
            {apagando ? "Apagando..." : "Apagar"}
          </button>
        )}
      </div>
      <h3 className="mt-2 text-base font-semibold">{c.titulo}</h3>
      <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line">{c.texto}</p>
    </article>
  );
}

function Formulario({ opcoes }: { opcoes: NonNullable<Opcoes> }) {
  const router = useRouter();
  const [alcance, setAlcance] = useState<"turma" | "curso">("turma");
  const [turmaId, setTurmaId] = useState("");
  const [cursoId, setCursoId] = useState(opcoes.cursos.length === 1 ? opcoes.cursos[0].id : "");
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function publicar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setErros({});
    setSucesso(null);
    setEnviando(true);
    try {
      const resposta = await fetch("/api/comunicados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alcance, turmaId, cursoId, titulo, texto }),
      });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.erro ?? "Não foi possível publicar.");
        setErros(retorno.campos ?? {});
        return;
      }
      setSucesso(`Comunicado publicado. ${retorno.notificados} pessoa(s) notificada(s).`);
      setTitulo("");
      setTexto("");
      router.refresh();
    } catch {
      setErro("Não foi possível publicar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={publicar} className="space-y-4" noValidate>
      {opcoes.cursos.length > 0 && (
        <div>
          <label htmlFor="alcance" className={CLASSE_ROTULO}>Para quem</label>
          <select id="alcance" value={alcance} onChange={(e) => setAlcance(e.target.value as "turma" | "curso")} className={CLASSE_CAMPO}>
            <option value="turma">Uma turma</option>
            <option value="curso">Todas as turmas de um curso</option>
          </select>
        </div>
      )}
      {alcance === "turma" ? (
        <div>
          <label htmlFor="turma" className={CLASSE_ROTULO}>Turma</label>
          <select id="turma" value={turmaId} onChange={(e) => setTurmaId(e.target.value)} aria-invalid={Boolean(erros.turmaId)} className={CLASSE_CAMPO}>
            <option value="">Selecione...</option>
            {opcoes.turmas.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
          </select>
          <ErroCampo mensagem={erros.turmaId} />
        </div>
      ) : (
        <div>
          <label htmlFor="curso" className={CLASSE_ROTULO}>Curso</label>
          <select id="curso" value={cursoId} onChange={(e) => setCursoId(e.target.value)} aria-invalid={Boolean(erros.cursoId)} className={CLASSE_CAMPO}>
            <option value="">Selecione...</option>
            {opcoes.cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <ErroCampo mensagem={erros.cursoId} />
        </div>
      )}
      <div>
        <label htmlFor="titulo" className={CLASSE_ROTULO}>Título</label>
        <input id="titulo" value={titulo} maxLength={LIMITE_TITULO} onChange={(e) => setTitulo(e.target.value)} aria-invalid={Boolean(erros.titulo)} className={CLASSE_CAMPO} />
        <ErroCampo mensagem={erros.titulo} />
      </div>
      <div>
        <label htmlFor="texto" className={CLASSE_ROTULO}>Texto</label>
        <textarea id="texto" rows={5} value={texto} maxLength={LIMITE_TEXTO} onChange={(e) => setTexto(e.target.value)} aria-invalid={Boolean(erros.texto)} className={CLASSE_CAMPO} />
        <div className="text-right text-xs text-mudo">{texto.length.toLocaleString("pt-BR")} de {LIMITE_TEXTO.toLocaleString("pt-BR")}</div>
        <ErroCampo mensagem={erros.texto} />
      </div>
      <p className="text-[13px] text-mudo">Os estudantes alcançados recebem notificação{opcoes.cursos.length > 0 ? "; ao publicar para o curso, os professores das turmas também" : ""}.</p>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
      <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>{enviando ? "Publicando..." : "Publicar"}</button>
    </form>
  );
}

export function MuralComunicados({ comunicados, opcoes }: { comunicados: Comunicado[]; opcoes: Opcoes }) {
  const podePublicar = opcoes !== null;
  const lista =
    comunicados.length === 0 ? (
      <EstadoVazio>Nenhum comunicado por enquanto.</EstadoVazio>
    ) : (
      <div className="space-y-3">{comunicados.map((c) => <Item key={c.id} c={c} />)}</div>
    );
  if (!podePublicar) return <div className="max-w-3xl">{lista}</div>;
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div>{lista}</div>
      <Cartao titulo="Novo comunicado">
        {opcoes.turmas.length === 0 && opcoes.cursos.length === 0 ? (
          <Mensagem tipo="info">Você não tem turma em período aberto para publicar.</Mensagem>
        ) : (
          <Formulario opcoes={opcoes} />
        )}
      </Cartao>
    </div>
  );
}
