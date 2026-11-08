"use client";

// Telas da secretaria do Nível 3: eventos do calendário (SPEC-040), salas (SPEC-041) e janela de rematrícula
// (SPEC-038). As regras valem no servidor; aqui só se mostra o que ele devolver.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ROTULO_EVENTO, TIPOS_EVENTO, type TipoEvento } from "@/domain/calendario";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, Cartao, ErroCampo, EstadoVazio, Etiqueta, Mensagem, formatarDataCurta } from "./ui";

type Retorno = { erro: string | null; erros: Record<string, string>; sucesso: string | null };
const VAZIO: Retorno = { erro: null, erros: {}, sucesso: null };

function useEnviar() {
  const router = useRouter();
  const [retorno, setRetorno] = useState<Retorno>(VAZIO);
  const [enviando, setEnviando] = useState(false);
  async function enviar(url: string, metodo: string, corpo: unknown, sucesso: string) {
    setEnviando(true);
    setRetorno(VAZIO);
    const resposta = await fetch(url, { method: metodo, headers: { "Content-Type": "application/json" }, body: corpo === undefined ? undefined : JSON.stringify(corpo) }).catch(() => null);
    const dados = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!resposta?.ok) {
      setRetorno({ erro: dados.erro ?? "Não foi possível salvar.", erros: dados.campos ?? {}, sucesso: null });
      return false;
    }
    setRetorno({ ...VAZIO, sucesso });
    router.refresh();
    return true;
  }
  return { retorno, enviando, enviar };
}

function Campo({ id, rotulo, erro, children }: { id: string; rotulo: string; erro?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={CLASSE_ROTULO}>{rotulo}</label>
      {children}
      <ErroCampo mensagem={erro} />
    </div>
  );
}

export type EventoDaLista = { id: string; periodo: string; tipo: TipoEvento; titulo: string; inicio: string; fim: string };

// SPEC-040 (UC-37): cadastrar, editar e excluir eventos do período.
export function EventosCalendario({ eventos, periodos, periodo }: { eventos: EventoDaLista[]; periodos: string[]; periodo: string }) {
  const router = useRouter();
  const { retorno, enviando, enviar } = useEnviar();
  const [editando, setEditando] = useState<EventoDaLista | null>(null);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const dados = Object.fromEntries(new FormData(form));
    const ok = editando ? await enviar(`/api/calendario/${editando.id}`, "PATCH", dados, "Evento alterado.") : await enviar("/api/calendario", "POST", dados, "Evento cadastrado.");
    if (ok) {
      form.reset();
      setEditando(null);
    }
  }

  async function excluir(e: EventoDaLista) {
    if (!window.confirm(`Excluir "${e.titulo}"?`)) return;
    await enviar(`/api/calendario/${e.id}`, "DELETE", undefined, "Evento excluído.");
  }

  const r = retorno.erros;
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
      <Cartao
        titulo={`${periodo} · eventos (${eventos.length})`}
        acao={
          <select aria-label="Período" value={periodo} onChange={(e) => router.push(`/admin/calendario?periodo=${encodeURIComponent(e.target.value)}`)} className={`${CLASSE_CAMPO} mt-0 w-36`}>
            {periodos.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        }
      >
        {eventos.length === 0 ? (
          <EstadoVazio>Nenhum evento neste período.</EstadoVazio>
        ) : (
          <table className="tabela-responsiva w-full text-[15px]">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                <th className="pr-2 pb-2.5">Datas</th>
                <th className="px-2 pb-2.5">Tipo</th>
                <th className="px-2 pb-2.5">Título</th>
                <th className="pb-2.5 pl-2"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((e) => (
                <tr key={e.id} className="border-t border-traco">
                  <td data-rotulo="Datas" className="py-3 pr-2 tabular-nums">{formatarDataCurta(e.inicio)}{e.fim !== e.inicio ? ` a ${formatarDataCurta(e.fim)}` : ""}</td>
                  <td data-rotulo="Tipo" className="px-2 py-3"><Etiqueta>{ROTULO_EVENTO[e.tipo]}</Etiqueta></td>
                  <td data-rotulo="Título" className="px-2 py-3">{e.titulo}</td>
                  <td data-rotulo="Ações" className="py-3 pl-2 text-right">
                    <span className="inline-flex gap-3 text-sm">
                      <button type="button" onClick={() => setEditando(e)} className="font-medium text-azul hover:underline">Editar</button>
                      <button type="button" onClick={() => excluir(e)} className="font-medium text-risco hover:underline">Excluir</button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Cartao>
      <Cartao titulo={editando ? `Editar · ${editando.titulo}` : "Novo evento"}>
        <form key={editando?.id ?? "novo"} onSubmit={salvar} noValidate className="space-y-4">
          <Campo id="ev-periodo" rotulo="Período" erro={r.periodo}>
            <select id="ev-periodo" name="periodo" defaultValue={editando?.periodo ?? periodo} className={CLASSE_CAMPO}>{periodos.map((p) => <option key={p}>{p}</option>)}</select>
          </Campo>
          <Campo id="ev-tipo" rotulo="Tipo" erro={r.tipo}>
            <select id="ev-tipo" name="tipo" defaultValue={editando?.tipo ?? "Feriado"} className={CLASSE_CAMPO}>{TIPOS_EVENTO.map((t) => <option key={t} value={t}>{ROTULO_EVENTO[t]}</option>)}</select>
          </Campo>
          <Campo id="ev-titulo" rotulo="Título" erro={r.titulo}><input id="ev-titulo" name="titulo" defaultValue={editando?.titulo ?? ""} className={CLASSE_CAMPO} /></Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="ev-inicio" rotulo="De" erro={r.inicio}><input id="ev-inicio" name="inicio" type="date" defaultValue={editando?.inicio ?? ""} className={CLASSE_CAMPO} /></Campo>
            <Campo id="ev-fim" rotulo="Até (vazio = mesmo dia)" erro={r.fim}><input id="ev-fim" name="fim" type="date" defaultValue={editando?.fim ?? ""} className={CLASSE_CAMPO} /></Campo>
          </div>
          <p className="text-sm text-mudo">Feriado e recesso bloqueiam a chamada; início e fim das aulas limitam as datas de aula.</p>
          {retorno.erro && Object.keys(r).length === 0 && <Mensagem tipo="erro">{retorno.erro}</Mensagem>}
          {retorno.sucesso && <Mensagem tipo="sucesso">{retorno.sucesso}</Mensagem>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={enviando} className={CLASSE_BOTAO_PRIMARIO}>{enviando ? "Salvando..." : editando ? "Salvar" : "Cadastrar evento"}</button>
            {editando && <button type="button" onClick={() => setEditando(null)} className={CLASSE_BOTAO_SECUNDARIO}>Cancelar</button>}
          </div>
        </form>
      </Cartao>
    </div>
  );
}

export type SalaDaLista = { id: string; nome: string; capacidade: number; horarios: number };

// SPEC-041 (UC-38): salas; a capacidade limita as vagas das turmas.
export function GestaoSalas({ salas }: { salas: SalaDaLista[] }) {
  const { retorno, enviando, enviar } = useEnviar();
  const [editando, setEditando] = useState<SalaDaLista | null>(null);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const dados = Object.fromEntries(new FormData(form));
    const ok = editando ? await enviar(`/api/salas/${editando.id}`, "PATCH", dados, "Sala alterada.") : await enviar("/api/salas", "POST", dados, "Sala cadastrada.");
    if (ok) {
      form.reset();
      setEditando(null);
    }
  }

  const r = retorno.erros;
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
      <Cartao titulo={`Salas (${salas.length})`}>
        {salas.length === 0 ? (
          <EstadoVazio>Nenhuma sala cadastrada.</EstadoVazio>
        ) : (
          <table className="tabela-responsiva w-full text-[15px]">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                <th className="pr-2 pb-2.5">Sala</th>
                <th className="px-2 pb-2.5 text-right">Capacidade</th>
                <th className="px-2 pb-2.5 text-right">Horários</th>
                <th className="pb-2.5 pl-2"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {salas.map((s) => (
                <tr key={s.id} className="border-t border-traco">
                  <td data-rotulo="Sala" className="py-3 pr-2 font-medium">{s.nome}</td>
                  <td data-rotulo="Capacidade" className="px-2 py-3 text-right tabular-nums">{s.capacidade}</td>
                  <td data-rotulo="Horários" className="px-2 py-3 text-right tabular-nums">{s.horarios}</td>
                  <td data-rotulo="Ações" className="py-3 pl-2 text-right">
                    <span className="inline-flex gap-3 text-sm">
                      <button type="button" onClick={() => setEditando(s)} className="font-medium text-azul hover:underline">Editar</button>
                      <button type="button" disabled={s.horarios > 0} title={s.horarios > 0 ? "Sala em uso" : undefined} onClick={() => window.confirm(`Excluir ${s.nome}?`) && enviar(`/api/salas/${s.id}`, "DELETE", undefined, "Sala excluída.")} className="font-medium text-risco hover:underline disabled:opacity-40">Excluir</button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Cartao>
      <Cartao titulo={editando ? `Editar · ${editando.nome}` : "Nova sala"}>
        <form key={editando?.id ?? "nova"} onSubmit={salvar} noValidate className="space-y-4">
          <Campo id="sala-nome" rotulo="Nome" erro={r.nome}><input id="sala-nome" name="nome" defaultValue={editando?.nome ?? ""} className={CLASSE_CAMPO} /></Campo>
          <Campo id="sala-cap" rotulo="Capacidade" erro={r.capacidade}><input id="sala-cap" name="capacidade" inputMode="numeric" defaultValue={editando?.capacidade ?? ""} className={CLASSE_CAMPO} /></Campo>
          {retorno.erro && Object.keys(r).length === 0 && <Mensagem tipo="erro">{retorno.erro}</Mensagem>}
          {retorno.sucesso && <Mensagem tipo="sucesso">{retorno.sucesso}</Mensagem>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={enviando} className={CLASSE_BOTAO_PRIMARIO}>{enviando ? "Salvando..." : editando ? "Salvar" : "Cadastrar sala"}</button>
            {editando && <button type="button" onClick={() => setEditando(null)} className={CLASSE_BOTAO_SECUNDARIO}>Cancelar</button>}
          </div>
        </form>
      </Cartao>
    </div>
  );
}

// SPEC-038: janela de rematrícula de um período aberto (na página Períodos letivos).
export function JanelaRematricula({ periodoId, nome, inicio, fim }: { periodoId: string; nome: string; inicio: string | null; fim: string | null }) {
  const { retorno, enviando, enviar } = useEnviar();
  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    await enviar(`/api/periodos/${periodoId}/rematricula`, "PUT", Object.fromEntries(new FormData(evento.currentTarget)), "Janela de rematrícula salva.");
  }
  return (
    <form onSubmit={salvar} noValidate className="space-y-3 border-t border-traco pt-3 first:border-t-0 first:pt-0">
      <p className="font-semibold">{nome}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo id={`rem-ini-${periodoId}`} rotulo="Início" erro={retorno.erros.inicio}><input id={`rem-ini-${periodoId}`} name="inicio" type="date" defaultValue={inicio ?? ""} className={CLASSE_CAMPO} /></Campo>
        <Campo id={`rem-fim-${periodoId}`} rotulo="Fim" erro={retorno.erros.fim}><input id={`rem-fim-${periodoId}`} name="fim" type="date" defaultValue={fim ?? ""} className={CLASSE_CAMPO} /></Campo>
      </div>
      {retorno.erro && Object.keys(retorno.erros).length === 0 && <Mensagem tipo="erro">{retorno.erro}</Mensagem>}
      {retorno.sucesso && <Mensagem tipo="sucesso">{retorno.sucesso}</Mensagem>}
      <button type="submit" disabled={enviando} className={CLASSE_BOTAO_SECUNDARIO}>{enviando ? "Salvando..." : "Salvar janela"}</button>
    </form>
  );
}
