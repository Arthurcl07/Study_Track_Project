"use client";

// Requerimentos (SPEC-036, RF-44): o estudante abre e acompanha; professor e secretaria analisam, deferem ou
// indeferem; a coordenação só consulta. As regras valem no servidor (RB-34). Layout aprovado em
// docs/layout/prototipo.html#requerimentos-estudante e #requerimentos-responder.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ROTULO_TIPO_REQUERIMENTO, TIPOS_REQUERIMENTO, ehTrancamento, exigeTurma, vaiAoProfessor, type StatusRequerimento, type TipoRequerimento } from "@/domain/requerimentos";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, Cartao, ErroCampo, EstadoVazio, Mensagem, formatarDataCurta } from "./ui";

export type RequerimentoDaLista = {
  id: string;
  protocolo: string;
  tipo: TipoRequerimento;
  rotuloTipo: string;
  status: StatusRequerimento;
  rotuloStatus: string;
  descricao: string;
  resposta: string | null;
  prazo: string;
  atrasado: boolean;
  criadoEm: string;
  estudante: string;
  matricula: string | null;
  curso: string | null;
  turma: string | null;
  avaliacao: string | null;
  responsavel: string | null;
  // SPEC-044: o que deferir vai fazer (só para quem responde um trancamento pendente).
  efeito: string | null;
};
export type TurmaDoRequerimento = { id: string; rotulo: string; professor: string; avaliacoes: { id: string; nome: string }[] };

const COR: Record<StatusRequerimento, string> = {
  Aberto: "bg-info-fundo text-info",
  EmAnalise: "bg-atencao-fundo text-atencao",
  Deferido: "bg-normal-fundo text-normal",
  Indeferido: "bg-risco-fundo text-risco",
};
const SIMBOLO: Record<StatusRequerimento, string> = { Aberto: "○", EmAnalise: "▲", Deferido: "✓", Indeferido: "✕" };

export function SeloRequerimento({ status, rotulo }: { status: StatusRequerimento; rotulo: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap ${COR[status]}`}>{SIMBOLO[status]} {rotulo}</span>;
}

function NovoRequerimento({ turmas }: { turmas: TurmaDoRequerimento[] }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoRequerimento>("RevisaoProva");
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const turma = turmas.find((t) => t.id === turmaId);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    setEnviando(true);
    setErro(null);
    setErros({});
    setSucesso(null);
    const resposta = await fetch("/api/requerimentos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) }).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!resposta?.ok) {
      setErro(retorno.erro ?? "Não foi possível enviar.");
      setErros(retorno.campos ?? {});
      return;
    }
    form.reset();
    setSucesso(`Requerimento ${retorno.protocolo} enviado. Resposta até ${formatarDataCurta(retorno.prazo)}.`);
    router.refresh();
  }

  return (
    <Cartao titulo="Novo requerimento">
      <form onSubmit={enviar} noValidate className="space-y-4">
        <div>
          <label htmlFor="req-tipo" className={CLASSE_ROTULO}>Tipo</label>
          <select id="req-tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoRequerimento)} className={CLASSE_CAMPO}>
            {TIPOS_REQUERIMENTO.map((t) => <option key={t} value={t}>{ROTULO_TIPO_REQUERIMENTO[t]}</option>)}
          </select>
          <ErroCampo mensagem={erros.tipo} />
        </div>
        {exigeTurma(tipo) && (
          <>
            <div>
              <label htmlFor="req-turma" className={CLASSE_ROTULO}>{tipo === "TrancamentoDisciplina" ? "Disciplina que quer trancar" : "Turma"}</label>
              <select id="req-turma" name="turmaId" value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className={CLASSE_CAMPO}>
                {turmas.length === 0 && <option value="">Você não está cursando nenhuma turma</option>}
                {turmas.map((t) => <option key={t.id} value={t.id}>{t.rotulo}</option>)}
              </select>
              <ErroCampo mensagem={erros.turmaId} />
            </div>
            {vaiAoProfessor(tipo) && (
              <div>
                <label htmlFor="req-avaliacao" className={CLASSE_ROTULO}>Avaliação (opcional)</label>
                <select id="req-avaliacao" name="avaliacaoId" defaultValue="" className={CLASSE_CAMPO}>
                  <option value="">—</option>
                  {turma?.avaliacoes.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
                <ErroCampo mensagem={erros.avaliacaoId} />
              </div>
            )}
          </>
        )}
        <div>
          <label htmlFor="req-descricao" className={CLASSE_ROTULO}>{ehTrancamento(tipo) ? "Motivo" : "Descrição"}</label>
          <textarea id="req-descricao" name="descricao" rows={4} maxLength={1000} aria-invalid={Boolean(erros.descricao)} className={CLASSE_CAMPO} />
          <ErroCampo mensagem={erros.descricao} />
        </div>
        {/* SPEC-044: o efeito de cada trancamento, antes de enviar. */}
        {tipo === "TrancamentoDisciplina" && (
          <Mensagem tipo="info">
            Se a secretaria deferir, <strong>só {turma ? turma.rotulo.split(" · ").slice(1).join(" · ") || turma.rotulo : "essa disciplina"}</strong> fica trancada: sai da chamada e das notas, e o boletim e o histórico mostram &ldquo;Trancada&rdquo;. Suas notas e presenças ficam guardadas. As outras disciplinas continuam normais.
          </Mensagem>
        )}
        {tipo === "Trancamento" && (
          <Mensagem tipo="info">Se a secretaria deferir, você fica com o curso <strong>Trancado</strong> e <strong>todas</strong> as suas disciplinas do semestre ficam Trancadas.</Mensagem>
        )}
        <p className="text-sm text-mudo">
          {vaiAoProfessor(tipo) ? `Vai para ${turma ? `o(a) professor(a) ${turma.professor}` : "o professor da turma"}.` : "Vai para a secretaria."} Resposta em até 5 dias úteis.
          {tipo === "TrancamentoDisciplina" && " Só dá para trancar enquanto o diário da turma estiver aberto."}
        </p>
        {erro && Object.keys(erros).length === 0 && <Mensagem tipo="erro">{erro}</Mensagem>}
        {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
        <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>{enviando ? "Enviando..." : "Enviar requerimento"}</button>
      </form>
    </Cartao>
  );
}

function Responder({ req, aoFechar }: { req: RequerimentoDaLista; aoFechar: () => void }) {
  const router = useRouter();
  const [resposta, setResposta] = useState(req.resposta ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(status: StatusRequerimento) {
    setEnviando(true);
    setErro(null);
    const r = await fetch(`/api/requerimentos/${req.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, resposta }) }).catch(() => null);
    const retorno = r ? await r.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!r?.ok) {
      setErro(retorno.campos?.resposta ?? retorno.erro ?? "Não foi possível salvar.");
      return;
    }
    if (status !== "EmAnalise") aoFechar();
    router.refresh();
  }

  return (
    <Cartao titulo={`${req.protocolo} · ${req.rotuloTipo}`}>
      <p className="text-sm"><strong>{req.estudante}</strong>{req.matricula ? ` · ${req.matricula}` : ""}{req.curso ? ` · ${req.curso}` : ""}</p>
      {req.turma && <p className="text-sm text-mudo">{req.turma}{req.avaliacao ? ` · ${req.avaliacao}` : ""}</p>}
      <p className="mt-2 text-sm text-mudo">Aberto em {formatarDataCurta(req.criadoEm.slice(0, 10))} · prazo {formatarDataCurta(req.prazo)}{req.atrasado ? " (atrasado)" : ""}</p>
      <blockquote className="my-3 rounded-lg bg-nevoa px-3 py-2 text-sm">{req.descricao}</blockquote>
      {req.efeito && <div className="mb-3"><Mensagem tipo="aviso"><strong>{req.efeito}</strong></Mensagem></div>}
      <label htmlFor="resposta" className={CLASSE_ROTULO}>Resposta</label>
      <textarea id="resposta" rows={3} value={resposta} onChange={(e) => setResposta(e.target.value)} maxLength={1000} className={CLASSE_CAMPO} />
      {erro && <div className="mt-2"><Mensagem tipo="erro">{erro}</Mensagem></div>}
      <div className="mt-3 flex flex-wrap gap-2">
        {req.status === "Aberto" && <button type="button" disabled={enviando} onClick={() => enviar("EmAnalise")} className={CLASSE_BOTAO_SECUNDARIO}>Em análise</button>}
        <button type="button" disabled={enviando} onClick={() => enviar("Deferido")} className={CLASSE_BOTAO_PRIMARIO}>{ehTrancamento(req.tipo) ? "Deferir e trancar" : "Deferir"}</button>
        <button type="button" disabled={enviando} onClick={() => enviar("Indeferido")} className={`${CLASSE_BOTAO_SECUNDARIO} text-risco`}>Indeferir</button>
        <button type="button" onClick={aoFechar} className="text-sm font-medium text-mudo hover:underline">Fechar</button>
      </div>
    </Cartao>
  );
}

export function Requerimentos({ itens, perfil, podeResponder, turmas }: { itens: RequerimentoDaLista[]; perfil: string; podeResponder: boolean; turmas: TurmaDoRequerimento[] }) {
  const [aberto, setAberto] = useState<string | null>(null);
  const selecionado = itens.find((i) => i.id === aberto) ?? null;
  const estudante = perfil === "Estudante";
  const pendentes = itens.filter((i) => i.status === "Aberto" || i.status === "EmAnalise").length;

  const lista = (
    <Cartao titulo={estudante ? `Meus requerimentos (${itens.length})` : `Requerimentos (${pendentes} pendente(s) de ${itens.length})`}>
      {itens.length === 0 ? (
        <EstadoVazio>Nenhum requerimento.</EstadoVazio>
      ) : (
        <table className="tabela-responsiva w-full text-[15px]">
          <thead>
            <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
              <th className="pr-2 pb-2.5">Protocolo</th>
              {!estudante && <th className="px-2 pb-2.5">Estudante</th>}
              <th className="px-2 pb-2.5">Tipo</th>
              <th className="px-2 pb-2.5">Prazo</th>
              <th className="pb-2.5 pl-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((r) => (
              <tr key={r.id} className={`border-t border-traco ${r.id === aberto ? "bg-azul-suave" : ""}`}>
                <td data-rotulo="Protocolo" className="py-3 pr-2 whitespace-nowrap tabular-nums">
                  {podeResponder && (r.status === "Aberto" || r.status === "EmAnalise") ? (
                    <button type="button" onClick={() => setAberto(r.id)} className="font-medium text-azul hover:underline">{r.protocolo}</button>
                  ) : r.protocolo}
                </td>
                {!estudante && <td data-rotulo="Estudante" className="px-2 py-3">{r.estudante}{r.matricula && <span className="block text-xs text-mudo">{r.matricula}</span>}</td>}
                <td data-rotulo="Tipo" className="px-2 py-3">
                  {r.rotuloTipo}
                  {r.turma && <span className="block text-xs text-mudo">{r.turma}{r.avaliacao ? ` · ${r.avaliacao}` : ""}</span>}
                </td>
                <td data-rotulo="Prazo" className={`px-2 py-3 tabular-nums ${r.atrasado ? "font-semibold text-risco" : ""}`}>{formatarDataCurta(r.prazo)}{r.atrasado ? " · atrasado" : ""}</td>
                <td data-rotulo="Status" className="py-3 pl-2">
                  <SeloRequerimento status={r.status} rotulo={r.rotuloStatus} />
                  {r.resposta && (r.status === "Deferido" || r.status === "Indeferido") && <span className="mt-1 block max-w-72 text-xs text-mudo">&ldquo;{r.resposta}&rdquo;{r.responsavel ? ` — ${r.responsavel}` : ""}</span>}
                  {estudante && r.tipo === "DeclaracaoMatricula" && r.status === "Deferido" && (
                    <Link href={`/documentos/declaracao?requerimento=${r.id}`} className="mt-1 block text-sm font-medium text-azul hover:underline">Abrir declaração →</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {perfil === "Coordenador" && <p className="mt-3 text-sm text-mudo">Requerimentos dos estudantes dos seus cursos, só para acompanhar: quem responde é o professor da turma ou a secretaria.</p>}
    </Cartao>
  );

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
      {lista}
      {estudante ? (
        <NovoRequerimento turmas={turmas} />
      ) : selecionado ? (
        <Responder key={selecionado.id} req={selecionado} aoFechar={() => setAberto(null)} />
      ) : podeResponder ? (
        <Cartao titulo="Responder"><p className="text-sm text-mudo">Clique no protocolo de um requerimento pendente para analisar, deferir ou indeferir.</p></Cartao>
      ) : null}
    </div>
  );
}
