import type { listarTurmasDoEscopo } from "@/server/dados/estrutura";

type Turmas = Awaited<ReturnType<typeof listarTurmasDoEscopo>>;

// Lista de turmas do escopo. A lista de estudantes só existe para Professor e Coordenador (RB-02).
export function ListaTurmas({ turmas, vazio }: { turmas: Turmas; vazio: string }) {
  if (turmas.length === 0) return <p className="text-slate-600">{vazio}</p>;
  return (
    <ul className="space-y-3">
      {turmas.map((t) => (
        <li key={t.id} className="rounded-lg border border-slate-200 p-3">
          <p className="font-medium">{t.nome} <span className="font-normal text-slate-500">· {t.periodo}</span></p>
          <p className="text-sm text-slate-600">{t.disciplina.nome} · Professor: {t.professor.nome}</p>
          {t.estudantes && (
            <p className="mt-1 text-sm text-slate-600">
              {t.estudantes.length === 0 ? "Sem estudantes." : t.estudantes.map((e) => e.nome).join(", ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
