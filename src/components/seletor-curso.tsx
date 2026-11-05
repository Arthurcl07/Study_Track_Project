"use client";

// Escolha do curso na URL (?curso=), para o coordenador com mais de um curso (SPEC-015 grade; SPEC-016 dashboard).
// O servidor confere se o curso é dele: o seletor só orienta (INV-015-07).
import { usePathname, useRouter } from "next/navigation";
import { CLASSE_CAMPO, CLASSE_ROTULO } from "./ui";

export function SeletorCurso({ cursos, valor, todos }: { cursos: { id: string; nome: string }[]; valor: string; todos?: string }) {
  const router = useRouter();
  const caminho = usePathname();
  return (
    <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 sm:w-auto">
      <label htmlFor="curso" className={CLASSE_ROTULO}>Curso</label>
      <select
        id="curso"
        value={valor}
        onChange={(e) => router.push(e.target.value ? `${caminho}?curso=${e.target.value}` : caminho)}
        className={`${CLASSE_CAMPO} mt-0 sm:w-72`}
      >
        {todos && <option value="">{todos}</option>}
        {cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
    </div>
  );
}
