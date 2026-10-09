import { redirect } from "next/navigation";
import { painelDoPerfil } from "@/domain/autorizacao";
import { sessaoDaPagina } from "@/server/auth/guardas";

export default async function Inicio() {
  const sessao = await sessaoDaPagina();
  redirect(sessao ? painelDoPerfil(sessao.perfil) : "/login");
}
