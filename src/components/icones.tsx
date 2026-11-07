// Ícones de traço simples usados na casca e nos atalhos (sem dependência externa).

const CAMINHOS = {
  inicio: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  livro: "M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5zM4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3",
  pessoas: "M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7",
  lapis: "M4 20h4L19 9a2.83 2.83 0 0 0-4-4L4 16zM13.5 6.5l4 4",
  cadeado: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  sair: "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10",
  menu: "M4 6h16M4 12h16M4 18h16",
  fechar: "M6 6l12 12M18 6 6 18",
  seta: "M5 12h14M13 6l6 6-6 6",
  calendario: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  check: "M4 12.5 9 17.5 20 6.5",
  grafico: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  relogio: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2",
  documento: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  megafone: "M4 10v4h3l6 4V6L7 10zM17 9a4 4 0 0 1 0 6",
  sino: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
  escudo: "M12 3 5 6v6c0 4.2 3 7.5 7 9 4-1.5 7-4.8 7-9V6zM9 12l2 2 4-4",
  mochila: "M8 7V5a4 4 0 0 1 8 0v2M5 9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11H5zM9 13h6",
  chave: "M14.5 9.5a4 4 0 1 0-3.2 3.9L13 15h2v2h2v2h3v-3l-5.6-5.6a4 4 0 0 0 .1-.9M8.5 9.5h.01",
  repetir: "M4 9a7 7 0 0 1 12-4l3 3M19 4v4h-4M20 15a7 7 0 0 1-12 4l-3-3M5 20v-4h4",
  predio: "M4 21V8l8-5 8 5v13M4 21h16M9 21v-5h6v5M8 11h.01M12 11h.01M16 11h.01",
  lixeira: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6",
  capelo: "M2 9.5 12 5l10 4.5-10 4.5zM6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5M22 9.5V15",
} as const;

export type NomeIcone = keyof typeof CAMINHOS;

export function Icone({ nome, className = "h-5 w-5" }: { nome: NomeIcone; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={CAMINHOS[nome]} />
    </svg>
  );
}
