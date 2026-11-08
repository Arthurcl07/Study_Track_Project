"use client";

// Telas da coordenação do Nível 3: matriz do curso (SPEC-037), horários e vagas da turma (SPEC-041, SPEC-038) e
// diários para homologar (SPEC-039). As regras valem no servidor; aqui só se mostra o que ele devolver.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DIAS_SEMANA, descreverHorario } from "@/domain/horarios";
import type { DisciplinaDaMatriz } from "@/domain/matriz";
import type { StatusDiario } from "@/domain/diario";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, Cartao, ErroCampo, EstadoVazio, Etiqueta, Mensagem } from "./ui";

async function chamar(url: string, metodo: string, corpo?: unknown) {
  const resposta = await fetch(url, { method: metodo, headers: { "Content-Type": "application/json" }, body: corpo === undefined ? undefined : JSON.stringify(corpo) }).catch(() => null);
  const dados = resposta ? await resposta.json().catch(() => ({})) : {};
  return { ok: Boolean(resposta?.ok), erro: (dados.erro as string | undefined) ?? "Não foi possível salvar.", erros: (dados.campos ?? {}) as Record<string, string> };
}

// ---------------------------------------------------------------- Matriz (SPEC-037)

export function EditorMatriz({ cursoId, matriz }: { cursoId: string; matriz: DisciplinaDaMatriz[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState<string | null>(null);
  const [erro, setErro] = useState<{ geral: string | null; campos: Record<string, string> }>({ geral: null, campos: {} });
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const nome = (id: string) => matriz.find((d) => d.disciplinaId === id)?.nome ?? "";
  const linha = matriz.find((d) => d.disciplinaId === editando);
  const horas = matriz.filter((d) => d.obrigatoria).reduce((s, d) => s + d.cargaHoraria, 0);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!linha) return;
    const form = new FormData(evento.currentTarget);
    setEnviando(true);
    setSucesso(null);
    const r = await chamar(`/api/cursos/${cursoId}/matriz/${linha.disciplinaId}`, "PUT", {
      semestre: form.get("semestre"),
      obrigatoria: form.get("obrigatoria") === "true",
      requisitos: form.getAll("requisitos"),
    });
    setEnviando(false);
    if (!r.ok) return setErro({ geral: r.erro, campos: r.erros });
    setErro({ geral: null, campos: {} });
    setSucesso(`${linha.nome} atualizada.`);
    setEditando(null);
    router.refresh();
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
      <Cartao titulo={`Matriz · ${matriz.length} disciplina(s) · ${horas} h obrigatórias`}>
        {sucesso && <div className="mb-3"><Mensagem tipo="sucesso">{sucesso}</Mensagem></div>}
        {matriz.length === 0 ? (
          <EstadoVazio>A grade do curso ainda não tem disciplinas.</EstadoVazio>
        ) : (
          <table className="tabela-responsiva w-full text-[15px]">
            <thead>
              <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                <th className="pr-2 pb-2.5">Semestre</th>
                <th className="px-2 pb-2.5">Disciplina</th>
                <th className="px-2 pb-2.5 text-right">CH</th>
                <th className="px-2 pb-2.5">Caráter</th>
                <th className="px-2 pb-2.5">Pré-requisitos</th>
                <th className="pb-2.5 pl-2"><span className="sr-only">Ação</span></th>
              </tr>
            </thead>
            <tbody>
              {matriz.map((d) => (
                <tr key={d.disciplinaId} className={`border-t border-traco ${d.disciplinaId === editando ? "bg-azul-suave" : ""}`}>
                  <td data-rotulo="Semestre" className="py-3 pr-2">{d.semestre ? `${d.semestre}º` : "—"}</td>
                  <td data-rotulo="Disciplina" className="px-2 py-3">{d.nome}</td>
                  <td data-rotulo="CH" className="px-2 py-3 text-right whitespace-nowrap tabular-nums">{d.cargaHoraria} h</td>
                  <td data-rotulo="Caráter" className="px-2 py-3"><Etiqueta>{d.obrigatoria ? "Obrigatória" : "Optativa"}</Etiqueta></td>
                  <td data-rotulo="Pré-requisitos" className="px-2 py-3 text-sm">{d.requisitos.length ? d.requisitos.map(nome).join(", ") : "—"}</td>
                  <td data-rotulo="Ação" className="py-3 pl-2 text-right">
                    <button type="button" onClick={() => { setEditando(d.disciplinaId); setErro({ geral: null, campos: {} }); setSucesso(null); }} className="font-medium text-azul hover:underline">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Cartao>
      <Cartao titulo={linha ? `Editar · ${linha.nome}` : "Editar disciplina da matriz"}>
        {!linha ? (
          <p className="text-sm text-mudo">Clique em Editar numa disciplina para definir o semestre, se é obrigatória e os pré-requisitos.</p>
        ) : (
          <form key={linha.disciplinaId} onSubmit={salvar} noValidate className="space-y-4">
            <div>
              <label htmlFor="mz-semestre" className={CLASSE_ROTULO}>Semestre sugerido</label>
              <select id="mz-semestre" name="semestre" defaultValue={linha.semestre ?? ""} className={CLASSE_CAMPO}>
                <option value="">Sem semestre</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => <option key={s} value={s}>{s}º</option>)}
              </select>
              <ErroCampo mensagem={erro.campos.semestre} />
            </div>
            <div>
              <label htmlFor="mz-carater" className={CLASSE_ROTULO}>Caráter</label>
              <select id="mz-carater" name="obrigatoria" defaultValue={String(linha.obrigatoria)} className={CLASSE_CAMPO}>
                <option value="true">Obrigatória</option>
                <option value="false">Optativa</option>
              </select>
            </div>
            <fieldset>
              <legend className={CLASSE_ROTULO}>Pré-requisitos</legend>
              <div className="mt-1 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-traco p-2">
                {matriz.filter((d) => d.disciplinaId !== linha.disciplinaId).map((d) => (
                  <label key={d.disciplinaId} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="requisitos" value={d.disciplinaId} defaultChecked={linha.requisitos.includes(d.disciplinaId)} className="h-4 w-4 accent-azul" />
                    {d.nome}
                  </label>
                ))}
              </div>
              <ErroCampo mensagem={erro.campos.requisitos} />
            </fieldset>
            {erro.geral && Object.keys(erro.campos).length === 0 && <Mensagem tipo="erro">{erro.geral}</Mensagem>}
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={enviando} className={CLASSE_BOTAO_PRIMARIO}>{enviando ? "Salvando..." : "Salvar"}</button>
              <button type="button" onClick={() => setEditando(null)} className={CLASSE_BOTAO_SECUNDARIO}>Cancelar</button>
            </div>
          </form>
        )}
      </Cartao>
    </div>
  );
}

// ---------------------------------------------------------------- Horários e vagas (SPEC-041, SPEC-038)

export type HorarioDaTurma = { id: string; diaSemana: number; inicio: string; fim: string; sala: { id: string; nome: string; capacidade: number } };

export function HorariosDaTurma({ turmaId, horarios, salas, vagas, cursando, editavel }: { turmaId: string; horarios: HorarioDaTurma[]; salas: { id: string; nome: string; capacidade: number }[]; vagas: number | null; cursando: number; editavel: boolean }) {
  const router = useRouter();
  const [erro, setErro] = useState<{ geral: string | null; campos: Record<string, string> }>({ geral: null, campos: {} });
  const [erroVagas, setErroVagas] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const menor = horarios.length ? Math.min(...horarios.map((h) => h.sala.capacidade)) : null;

  async function incluir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    setEnviando(true);
    setSucesso(null);
    const r = await chamar(`/api/turmas/${turmaId}/horarios`, "POST", Object.fromEntries(new FormData(form)));
    setEnviando(false);
    if (!r.ok) return setErro({ geral: r.erro, campos: r.erros });
    setErro({ geral: null, campos: {} });
    setSucesso("Horário incluído.");
    router.refresh();
  }

  async function excluir(h: HorarioDaTurma) {
    if (!window.confirm(`Excluir o horário de ${descreverHorario(h)}?`)) return;
    const r = await chamar(`/api/horarios/${h.id}`, "DELETE");
    if (!r.ok) return setErro({ geral: r.erro, campos: {} });
    router.refresh();
  }

  async function salvarVagas(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const r = await chamar(`/api/turmas/${turmaId}/vagas`, "PUT", { vagas: new FormData(evento.currentTarget).get("vagas") });
    if (!r.ok) return setErroVagas(r.erros.vagas ?? r.erro);
    setErroVagas(null);
    setSucesso("Vagas salvas.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Cartao titulo="Horários">
        {sucesso && <div className="mb-3"><Mensagem tipo="sucesso">{sucesso}</Mensagem></div>}
        {horarios.length === 0 ? (
          <p className="text-sm text-mudo">Nenhum horário cadastrado.</p>
        ) : (
          <ul className="space-y-1.5">
            {horarios.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>{descreverHorario(h)} · {h.sala.nome} ({h.sala.capacidade} lugares)</span>
                {editavel && <button type="button" onClick={() => excluir(h)} className="font-medium text-risco hover:underline">Excluir</button>}
              </li>
            ))}
          </ul>
        )}
        {editavel && (
          <form onSubmit={incluir} noValidate className="mt-4 space-y-3 border-t border-traco pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="h-dia" className={CLASSE_ROTULO}>Dia</label>
                <select id="h-dia" name="diaSemana" defaultValue="1" className={CLASSE_CAMPO}>{[1, 2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{DIAS_SEMANA[d]}</option>)}</select>
              </div>
              <div>
                <label htmlFor="h-sala" className={CLASSE_ROTULO}>Sala</label>
                <select id="h-sala" name="salaId" defaultValue="" className={CLASSE_CAMPO}>
                  <option value="">Escolha...</option>
                  {salas.map((s) => <option key={s.id} value={s.id}>{s.nome} ({s.capacidade})</option>)}
                </select>
                <ErroCampo mensagem={erro.campos.salaId} />
              </div>
              <div>
                <label htmlFor="h-inicio" className={CLASSE_ROTULO}>Início</label>
                <input id="h-inicio" name="inicio" type="time" defaultValue="19:00" className={CLASSE_CAMPO} />
                <ErroCampo mensagem={erro.campos.inicio} />
              </div>
              <div>
                <label htmlFor="h-fim" className={CLASSE_ROTULO}>Fim</label>
                <input id="h-fim" name="fim" type="time" defaultValue="20:40" className={CLASSE_CAMPO} />
                <ErroCampo mensagem={erro.campos.fim} />
              </div>
            </div>
            {erro.geral && Object.keys(erro.campos).length === 0 && <Mensagem tipo="erro">{erro.geral}</Mensagem>}
            <button type="submit" disabled={enviando} className={CLASSE_BOTAO_SECUNDARIO}>{enviando ? "Salvando..." : "Incluir horário"}</button>
            {salas.length === 0 && <p className="text-sm text-mudo">Nenhuma sala cadastrada: peça à secretaria.</p>}
          </form>
        )}
      </Cartao>
      <Cartao titulo="Vagas">
        <form onSubmit={salvarVagas} noValidate className="space-y-3">
          <div>
            <label htmlFor="vagas" className={CLASSE_ROTULO}>Vagas da turma (vazio = sem limite)</label>
            <input id="vagas" name="vagas" inputMode="numeric" defaultValue={vagas ?? ""} disabled={!editavel} className={CLASSE_CAMPO} />
            <ErroCampo mensagem={erroVagas ?? undefined} />
          </div>
          <p className="text-sm text-mudo">{cursando} cursando{menor !== null ? ` · máximo ${menor} (menor sala da turma)` : ""}. As vagas valem na rematrícula pelo estudante.</p>
          {editavel && <button type="submit" className={CLASSE_BOTAO_SECUNDARIO}>Salvar vagas</button>}
        </form>
      </Cartao>
    </div>
  );
}

// ---------------------------------------------------------------- Diários (SPEC-039)

export type DiarioDaLista = { id: string; rotulo: string; curso: string; professor: string; diario: StatusDiario; fechadoEm: string | null; homologadoEm: string | null; observacao: string | null };

const dataCurta = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—");

export function DiariosParaHomologar({ diarios }: { diarios: DiarioDaLista[] }) {
  const router = useRouter();
  const [devolvendo, setDevolvendo] = useState<DiarioDaLista | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const fechados = diarios.filter((d) => d.diario === "Fechado");
  const homologados = diarios.filter((d) => d.diario === "Homologado");
  const abertos = diarios.filter((d) => d.diario === "Aberto");

  async function acao(d: DiarioDaLista, acao: "homologar" | "devolver" | "reabrir", observacao?: string) {
    if (acao === "homologar" && !window.confirm(`Homologar o diário da ${d.rotulo}? A turma fica somente leitura.`)) return;
    if (acao === "reabrir" && !window.confirm(`Reabrir o diário da ${d.rotulo}? A turma volta a aceitar lançamentos.`)) return;
    setEnviando(true);
    setErro(null);
    setSucesso(null);
    const r = await chamar(`/api/turmas/${d.id}/diario`, "POST", { acao, observacao });
    setEnviando(false);
    if (!r.ok) return setErro(r.erros.observacao ?? r.erro);
    setSucesso({ homologar: "Diário homologado.", devolver: "Diário devolvido ao professor.", reabrir: "Diário reaberto." }[acao]);
    setDevolvendo(null);
    router.refresh();
  }

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-5">
        <Cartao titulo={`Para homologar (${fechados.length})`}>
          {erro && <div className="mb-3"><Mensagem tipo="erro">{erro}</Mensagem></div>}
          {sucesso && <div className="mb-3"><Mensagem tipo="sucesso">{sucesso}</Mensagem></div>}
          {fechados.length === 0 ? (
            <EstadoVazio>Nenhum diário fechado esperando homologação.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pr-2 pb-2.5">Turma</th>
                  <th className="px-2 pb-2.5">Professor</th>
                  <th className="px-2 pb-2.5">Fechado em</th>
                  <th className="pb-2.5 pl-2"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {fechados.map((d) => (
                  <tr key={d.id} className="border-t border-traco">
                    <td data-rotulo="Turma" className="py-3 pr-2">{d.rotulo}<span className="block text-xs text-mudo">{d.curso}</span></td>
                    <td data-rotulo="Professor" className="px-2 py-3">{d.professor}</td>
                    <td data-rotulo="Fechado em" className="px-2 py-3 tabular-nums">{dataCurta(d.fechadoEm)}</td>
                    <td data-rotulo="Ações" className="py-3 pl-2">
                      <span className="flex flex-wrap justify-end gap-2">
                        <button type="button" disabled={enviando} onClick={() => acao(d, "homologar")} className={CLASSE_BOTAO_PRIMARIO}>Homologar</button>
                        <button type="button" disabled={enviando} onClick={() => setDevolvendo(d)} className={CLASSE_BOTAO_SECUNDARIO}>Devolver</button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
        <Cartao titulo={`Homologados (${homologados.length})`}>
          {homologados.length === 0 ? <p className="text-sm text-mudo">Nenhum diário homologado ainda.</p> : (
            <ul className="space-y-2 text-sm">
              {homologados.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>{d.rotulo} · homologado em {dataCurta(d.homologadoEm)}</span>
                  <button type="button" disabled={enviando} onClick={() => acao(d, "reabrir")} className="font-medium text-azul hover:underline">Reabrir</button>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
        <p className="text-sm text-mudo">{abertos.length} turma(s) com o diário ainda aberto pelo professor.</p>
      </div>
      <Cartao titulo={devolvendo ? `Devolver · ${devolvendo.rotulo}` : "Devolver diário"}>
        {!devolvendo ? (
          <p className="text-sm text-mudo">Use Devolver quando o diário precisar de correção: o professor recebe a observação e a turma volta a aceitar lançamentos.</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); acao(devolvendo, "devolver", String(new FormData(e.currentTarget).get("observacao") ?? "")); }} className="space-y-3">
            <label htmlFor="obs" className={CLASSE_ROTULO}>Observação para o professor</label>
            <textarea id="obs" name="observacao" rows={4} maxLength={500} className={CLASSE_CAMPO} />
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={enviando} className={`${CLASSE_BOTAO_SECUNDARIO} text-risco`}>Devolver ao professor</button>
              <button type="button" onClick={() => setDevolvendo(null)} className="text-sm font-medium text-mudo hover:underline">Cancelar</button>
            </div>
          </form>
        )}
      </Cartao>
    </div>
  );
}

// ---------------------------------------------------------------- Diário no dashboard da turma (professor)

export function DiarioDoProfessor({ turmaId, status, pendencias, observacao, semAvaliacao }: { turmaId: string; status: StatusDiario; pendencias: string[]; observacao: string | null; semAvaliacao: boolean }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function fechar() {
    if (!window.confirm("Fechar o diário? A turma fica somente leitura até a coordenação homologar ou devolver.")) return;
    setEnviando(true);
    const r = await chamar(`/api/turmas/${turmaId}/diario`, "POST", { acao: "fechar" });
    setEnviando(false);
    if (!r.ok) return setErro(r.erro);
    setErro(null);
    router.refresh();
  }

  const rotulo = { Aberto: "Aberto", Fechado: "Fechado · aguardando homologação", Homologado: "Homologado" }[status];
  const cor = { Aberto: "bg-info-fundo text-info", Fechado: "bg-atencao-fundo text-atencao", Homologado: "bg-normal-fundo text-normal" }[status];
  return (
    <Cartao titulo="Diário de classe">
      <p className="mb-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${cor}`}>{rotulo}</span></p>
      {observacao && status === "Aberto" && <div className="mb-3"><Mensagem tipo="erro">Devolvido pela coordenação: {observacao}</Mensagem></div>}
      {status === "Aberto" && (
        <>
          {semAvaliacao ? (
            <p className="mb-3 text-sm text-mudo">Cadastre e lance as avaliações antes de fechar o diário.</p>
          ) : pendencias.length > 0 ? (
            <div className="mb-3"><Mensagem tipo="info">Faltam notas para fechar: {pendencias.join("; ")}.</Mensagem></div>
          ) : (
            <p className="mb-3 text-sm text-normal">Todas as notas lançadas: o diário pode ser fechado.</p>
          )}
          {erro && <div className="mb-3"><Mensagem tipo="erro">{erro}</Mensagem></div>}
          <button type="button" disabled={enviando || pendencias.length > 0 || semAvaliacao} onClick={fechar} className={`w-full ${CLASSE_BOTAO_PRIMARIO}`}>{enviando ? "Fechando..." : "Fechar diário"}</button>
        </>
      )}
      <p className="mt-3 text-xs text-mudo">Depois de fechado, a turma fica somente leitura até a coordenação homologar ou devolver.</p>
    </Cartao>
  );
}
