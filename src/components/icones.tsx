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
} as const;

export type NomeIcone = keyof typeof CAMINHOS;

export function Icone({ nome, className = "h-5 w-5" }: { nome: NomeIcone; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={CAMINHOS[nome]} />
    </svg>
  );
}
