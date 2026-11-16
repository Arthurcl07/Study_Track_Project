// Registro de erros (SPEC-047, SPEC-057, RF-56, RF-63, RNF-08). Funções puras: sem Next.js nem Prisma.

// INV-047-02: o código mostrado na página de erro é o mesmo do registro. Vem do digest do Next.js (o mesmo no
// servidor e no navegador) ou, sem digest, de um valor aleatório.
export function codigoDoErro(digest?: string | null): string {
  const base = digest && digest.trim() ? digest.trim() : `${Date.now()}-${Math.random()}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < base.length; i++) {
    h ^= base.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `ERR-${(h >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 6)}`;
}

export function codigoValido(texto: unknown): texto is string {
  return typeof texto === "string" && /^ERR-[0-9A-F]{6}$/.test(texto.trim().toUpperCase());
}

const TAMANHO_MAXIMO_MENSAGEM = 300;

// INV-057-01: nada de senha, token, e-mail, CPF ou número longo no registro.
export function mascararDadosPessoais(texto: string): string {
  return texto
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[token]")
    .replace(/(senha|password|token|secret)(["']?\s*[:=]\s*["']?)[^\s"',}]+/gi, "$1$2[oculto]")
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[e-mail]")
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "[cpf]")
    .replace(/\b\d{6,}\b/g, "[número]")
    .slice(0, TAMANHO_MAXIMO_MENSAGEM);
}

// Rota sem identificadores: /coordenador/turmas/3f2a…/ → /coordenador/turmas/…
export function rotaSemIdentificadores(caminho: string): string {
  const semConsulta = caminho.split("?")[0] || "/";
  return semConsulta
    .split("/")
    .map((parte) => (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(parte) || /^\d{4,}$/.test(parte) ? "…" : parte))
    .join("/")
    .slice(0, 200);
}

export const MENSAGEM_ERRO_INESPERADO = "Algo deu errado. Tente de novo; se continuar, informe o código à secretaria.";

// Faixas da página Saúde do sistema: até 300 ms verde, até 1 s amarelo, acima vermelho.
export function estadoDoTempo(ms: number): "Normal" | "Atencao" | "Risco" {
  return ms <= 300 ? "Normal" : ms <= 1000 ? "Atencao" : "Risco";
}
