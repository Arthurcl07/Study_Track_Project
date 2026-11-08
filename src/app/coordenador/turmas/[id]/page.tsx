import Link from "next/link";
import { notFound } from "next/navigation";
import { Casca } from "@/components/casca";
import { FormularioApi } from "@/components/formulario-api";
import { CorrigirCadastro } from "@/components/corrigir-cadastro";
import { HorariosDaTurma } from "@/components/coordenacao-n3";
import { ImportacaoPlanilha } from "@/components/importacao-planilha";
import { TirarDaTurma } from "@/components/tirar-da-turma";
import { CabecalhoPagina, Cartao, CLASSE_LINK, EstadoVazio, Mensagem } from "@/components/ui";
import { mensagemPeriodoEncerrado } from "@/domain/periodos";
import { RECURSOS } from "@/domain/autorizacao";
import { motivoParaExcluirTurmaDoCoordenador } from "@/server/academico/correcoes";
import { horariosDaTurma, listarSalas } from "@/server/academico/horarios";
import { exigirAcessoPagina } from "@/server/auth/guardas";
import { buscarTurmaDoEscopo, listarProfessores } from "@/server/dados/estrutura";

// SPEC-002 / RF-03: estudantes da turma, cadastro de estudante e matrícula de estudante existente.
// SPEC-010 / RF-17: troca do professor responsável (só professores ativos aparecem).
// SPEC-021 (RF-30): importação de estudantes por planilha CSV, com prévia e tudo ou nada.
// SPEC-020 (RF-29): links para o boletim do período da turma e o histórico de cada estudante.
// SPEC-017 (RB-20): turma de período encerrado é somente leitura; os formulários não aparecem.
// Layout aprovado em docs/layout/prototipo.html#coordenador-turma e #cadastro-erro.
// SPEC-026/031/033: editar e excluir turma, tirar da turma quem foi matriculado por engano, número de matrícula e
// situação da matrícula (Trancada/Cancelada) (#correcao-turma).
export default async function DetalheTurma({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await exigirAcessoPagina(RECURSOS.cadastroAcademico);
  const { id } = await params;
  const turma = await buscarTurmaDoEscopo(sessao, id);
  if (!turma) notFound();
  const estudantes = turma.estudantes ?? [];
  const outrosProfessores = (await listarProfessores()).filter((p) => p.id !== turma.professor.id);
  const encerrada = turma.periodoLetivo.status === "Encerrado";
  const motivoExclusao = encerrada ? null : await motivoParaExcluirTurmaDoCoordenador(sessao.usuarioId, turma.id);
  // SPEC-041 / SPEC-038: horários, salas e vagas.
  const [horarios, salas] = await Promise.all([horariosDaTurma(turma.id), listarSalas()]);
  const cursando = estudantes.filter((e) => e.situacao === "Cursando").length;
  const SELO_MATRICULA = {
    Cursando: "bg-normal-fundo text-normal",
    Trancada: "bg-slate-200 text-slate-600",
    Cancelada: "bg-risco-fundo text-risco",
  } as const;
  const ROTULO_MATRICULA = { Cursando: "● Cursando", Trancada: "⏸ Trancada", Cancelada: "✕ Cancelada" } as const;
  return (
    <Casca sessao={sessao} ativo="turmas">
      <CabecalhoPagina
        titulo={`${turma.nome} · ${turma.disciplina.nome}`}
        subtitulo={`${turma.curso.nome} · Período ${turma.periodo} · Professor: ${turma.professor.nome}`}
        voltar={{ href: "/coordenador/turmas", rotulo: "Turmas e estudantes" }}
      />
      <div className="grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Cartao titulo={`Estudantes (${estudantes.length})`}>
          {estudantes.length === 0 ? (
            <EstadoVazio>Nenhum estudante matriculado. Cadastre ou matricule ao lado.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              <thead>
                <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
                  <th className="pb-2.5">Nome</th>
                  <th className="pb-2.5">Matrícula</th>
                  <th className="pb-2.5">Situação</th>
                  <th className="pb-2.5">Documentos</th>
                  <th className="pb-2.5"><span className="sr-only">Ação</span></th>
                </tr>
              </thead>
              <tbody>
                {estudantes.map((e) => (
                  <tr key={e.id} className="border-t border-traco">
                    <td data-rotulo="Nome" className="py-3 pr-2">{e.nome}<span className="block text-sm break-all text-mudo">{e.email}</span></td>
                    <td data-rotulo="Matrícula" className="py-3 pr-2 tabular-nums">{e.matricula ?? "—"}</td>
                    <td data-rotulo="Situação" className="py-3 pr-2">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap ${SELO_MATRICULA[e.situacao]}`}>{ROTULO_MATRICULA[e.situacao]}</span>
                    </td>
                    <td data-rotulo="Documentos" className="py-3 text-sm whitespace-nowrap">
                      <Link href={`/documentos/boletim?estudante=${e.id}&periodo=${encodeURIComponent(turma.periodo)}`} className={CLASSE_LINK}>Boletim</Link>
                      {" · "}
                      <Link href={`/documentos/historico?estudante=${e.id}`} className={CLASSE_LINK}>Histórico</Link>
                    </td>
                    <td data-rotulo="Ação" className="py-3 pl-2 text-right">
                      {!encerrada && e.situacao === "Cursando" && <TirarDaTurma turmaId={turma.id} estudanteId={e.id} nome={e.nome} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
        <div className="lg:col-start-2 lg:row-span-2">
          <HorariosDaTurma
            turmaId={turma.id}
            horarios={horarios}
            salas={salas.map((s) => ({ id: s.id, nome: s.nome, capacidade: s.capacidade }))}
            vagas={turma.vagas ?? null}
            cursando={cursando}
            editavel={!encerrada}
          />
        </div>
        {encerrada ? (
          <Mensagem tipo="info">{mensagemPeriodoEncerrado(turma.periodo)} Cadastro, matrícula e troca de professor ficam bloqueados até o administrador reabrir o período.</Mensagem>
        ) : (
        <div className="space-y-5">
          <CorrigirCadastro
            url={`/api/turmas/${turma.id}`}
            titulo="Editar turma"
            campos={[{ nome: "nome", rotulo: "Nome da turma", valor: turma.nome }]}
            excluir={{ rotulo: "Excluir turma", confirmacao: `Excluir ${turma.nome}? Ela ainda não tem registros.`, destino: "/coordenador/turmas", motivo: motivoExclusao }}
          />
          <Cartao titulo="Importar planilha (CSV)">
            <p className="mb-3 text-sm text-mudo">Cadastre e matricule vários estudantes de {turma.curso.nome} de uma vez. Nada é gravado antes de você confirmar.</p>
            <ImportacaoPlanilha turmaId={turma.id} />
          </Cartao>
          <Cartao titulo="Cadastrar novo estudante">
            <FormularioApi
              url={`/api/turmas/${turma.id}/estudantes`}
              textoBotao="Cadastrar estudante"
              mensagemSucesso={`Estudante cadastrado no curso ${turma.curso.nome} e matriculado.`}
              campos={[
                { nome: "nome", rotulo: "Nome" },
                { nome: "email", rotulo: "E-mail", tipo: "email" },
                { nome: "senha", rotulo: "Senha inicial (mínimo 8 caracteres)", tipo: "password" },
              ]}
            />
          </Cartao>
          <Cartao titulo="Matricular estudante já cadastrado">
            <p className="mb-3 text-sm text-mudo">Só estudantes de {turma.curso.nome}.</p>
            <FormularioApi
              url={`/api/turmas/${turma.id}/matriculas`}
              textoBotao="Matricular"
              mensagemSucesso="Estudante matriculado."
              secundario
              campos={[{ nome: "email", rotulo: "E-mail do estudante", tipo: "email" }]}
            />
          </Cartao>
          <Cartao titulo="Professor responsável">
            <p className="mb-3 text-sm text-mudo">
              Hoje: <strong className="font-medium text-texto">{turma.professor.nome}</strong>. Os planos de recuperação ativos da turma passam para o novo professor.
            </p>
            {outrosProfessores.length === 0 ? (
              <p className="text-sm text-mudo">Não há outro professor ativo para assumir a turma.</p>
            ) : (
              <FormularioApi
                url={`/api/turmas/${turma.id}/professor`}
                textoBotao="Trocar professor"
                mensagemSucesso="Professor da turma trocado."
                secundario
                campos={[{ nome: "professorId", rotulo: "Novo professor", tipo: "select", opcoes: outrosProfessores.map((p) => ({ valor: p.id, rotulo: p.nome })) }]}
              />
            )}
          </Cartao>
        </div>
        )}
      </div>
    </Casca>
  );
}
