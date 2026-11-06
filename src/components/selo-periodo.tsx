// Selo do status do período letivo (SPEC-017): cor, símbolo e rótulo, como os selos de situação (RNF-06).
export function SeloPeriodo({ aberto, rotuloAberto = "Aberto" }: { aberto: boolean; rotuloAberto?: string }) {
  return aberto ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-normal-fundo px-2.5 py-0.5 text-[13px] font-semibold text-normal">● {rotuloAberto}</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-traco px-2.5 py-0.5 text-[13px] font-semibold text-mudo">■ Encerrado</span>
  );
}
