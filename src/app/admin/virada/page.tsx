import { Casca } from "@/components/casca";
import { CabecalhoPagina } from "@/components/ui";
import { ViradaSemestre } from "@/components/virada-semestre";
import { RECURSOS } from "@/domain/autorizacao";
import { listarPeriodos } from "@/server/academico/periodos";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-030 / RF-38 (UC-27): copiar as turmas de um período para o período novo (secretaria).
// Layout aprovado em docs/layout/prototipo.html#virada-semestre.
export default async function PaginaVirada() {
  const sessao = await exigirAcessoPagina(RECURSOS.secretaria);
  const periodos = (await listarPeriodos()).map((p) => ({ nome: p.nome, status: p.status }));
  return (
    <Casca sessao={sessao} ativo="virada">
      <CabecalhoPagina titulo="Virada de semestre" subtitulo="Copie as turmas de um período para o período novo. Avaliações, notas e chamadas não são copiadas." />
      <ViradaSemestre periodos={periodos} />
    </Casca>
  );
}
