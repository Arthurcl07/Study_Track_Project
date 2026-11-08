"use client";

// Ficha do estudante na secretaria (SPEC-031, SPEC-032, SPEC-033, SPEC-035): dados pessoais, situação no curso,
// troca de curso e abonos de faltas. As regras valem no servidor (RB-30, RB-31, RB-33); aqui só se mostra o
// resultado. O coordenador vê a ficha sem editar. Layout aprovado em docs/layout/prototipo.html#estudante-secretaria.
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { hojeEmBrasilia } from "@/domain/atividades";
import { MOTIVOS_ABONO, ROTULO_MOTIVO_ABONO, ROTULO_SITUACAO_CURSO, SITUACOES_CURSO, efeitoNasMatriculas, type SituacaoCurso } from "@/domain/secretaria";
import type { FichaConsultada } from "@/server/academico/secretaria";
import { SeloSituacaoCurso } from "./lista-estudantes";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, Cartao, ErroCampo, EstadoVazio, Mensagem, formatarDataCurta } from "./ui";

type Envio = { erro: string | null; erros: Record<string, string>; sucesso: string | null; enviando: boolean };
const inicial: Envio = { erro: null, erros: {}, sucesso: null, enviando: false };

// Envia JSON e devolve o retorno; erros de campo e mensagem ficam no estado do formulário.
function useEnvio() {
  const router = useRouter();
  const [estado, setEstado] = useState<Envio>(inicial);
  async function enviar(url: string, metodo: string, corpo: unknown, sucesso: (r: Record<string, unknown>) => string | null) {
    setEstado({ ...inicial, enviando: true });
    const resposta = await fetch(url, { method: metodo, headers: { "Content-Type": "application/json" }, body: corpo === undefined ? undefined : JSON.stringify(corpo) }).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    if (!resposta?.ok) {
      setEstado({ ...inicial, erro: retorno.erro ?? "Não foi possível salvar.", erros: retorno.campos ?? {} });
      return null;
    }
    setEstado({ ...inicial, sucesso: sucesso(retorno) });
    router.refresh();
    return retorno;
  }
  return { estado, setEstado, enviar };
}

function Campo({ nome, rotulo, tipo = "text", valor, erro, desabilitado, children }: { nome: string; rotulo: string; tipo?: string; valor?: string | null; erro?: string; desabilitado?: boolean; children?: ReactNode }) {
  return (
    <div>
      <label htmlFor={nome} className={CLASSE_ROTULO}>{rotulo}</label>
      {children ?? <input id={nome} name={nome} type={tipo} defaultValue={valor ?? ""} disabled={desabilitado} aria-invalid={Boolean(erro)} className={CLASSE_CAMPO} />}
      <ErroCampo mensagem={erro} />
    </div>
  );
}

function Rodape({ estado, texto }: { estado: Envio; texto: string }) {
  return (
    <>
      {estado.erro && Object.keys(estado.erros).length === 0 && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      {estado.sucesso && <Mensagem tipo="sucesso">{estado.sucesso}</Mensagem>}
      <button type="submit" disabled={estado.enviando} className={CLASSE_BOTAO_PRIMARIO}>{estado.enviando ? "Salvando..." : texto}</button>
    </>
  );
}

function DadosPessoais({ ficha, editavel }: { ficha: FichaConsultada; editavel: boolean }) {
  const { estado, enviar } = useEnvio();
  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    enviar(`/api/estudantes/${ficha.id}/ficha`, "PUT", Object.fromEntries(new FormData(evento.currentTarget)), () => "Ficha salva.");
  }
  const e = estado.erros;
  return (
    <Cartao titulo="Dados pessoais">
      <form onSubmit={salvar} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo nome="cpf" rotulo="CPF" valor={ficha.cpf} erro={e.cpf} desabilitado={!editavel} />
          <Campo nome="dataNascimento" rotulo="Data de nascimento" tipo="date" valor={ficha.dataNascimento} erro={e.dataNascimento} desabilitado={!editavel} />
          <Campo nome="telefone" rotulo="Telefone" tipo="tel" valor={ficha.telefone} erro={e.telefone} desabilitado={!editavel} />
          <Campo nome="email-leitura" rotulo="E-mail (muda em Contas)" valor={ficha.email} desabilitado />
          <Campo nome="responsavelNome" rotulo="Responsável" valor={ficha.responsavelNome} erro={e.responsavelNome} desabilitado={!editavel} />
          <Campo nome="responsavelTelefone" rotulo="Telefone do responsável" tipo="tel" valor={ficha.responsavelTelefone} erro={e.responsavelTelefone} desabilitado={!editavel} />
        </div>
        {editavel ? <Rodape estado={estado} texto="Salvar ficha" /> : <p className="text-sm text-mudo">Só a secretaria altera a ficha.</p>}
      </form>
    </Cartao>
  );
}

function SituacaoNoCurso({ ficha }: { ficha: FichaConsultada }) {
  const { estado, enviar } = useEnvio();
  const [nova, setNova] = useState<SituacaoCurso | "">("");
  const efeito = nova ? efeitoNasMatriculas(nova) : null;
  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(evento.currentTarget));
    if (!window.confirm(`Mudar a situação de ${ficha.nome} para ${nova ? ROTULO_SITUACAO_CURSO[nova] : "—"}?`)) return;
    enviar(`/api/estudantes/${ficha.id}/situacao`, "PUT", dados, (r) => `Situação alterada${Number(r.matriculasAlteradas) > 0 ? `: ${r.matriculasAlteradas} matrícula(s) ajustada(s)` : ""}.`);
  }
  const e = estado.erros;
  return (
    <form onSubmit={salvar} noValidate className="space-y-4">
      <Campo nome="situacao" rotulo="Nova situação" erro={e.situacao}>
        <select id="situacao" name="situacao" value={nova} onChange={(ev) => setNova(ev.target.value as SituacaoCurso)} className={CLASSE_CAMPO}>
          <option value="">Escolha...</option>
          {SITUACOES_CURSO.filter((s) => s !== ficha.situacaoCurso).map((s) => <option key={s} value={s}>{ROTULO_SITUACAO_CURSO[s]}</option>)}
        </select>
      </Campo>
      <Campo nome="data" rotulo="Data" tipo="date" valor={hojeEmBrasilia()} erro={e.data} />
      <Campo nome="motivo" rotulo="Motivo" erro={e.motivo} />
      {efeito && ficha.matriculasCursandoAbertas > 0 && (
        <Mensagem tipo="erro">
          {`As ${ficha.matriculasCursandoAbertas} matrícula(s) de período aberto ficarão ${efeito === "Trancada" ? "Trancadas" : "Canceladas"}: saem da chamada, das notas e dos relatórios e continuam no histórico.`}
        </Mensagem>
      )}
      <Rodape estado={estado} texto="Alterar situação" />
    </form>
  );
}

function TrocarCurso({ ficha }: { ficha: FichaConsultada }) {
  const { estado, enviar } = useEnvio();
  const bloqueado = ficha.situacaoCurso !== "Ativo" || ficha.matriculasCursandoAbertas > 0;
  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    enviar(`/api/estudantes/${ficha.id}/curso`, "PUT", Object.fromEntries(new FormData(evento.currentTarget)), () => "Curso trocado. O histórico anterior continua.");
  }
  return (
    <Cartao titulo="Curso">
      <form onSubmit={salvar} noValidate className="space-y-4">
        <p className="text-sm">Atual: <strong>{ficha.curso?.nome ?? "—"}</strong></p>
        <Campo nome="cursoId" rotulo="Trocar para" erro={estado.erros.cursoId}>
          <select id="cursoId" name="cursoId" defaultValue="" disabled={bloqueado} className={CLASSE_CAMPO}>
            <option value="">Escolha...</option>
            {ficha.cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Campo>
        <p className="text-sm text-mudo">
          {bloqueado ? "Só é possível com o estudante Ativo e sem matrícula cursando em período aberto." : "O histórico das turmas do curso atual continua."}
        </p>
        {!bloqueado && <Rodape estado={estado} texto="Trocar curso" />}
        {bloqueado && estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      </form>
    </Cartao>
  );
}

function Abonos({ ficha }: { ficha: FichaConsultada }) {
  const { estado, setEstado, enviar } = useEnvio();
  const [previa, setPrevia] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);

  async function prever(form: HTMLFormElement) {
    const dados = Object.fromEntries(new FormData(form));
    const resposta = await fetch(`/api/estudantes/${ficha.id}/abonos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...dados, previa: true }) }).catch(() => null);
    const r = resposta?.ok ? await resposta.json() : null;
    setPrevia(r ? `${r.faltas} falta(s) em ${r.turmas} turma(s) de período aberto serão abonadas.` : null);
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const retorno = await enviar(`/api/estudantes/${ficha.id}/abonos`, "POST", Object.fromEntries(new FormData(form)), (r) => `Abono registrado: ${r.faltas} falta(s) abonada(s). Frequência e situação recalculadas.`);
    if (retorno) {
      form.reset();
      setPrevia(null);
    }
  }

  async function excluir(id: string) {
    if (!window.confirm("Excluir este abono? As faltas voltam a contar na frequência.")) return;
    setExcluindo(id);
    await enviar(`/api/abonos/${id}`, "DELETE", undefined, () => "Abono excluído. A frequência foi recalculada.");
    setExcluindo(null);
  }

  const e = estado.erros;
  return (
    <Cartao titulo={`Abonos de faltas (${ficha.abonos.length})`}>
      {ficha.abonos.length === 0 ? (
        <EstadoVazio>Nenhum abono registrado.</EstadoVazio>
      ) : (
        <table className="tabela-responsiva w-full text-[15px]">
          <thead>
            <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
              <th className="pr-2 pb-2.5">Período</th>
              <th className="px-2 pb-2.5">Motivo</th>
              <th className="px-2 pb-2.5 text-right">Faltas abonadas</th>
              <th className="px-2 pb-2.5">Registrado por</th>
              <th className="pb-2.5 pl-2"><span className="sr-only">Ação</span></th>
            </tr>
          </thead>
          <tbody>
            {ficha.abonos.map((a) => (
              <tr key={a.id} className="border-t border-traco">
                <td data-rotulo="Período" className="py-3 pr-2">{formatarDataCurta(a.inicio)} a {formatarDataCurta(a.fim)}</td>
                <td data-rotulo="Motivo" className="px-2 py-3">{a.rotuloMotivo}{a.observacao && <span className="block text-sm text-mudo">{a.observacao}</span>}</td>
                <td data-rotulo="Faltas abonadas" className="px-2 py-3 text-right tabular-nums">{a.faltas}</td>
                <td data-rotulo="Registrado por" className="px-2 py-3">{a.autor}</td>
                <td data-rotulo="Ação" className="py-3 pl-2 text-right">
                  <button type="button" disabled={excluindo !== null} onClick={() => excluir(a.id)} className="font-medium text-risco hover:underline disabled:opacity-60">
                    {excluindo === a.id ? "Excluindo..." : "Excluir"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <form onSubmit={salvar} onChange={(ev) => { setPrevia(null); setEstado(inicial); void prever(ev.currentTarget); }} noValidate className="mt-5 space-y-4 border-t border-traco pt-4">
        <h3 className="font-semibold">Novo abono</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo nome="inicio" rotulo="De" tipo="date" erro={e.inicio} />
          <Campo nome="fim" rotulo="Até" tipo="date" erro={e.fim} />
          <Campo nome="motivo" rotulo="Motivo" erro={e.motivo}>
            <select id="motivo" name="motivo" defaultValue="AtestadoMedico" className={CLASSE_CAMPO}>
              {MOTIVOS_ABONO.map((m) => <option key={m} value={m}>{ROTULO_MOTIVO_ABONO[m]}</option>)}
            </select>
          </Campo>
          <Campo nome="observacao" rotulo="Observação" erro={e.observacao} />
        </div>
        {previa && <Mensagem tipo="info">{previa}</Mensagem>}
        <Rodape estado={estado} texto="Registrar abono" />
      </form>
    </Cartao>
  );
}

export function FichaEstudante({ ficha, editavel }: { ficha: FichaConsultada; editavel: boolean }) {
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-5">
        <DadosPessoais ficha={ficha} editavel={editavel} />
        {editavel && <Abonos ficha={ficha} />}
      </div>
      <div className="space-y-5">
        <Cartao titulo="Situação no curso">
          <p className="mb-4 flex flex-wrap items-center gap-2">
            <SeloSituacaoCurso situacao={ficha.situacaoCurso} />
            <span className="text-sm text-mudo">desde {formatarDataCurta(ficha.situacaoDesde)}{ficha.situacaoMotivo ? ` · ${ficha.situacaoMotivo}` : ""}</span>
          </p>
          {editavel ? <SituacaoNoCurso ficha={ficha} /> : <p className="text-sm text-mudo">Trancamento, transferência e conclusão são registrados pela secretaria.</p>}
        </Cartao>
        {editavel && <TrocarCurso ficha={ficha} />}
        {!editavel && <Cartao titulo="Curso"><p>{ficha.curso?.nome ?? "—"}</p></Cartao>}
      </div>
    </div>
  );
}
