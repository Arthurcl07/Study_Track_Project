// SPEC-048: atalhos para os documentos oficiais da turma (professor, coordenação e secretaria).
import Link from "next/link";
import { Icone } from "./icones";
import { CLASSE_BOTAO_SECUNDARIO } from "./ui";

export function DocumentosDaTurma({ turmaId }: { turmaId: string }) {
  const itens = [
    { href: `/documentos/ata?turma=${turmaId}`, rotulo: "Ata de resultados" },
    { href: `/documentos/diario?turma=${turmaId}`, rotulo: "Diário de classe" },
    { href: `/documentos/lista-presenca?turma=${turmaId}`, rotulo: "Lista de presença" },
  ];
  return (
    <nav aria-label="Documentos da turma" className="flex flex-wrap gap-2">
      {itens.map((i) => (
        <Link key={i.href} href={i.href} className={CLASSE_BOTAO_SECUNDARIO}>
          <Icone nome="documento" className="h-4 w-4" /> {i.rotulo}
        </Link>
      ))}
    </nav>
  );
}
