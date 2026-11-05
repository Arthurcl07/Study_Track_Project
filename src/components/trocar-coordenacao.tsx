"use client";

// Troca da coordenação de um curso pelo Administrador (SPEC-015, RF-22, AC-015-04). As regras (coordenador
// ativo com perfil Coordenador, RB-17) valem no servidor; aqui só se mostra o que ele devolver.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, ErroCampo, Mensagem } from "./ui";

type Opcao = { valor: string; rotulo: string };

export function TrocarCoordenacao({ cursos, coordenadores }: { cursos: Opcao[]; coordenadores: Opcao[] }) {
  const router = useRouter();
  const [curso, setCurso] = useState("");
  const [coordenador, setCoordenador] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setSucesso(null);
    setErros({});
    if (!curso) {
      setErros({ curso: "Escolha o curso." });
      return;
    }
    setEnviando(true);
    try {
      const resposta = await fetch(`/api/cursos/${curso}/coordenador`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordenadorId: coordenador }),
      });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(retorno.erro ?? "Não foi possível trocar a coordenação.");
        setErros(retorno.campos ?? {});
        return;
      }
      setSucesso(`${retorno.nome} agora é coordenado(a) por ${retorno.coordenador.nome}.`);
      setCurso("");
      setCoordenador("");
      router.refresh();
    } catch {
      setErro("Não foi possível trocar a coordenação. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4" noValidate>
      <p className="rounded-[10px] bg-info-fundo px-3 py-2.5 text-sm text-info">Quem sai deixa de ver as turmas do curso na hora; quem entra passa a ver.</p>
      <div>
        <label htmlFor="troca-curso" className={CLASSE_ROTULO}>Curso</label>
        <select id="troca-curso" value={curso} onChange={(e) => setCurso(e.target.value)} aria-invalid={Boolean(erros.curso)} className={CLASSE_CAMPO}>
          <option value="">Selecione...</option>
          {cursos.map((c) => <option key={c.valor} value={c.valor}>{c.rotulo}</option>)}
        </select>
        <ErroCampo mensagem={erros.curso} />
      </div>
      <div>
        <label htmlFor="troca-coordenador" className={CLASSE_ROTULO}>Novo coordenador(a)</label>
        <select id="troca-coordenador" value={coordenador} onChange={(e) => setCoordenador(e.target.value)} aria-invalid={Boolean(erros.coordenadorId)} className={CLASSE_CAMPO}>
          <option value="">Selecione...</option>
          {coordenadores.map((c) => <option key={c.valor} value={c.valor}>{c.rotulo}</option>)}
        </select>
        <ErroCampo mensagem={erros.coordenadorId} />
      </div>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
      <button type="submit" disabled={enviando} className={`w-full ${CLASSE_BOTAO_SECUNDARIO}`}>
        {enviando ? "Salvando..." : "Trocar coordenação"}
      </button>
    </form>
  );
}
