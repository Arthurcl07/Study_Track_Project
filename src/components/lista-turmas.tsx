import type { listarTurmasDoEscopo } from "@/server/dados/estrutura";
import { Icone } from "./icones";
import { EstadoVazio, Etiqueta } from "./ui";

type Turmas = Awaited<ReturnType<typeof listarTurmasDoEscopo>>;

function resumoEstudantes(nomes: string[]) {
  if (nomes.length === 0) return "Sem estudantes matriculados.";
  if (nomes.length <= 3) return nomes.join(", ");
  return `${nomes.slice(0, 3).join(", ")} e mais ${nomes.length - 3}`;
}

// Cartões das turmas do escopo. A lista de estudantes só existe para Professor e Coordenador (RB-02).
export function ListaTurmas({ turmas, vazio }: { turmas: Turmas; vazio: string }) {
  if (turmas.length === 0) return <EstadoVazio>{vazio}</EstadoVazio>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {turmas.map((t) => (
        <li key={t.id} className="rounded-2xl border border-traco bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
          <Etiqueta>{t.periodo}</Etiqueta>
          <h3 className="mt-2.5 font-semibold">{t.disciplina.nome}</h3>
          <p className="mt-1 text-sm text-mudo">{t.nome} · Professor: {t.professor.nome}</p>
          {t.estudantes && (
            <div className="mt-4 border-t border-traco pt-3 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <Icone nome="pessoas" className="h-4 w-4 text-mudo" />
                {t.estudantes.length} estudante(s)
              </p>
              <p className="mt-1 text-mudo">{resumoEstudantes(t.estudantes.map((e) => e.nome))}</p>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
