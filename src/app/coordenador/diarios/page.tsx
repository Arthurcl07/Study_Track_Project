import { Casca } from "@/components/casca";
import { DiariosParaHomologar } from "@/components/coordenacao-n3";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { listarDiarios } from "@/server/academico/diario";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-039 / RF-47 (UC-36): diários das turmas dos cursos do coordenador — homologar, devolver e reabrir.
// Layout aprovado em docs/layout/prototipo.html#diario-homologar.
export default async function Diarios() {
  const sessao = await exigirAcessoPagina(RECURSOS.diarios);
  const diarios = await listarDiarios(sessao.usuarioId);
  return (
    <Casca sessao={sessao} ativo="diarios">
      <CabecalhoPagina titulo="Diários" subtitulo="Diários fechados pelos professores esperando homologação. Homologado, a turma fica somente leitura." />
      <DiariosParaHomologar diarios={diarios} />
    </Casca>
  );
}
