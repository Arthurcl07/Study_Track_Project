"use client";

// Virada de semestre (SPEC-030, RF-38): prévia por turma e cópia das marcadas, com a opção de levar os estudantes
// ativos. As regras (destino aberto, sem duplicar, professor ativo) valem no servidor. Layout em
// docs/layout/prototipo.html#virada-semestre.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, Cartao, ErroCampo, EstadoVazio, Mensagem } from "./ui";

type TurmaPrevia = { id: string; nome: string; disciplina: string; curso: string; professor: string; estudantes: number; estudantesAtivos: number; acao: "copiar" | "ja-existe" | "professor-desativado" };
type Resumo = { origem: string; destino: string; criadas: { nome: string; curso: string; matriculas: number }[]; puladas: { nome: string; motivo: string }[]; matriculas: number };

const MOTIVO: Record<TurmaPrevia["acao"], string> = { copiar: "", "ja-existe": "Já existe no destino: será pulada", "professor-desativado": "Professor desativado: não será copiada" };

export function ViradaSemestre({ periodos }: { periodos: { nome: string; status: "Aberto" | "Encerrado" }[] }) {
  const router = useRouter();
  const abertos = periodos.filter((p) => p.status === "Aberto");
  const [origem, setOrigem] = useState(periodos.find((p) => p.status === "Encerrado")?.nome ?? periodos[0]?.nome ?? "");
  const [destino, setDestino] = useState(abertos.find((p) => p.nome > origem)?.nome ?? abertos[0]?.nome ?? "");
  const [turmas, setTurmas] = useState<TurmaPrevia[] | null>(null);
  const [marcadas, setMarcadas] = useState<Record<string, boolean>>({});
  const [levar, setLevar] = useState<Record<string, boolean>>({});
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function verPrevia() {
    setErro(null);
    setErros({});
    setResumo(null);
    const resposta = await fetch(`/api/virada?origem=${encodeURIComponent(origem)}&destino=${encodeURIComponent(destino)}`).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    if (!resposta?.ok) {
      setTurmas(null);
      setErros(retorno.campos ?? {});
      setErro(retorno.erro ?? "Não foi possível montar a prévia.");
      return;
    }
    const lista = retorno.turmas as TurmaPrevia[];
    setTurmas(lista);
    setMarcadas(Object.fromEntries(lista.map((t) => [t.id, t.acao === "copiar"])));
    setLevar({});
  }

  async function copiar() {
    const escolhidas = (turmas ?? []).filter((t) => marcadas[t.id] && t.acao === "copiar");
    if (!window.confirm(`Copiar ${escolhidas.length} turma(s) de ${origem} para ${destino}?`)) return;
    setEnviando(true);
    setErro(null);
    const resposta = await fetch("/api/virada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origem, destino, turmas: escolhidas.map((t) => ({ id: t.id, levarEstudantes: Boolean(levar[t.id]) })) }),
    }).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!resposta?.ok) {
      setErro(retorno.campos?.turmas ?? retorno.erro ?? "Não foi possível copiar as turmas.");
      return;
    }
    setResumo(retorno);
    setTurmas(null);
    router.refresh();
  }

  const porCurso = [...new Set((turmas ?? []).map((t) => t.curso))];
  const escolhidas = (turmas ?? []).filter((t) => marcadas[t.id] && t.acao === "copiar");
  const matriculas = escolhidas.reduce((s, t) => s + (levar[t.id] ? t.estudantesAtivos : 0), 0);

  return (
    <div className="space-y-5">
      <Cartao>
        <div className="grid items-end gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="origem" className={CLASSE_ROTULO}>Copiar de</label>
            <select id="origem" value={origem} onChange={(e) => { setOrigem(e.target.value); setTurmas(null); }} className={CLASSE_CAMPO}>
              {periodos.map((p) => <option key={p.nome} value={p.nome}>{p.nome}{p.status === "Encerrado" ? " (encerrado)" : ""}</option>)}
            </select>
            <ErroCampo mensagem={erros.origem} />
          </div>
          <div>
            <label htmlFor="destino" className={CLASSE_ROTULO}>Para (período aberto)</label>
            <select id="destino" value={destino} onChange={(e) => { setDestino(e.target.value); setTurmas(null); }} className={CLASSE_CAMPO}>
              {abertos.map((p) => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
            </select>
            <ErroCampo mensagem={erros.destino} />
          </div>
          <button type="button" onClick={verPrevia} className={CLASSE_BOTAO_SECUNDARIO}>Ver prévia</button>
        </div>
        {abertos.length === 0 && <p className="mt-3 text-sm text-mudo">Crie e deixe aberto o período de destino em Períodos letivos.</p>}
      </Cartao>

      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {resumo && (
        <Mensagem tipo="sucesso">
          {`${resumo.criadas.length} turma(s) criada(s) em ${resumo.destino}, com ${resumo.matriculas} matrícula(s).`}
          {resumo.puladas.length > 0 && ` Puladas: ${resumo.puladas.map((p) => `${p.nome} (${p.motivo})`).join("; ")}.`}
        </Mensagem>
      )}

      {turmas && turmas.length === 0 && <EstadoVazio>O período {origem} não tem turmas.</EstadoVazio>}
      {porCurso.map((curso) => {
        const doCurso = (turmas ?? []).filter((t) => t.curso === curso);
        return (
          <Cartao key={curso} titulo={`${curso} · ${doCurso.length} turma(s)`}>
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pr-2 pb-2.5"><span className="sr-only">Copiar</span></th>
                  <th className="px-2 pb-2.5">Turma</th>
                  <th className="px-2 pb-2.5">Professor</th>
                  <th className="px-2 pb-2.5 text-right">Estudantes</th>
                  <th className="px-2 pb-2.5">Levar os estudantes</th>
                  <th className="pb-2.5 pl-2">O que acontece</th>
                </tr>
              </thead>
              <tbody>
                {doCurso.map((t) => {
                  const pode = t.acao === "copiar";
                  return (
                    <tr key={t.id} className="border-t border-traco">
                      <td data-rotulo="Copiar" className="py-3 pr-2">
                        <input type="checkbox" aria-label={`Copiar ${t.nome}`} disabled={!pode} checked={Boolean(marcadas[t.id])} onChange={(e) => setMarcadas((m) => ({ ...m, [t.id]: e.target.checked }))} className="h-5 w-5 accent-azul" />
                      </td>
                      <td data-rotulo="Turma" className="px-2 py-3">{t.nome} · {t.disciplina}</td>
                      <td data-rotulo="Professor" className="px-2 py-3">{t.professor}</td>
                      <td data-rotulo="Estudantes" className="px-2 py-3 text-right tabular-nums">{t.estudantes}</td>
                      <td data-rotulo="Levar os estudantes" className="px-2 py-3">
                        <input type="checkbox" aria-label={`Levar os estudantes de ${t.nome}`} disabled={!pode || !marcadas[t.id]} checked={Boolean(levar[t.id])} onChange={(e) => setLevar((m) => ({ ...m, [t.id]: e.target.checked }))} className="h-5 w-5 accent-azul" />
                      </td>
                      <td data-rotulo="O que acontece" className={`py-3 pl-2 text-sm ${pode ? "text-normal" : "text-mudo"}`}>
                        {pode
                          ? levar[t.id]
                            ? `Será copiada com ${t.estudantesAtivos} estudante(s)${t.estudantes > t.estudantesAtivos ? ` (${t.estudantes - t.estudantesAtivos} não ativo(s) ficam de fora)` : ""}`
                            : "Será copiada sem estudantes"
                          : MOTIVO[t.acao]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Cartao>
        );
      })}
      {turmas && turmas.length > 0 && (
        <Cartao>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm">{escolhidas.length} turma(s) marcada(s) · {matriculas} matrícula(s) serão criadas</span>
            <button type="button" disabled={enviando || escolhidas.length === 0} onClick={copiar} className={CLASSE_BOTAO_PRIMARIO}>
              {enviando ? "Copiando..." : `Copiar turmas para ${destino}`}
            </button>
          </div>
        </Cartao>
      )}
    </div>
  );
}
