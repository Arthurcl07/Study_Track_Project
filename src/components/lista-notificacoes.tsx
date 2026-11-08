"use client";

// Lista de notificações (SPEC-022, RF-31): abrir uma marca como lida e leva à tela relacionada; "Marcar todas como
// lidas" zera o contador. Layout aprovado em docs/layout/prototipo.html#notificacoes.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CLASSE_BOTAO_SECUNDARIO, EstadoVazio, Mensagem } from "./ui";

type Notificacao = { id: string; tipo: "Risco" | "Nota" | "Plano" | "Prazo" | "Comunicado" | "Requerimento" | "Diario"; titulo: string; texto: string; link: string; criadaEm: string; lidaEm: string | null };

const ESTILO: Record<Notificacao["tipo"], { icone: string; classe: string }> = {
  Risco: { icone: "■", classe: "bg-risco-fundo text-risco" },
  Nota: { icone: "✎", classe: "bg-info-fundo text-info" },
  Plano: { icone: "✓", classe: "bg-normal-fundo text-normal" },
  Prazo: { icone: "◷", classe: "bg-atencao-fundo text-atencao" },
  Comunicado: { icone: "✉", classe: "bg-azul-suave text-azul-escuro" },
  // SPEC-036 e SPEC-039.
  Requerimento: { icone: "📨", classe: "bg-info-fundo text-info" },
  Diario: { icone: "📘", classe: "bg-atencao-fundo text-atencao" },
};

const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function ListaNotificacoes({ notificacoes, naoLidas }: { notificacoes: Notificacao[]; naoLidas: number }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function abrir(n: Notificacao) {
    if (!n.lidaEm) await fetch(`/api/notificacoes/${n.id}/lida`, { method: "POST" }).catch(() => null);
    router.push(n.link);
    router.refresh();
  }

  async function marcarTodas() {
    setEnviando(true);
    setErro(null);
    const resposta = await fetch("/api/notificacoes/lidas", { method: "POST" }).catch(() => null);
    setEnviando(false);
    if (!resposta?.ok) setErro("Não foi possível marcar as notificações.");
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-mudo">{naoLidas === 0 ? "Nenhuma notificação nova." : `${naoLidas} não lida(s).`}</p>
        {naoLidas > 0 && (
          <button type="button" onClick={marcarTodas} disabled={enviando} className={CLASSE_BOTAO_SECUNDARIO}>
            ✓ Marcar todas como lidas
          </button>
        )}
      </div>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {notificacoes.length === 0 ? (
        <EstadoVazio>Você ainda não tem notificações. Avisos de nota, Risco, plano e prazos aparecem aqui.</EstadoVazio>
      ) : (
        <ul className="space-y-2.5">
          {notificacoes.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => abrir(n)}
                className={`flex w-full gap-3 rounded-xl border p-3.5 text-left transition-colors hover:border-azul ${n.lidaEm ? "border-traco bg-white" : "border-ceu bg-info-fundo"}`}
              >
                <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-base font-bold ${ESTILO[n.tipo].classe}`}>{ESTILO[n.tipo].icone}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">{n.lidaEm ? "" : <span className="sr-only">Não lida: </span>}{n.lidaEm ? "" : "● "}{n.titulo}</span>
                  <span className="mt-0.5 block text-sm text-mudo">{n.texto}</span>
                </span>
                <time dateTime={n.criadaEm} className="shrink-0 text-xs text-mudo">{quando(n.criadaEm)}</time>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
