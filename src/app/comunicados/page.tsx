import { Casca } from "@/components/casca";
import { MuralComunicados } from "@/components/mural-comunicados";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { consultarMural, opcoesDePublicacao } from "@/server/academico/comunicados";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-025 / RF-34 (UC-23, UC-24): mural de comunicados. Estudante lê; professor e coordenador também publicam
// e apagam os próprios (RB-26). Layout aprovado em docs/layout/prototipo.html#comunicados-estudante e #comunicados-publicar.
export default async function Comunicados() {
  const sessao = await exigirAcessoPagina(RECURSOS.comunicados);
  const [comunicados, opcoes] = await Promise.all([consultarMural(sessao), opcoesDePublicacao(sessao)]);
  const subtitulo =
    sessao.perfil === "Estudante"
      ? "Avisos das suas turmas e do seu curso."
      : sessao.perfil === "Professor"
        ? "Publique avisos para as turmas que você leciona. Os estudantes recebem notificação."
        : "Publique avisos para uma turma ou para todas as turmas de um curso. Os estudantes recebem notificação.";
  return (
    <Casca sessao={sessao} ativo="comunicados">
      <CabecalhoPagina titulo="Comunicados" subtitulo={subtitulo} />
      <MuralComunicados comunicados={comunicados ?? []} opcoes={opcoes} />
    </Casca>
  );
}
