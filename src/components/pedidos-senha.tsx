"use client";

// SPEC-027 (RB-27): aprovar mostra a senha provisória uma única vez; recusar encerra o pedido. A regra fica no
// servidor; aqui só se mostra o resultado.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, Cartao, EstadoVazio, Etiqueta, Mensagem } from "./ui";

type Pedido = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  proprio: boolean;
  criadoEm: string;
  resolvidoEm: string | null;
  status: "Pendente" | "Aprovado" | "Recusado";
  resolvidoPor: string | null;
};

const dataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export function PedidosSenha({ pendentes, resolvidos }: { pendentes: Pedido[]; resolvidos: Pedido[] }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [senha, setSenha] = useState<{ nome: string; senha: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function resolver(pedido: Pedido, acao: "aprovar" | "recusar") {
    const pergunta = acao === "aprovar"
      ? `Aprovar o pedido de ${pedido.nome}? A senha atual deixa de funcionar e uma senha provisória será gerada.`
      : `Recusar o pedido de ${pedido.nome}? A senha atual continua valendo.`;
    if (!window.confirm(pergunta)) return;
    setEnviando(pedido.id);
    setErro(null);
    setCopiado(false);
    const resposta = await fetch(`/api/pedidos-senha/${pedido.id}/${acao}`, { method: "POST" }).catch(() => null);
    const corpo = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(null);
    if (!resposta?.ok) {
      setErro(corpo.erro ?? "Não foi possível resolver o pedido.");
      return;
    }
    setSenha(acao === "aprovar" ? { nome: corpo.nome, senha: corpo.senhaProvisoria } : null);
    router.refresh();
  }

  const cabecalho = (colunas: string[]) => (
    <thead>
      <tr className="text-left text-xs font-semibold tracking-wide text-mudo uppercase">
        {colunas.map((c, i) => <th key={c || i} className={`pb-2.5 ${i === 0 ? "pr-2" : "px-2"}`}>{c || <span className="sr-only">Ações</span>}</th>)}
      </tr>
    </thead>
  );

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-5">
        <Cartao titulo={`Pendentes (${pendentes.length})`}>
          {erro && <div className="mb-3"><Mensagem tipo="erro">{erro}</Mensagem></div>}
          {pendentes.length === 0 ? (
            <EstadoVazio>Nenhum pedido pendente.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              {cabecalho(["Conta", "Perfil", "Pedido em", ""])}
              <tbody>
                {pendentes.map((p) => (
                  <tr key={p.id} className="border-t border-traco">
                    <td data-rotulo="Conta" className="py-3 pr-2"><span className="font-semibold">{p.nome}</span><span className="block text-sm text-mudo">{p.email}</span></td>
                    <td data-rotulo="Perfil" className="px-2 py-3"><Etiqueta>{p.perfil}</Etiqueta></td>
                    <td data-rotulo="Pedido em" className="px-2 py-3">{dataHora(p.criadoEm)}</td>
                    <td data-rotulo="Ações" className="py-3 pl-2">
                      <span className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={enviando !== null || p.proprio}
                          title={p.proprio ? "Peça a outro administrador" : undefined}
                          onClick={() => resolver(p, "aprovar")}
                          className={CLASSE_BOTAO_PRIMARIO}
                        >
                          {enviando === p.id ? "Salvando..." : "Aprovar"}
                        </button>
                        <button type="button" disabled={enviando !== null} onClick={() => resolver(p, "recusar")} className={CLASSE_BOTAO_SECUNDARIO}>
                          Recusar
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
        <Cartao titulo="Resolvidos nos últimos 30 dias">
          {resolvidos.length === 0 ? (
            <EstadoVazio>Nenhum pedido resolvido nos últimos 30 dias.</EstadoVazio>
          ) : (
            <table className="tabela-responsiva w-full text-[15px]">
              {cabecalho(["Conta", "Resultado", "Por", "Em"])}
              <tbody>
                {resolvidos.map((p) => (
                  <tr key={p.id} className="border-t border-traco">
                    <td data-rotulo="Conta" className="py-3 pr-2">{p.nome}</td>
                    <td data-rotulo="Resultado" className="px-2 py-3">
                      {p.status === "Aprovado" ? (
                        <span className="inline-flex rounded-full bg-normal-fundo px-2.5 py-0.5 text-[13px] font-semibold text-normal">● Aprovado</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[13px] font-semibold text-slate-600">○ Recusado</span>
                      )}
                    </td>
                    <td data-rotulo="Por" className="px-2 py-3">{p.resolvidoPor ?? "—"}</td>
                    <td data-rotulo="Em" className="px-2 py-3">{p.resolvidoEm ? dataHora(p.resolvidoEm) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
      </div>
      <Cartao titulo={senha ? `Senha provisória de ${senha.nome}` : "Senha provisória"}>
        {senha ? (
          <div className="space-y-3">
            <Mensagem tipo="sucesso">Pedido aprovado. Entregue esta senha à pessoa.</Mensagem>
            <p className="rounded-[10px] border border-dashed border-slate-400 bg-nevoa px-3 py-3 text-center font-mono text-xl tracking-wider" aria-label="Senha provisória">
              {senha.senha}
            </p>
            <button
              type="button"
              className={`w-full ${CLASSE_BOTAO_SECUNDARIO}`}
              onClick={() => navigator.clipboard?.writeText(senha.senha).then(() => setCopiado(true)).catch(() => null)}
            >
              {copiado ? "✓ Copiada" : "📋 Copiar"}
            </button>
            <p className="text-sm text-mudo">Ela não será mostrada de novo. No primeiro acesso, a pessoa define uma senha nova. A senha antiga deixou de funcionar.</p>
          </div>
        ) : (
          <p className="text-sm text-mudo">Ao aprovar um pedido, a senha provisória aparece aqui uma única vez para você entregar à pessoa (na secretaria ou por telefone).</p>
        )}
      </Cartao>
    </div>
  );
}
