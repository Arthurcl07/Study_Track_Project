export function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 p-4 sm:p-5">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
