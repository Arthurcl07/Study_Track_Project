// Logotipo do StudyTrack (docs/identidade-visual.md): linha de evolução que sobe sobre quadrado marinho.

export function Marca({ tamanho = 36, sobreEscuro = false }: { tamanho?: number; sobreEscuro?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} aria-hidden="true" className="shrink-0">
      <rect width="64" height="64" rx="14" fill={sobreEscuro ? "#1E3A5F" : "#0F2A4A"} />
      <polyline
        points="14,45 26,35 36,39 50,20"
        fill="none"
        stroke="#60A5FA"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="45" r="3.5" fill="#93C5FD" />
      <circle cx="26" cy="35" r="3.5" fill="#93C5FD" />
      <circle cx="36" cy="39" r="3.5" fill="#93C5FD" />
      <circle cx="50" cy="20" r="6" fill="#FFFFFF" />
    </svg>
  );
}

// Assinatura: marca + nome. "inverso" é a versão para fundo marinho.
export function Logotipo({ inverso = false, grande = false }: { inverso?: boolean; grande?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-bold tracking-tight ${grande ? "text-2xl" : "text-xl"}`}>
      <Marca tamanho={grande ? 40 : 34} sobreEscuro={inverso} />
      <span>
        <span className={inverso ? "text-white" : "text-marinho"}>Study</span>
        <span className={inverso ? "text-ceu" : "text-azul"}>Track</span>
      </span>
    </span>
  );
}
