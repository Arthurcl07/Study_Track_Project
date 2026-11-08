import { Casca } from "@/components/casca";
import { GestaoSalas } from "@/components/gestao-secretaria-n3";
import { CabecalhoPagina } from "@/components/ui";
import { RECURSOS } from "@/domain/autorizacao";
import { listarSalas } from "@/server/academico/horarios";
import { exigirAcessoPagina } from "@/server/auth/guardas";

// SPEC-041 / RF-49 (UC-38): salas usadas nos horários das turmas (secretaria). Layout em docs/layout/prototipo.html#salas.
export default async function Salas() {
  const sessao = await exigirAcessoPagina(RECURSOS.secretaria);
  const salas = (await listarSalas()).map((s) => ({ id: s.id, nome: s.nome, capacidade: s.capacidade, horarios: s._count.horarios }));
  return (
    <Casca sessao={sessao} ativo="salas">
      <CabecalhoPagina titulo="Salas" subtitulo="Salas usadas nos horários das turmas. A capacidade limita as vagas." />
      <GestaoSalas salas={salas} />
    </Casca>
  );
}
