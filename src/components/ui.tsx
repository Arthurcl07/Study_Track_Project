// Peças de interface da identidade visual (docs/identidade-visual.md, seção Componentes).
import Link from "next/link";
import { FREQUENCIA_MINIMA, MEDIA_NORMAL, MEDIA_RISCO } from "@/domain/situacao-academica";

export const CLASSE_CAMPO =
  "mt-1.5 w-full rounded-[10px] border border-traco bg-white px-3 py-2.5 text-base text-texto placeholder:text-mudo focus:border-azul focus:outline-none focus:ring-3 focus:ring-azul-suave aria-invalid:border-risco";
export const CLASSE_ROTULO = "block text-sm font-medium text-texto";
const BASE_BOTAO =
  "inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
export const CLASSE_BOTAO_PRIMARIO = `${BASE_BOTAO} bg-azul text-white hover:bg-azul-escuro`;
export const CLASSE_BOTAO_SECUNDARIO = `${BASE_BOTAO} border border-traco bg-white text-texto hover:bg-nevoa`;
export const CLASSE_LINK = "font-medium text-azul hover:text-azul-escuro hover:underline";

export function Cartao({ titulo, acao, children, className = "" }: {
  titulo?: React.ReactNode;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-traco bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ${className}`}>
      {(titulo || acao) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {titulo && <h2 className="text-[17px] font-semibold">{titulo}</h2>}
          {acao}
        </div>
      )}
      {children}
    </section>
  );
}

export function CabecalhoPagina({ titulo, subtitulo, acao, voltar }: {
  titulo: string;
  subtitulo?: string;
  acao?: React.ReactNode;
  voltar?: { href: string; rotulo: string };
}) {
  return (
    <header className="mb-6">
      {voltar && (
        <Link href={voltar.href} className="mb-2 inline-block text-sm text-azul hover:underline">
          ← {voltar.rotulo}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
          {subtitulo && <p className="mt-1 text-mudo">{subtitulo}</p>}
        </div>
        {acao}
      </div>
    </header>
  );
}

// SPEC-016: cartão de número dos dashboards (rótulo, valor, detalhe opcional e atalho opcional).
export function CartaoNumero({ rotulo, valor, cor = "", detalhe, href }: {
  rotulo: string;
  valor: React.ReactNode;
  cor?: string;
  detalhe?: React.ReactNode;
  href?: string;
}) {
  const conteudo = (
    <>
      <span className="text-sm text-mudo">{rotulo}</span>
      <strong className={`mt-1 block text-[26px] leading-tight font-bold tabular-nums ${cor}`}>{valor}</strong>
      {detalhe && <span className="mt-0.5 block text-xs text-mudo">{detalhe}</span>}
    </>
  );
  const classe = "block rounded-2xl border border-traco bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]";
  return href ? <Link href={href} className={`${classe} transition-colors hover:border-azul`}>{conteudo}</Link> : <div className={classe}>{conteudo}</div>;
}

export function Etiqueta({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-full bg-azul-suave px-2.5 py-0.5 text-xs font-semibold text-azul-escuro">{children}</span>;
}

const ESTILO_MENSAGEM = {
  sucesso: "bg-sucesso-fundo text-normal",
  erro: "bg-erro-fundo text-risco",
  info: "bg-info-fundo text-info",
} as const;

export function Mensagem({ tipo, children }: { tipo: keyof typeof ESTILO_MENSAGEM; children: React.ReactNode }) {
  return (
    <p role={tipo === "erro" ? "alert" : "status"} className={`rounded-[10px] px-3 py-2.5 text-sm ${ESTILO_MENSAGEM[tipo]}`}>
      {children}
    </p>
  );
}

export function ErroCampo({ mensagem }: { mensagem?: string }) {
  return mensagem ? <p className="mt-1 text-sm text-risco">{mensagem}</p> : null;
}

export function EstadoVazio({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-traco px-4 py-8 text-center text-mudo">{children}</div>;
}

// Selos de status (identidade-visual.md): sempre cor + símbolo + rótulo (RNF-06).
const SITUACOES = {
  Normal: { classe: "bg-normal-fundo text-normal", rotulo: "● Normal" },
  Atencao: { classe: "bg-atencao-fundo text-atencao", rotulo: "▲ Atenção" },
  Risco: { classe: "bg-risco-fundo text-risco", rotulo: "■ Risco" },
} as const;

export function SeloSituacao({ situacao }: { situacao: keyof typeof SITUACOES }) {
  const s = SITUACOES[situacao];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap ${s.classe}`}>{s.rotulo}</span>;
}

const ENTREGAS = {
  NoPrazo: { classe: "bg-normal-fundo text-normal", rotulo: "● No prazo" },
  Pendente: { classe: "bg-slate-100 text-slate-600", rotulo: "○ Pendente" },
  Atrasada: { classe: "bg-risco-fundo text-risco", rotulo: "■ Atrasada" },
} as const;

export function SeloEntrega({ status }: { status: keyof typeof ENTREGAS }) {
  const s = ENTREGAS[status];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap ${s.classe}`}>{s.rotulo}</span>;
}

// Números em pt-BR com no máximo uma casa decimal ("6,2", "78").
export const formatarNumero = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

// Só destaca o valor que está fora do limite; os limites vêm da regra única (DA-02).
export const corDaMedia = (m: number | null) => (m === null || m >= MEDIA_NORMAL ? "" : m < MEDIA_RISCO ? "text-risco" : "text-atencao");
export const corDaFrequencia = (f: number | null) => (f !== null && f < FREQUENCIA_MINIMA ? "text-risco" : "");

// "AAAA-MM-DD" → "DD/MM/AAAA" sem passar por fuso horário.
export function formatarDataCurta(texto: string) {
  const [ano, mes, dia] = texto.split("-");
  return `${dia}/${mes}/${ano}`;
}
