"use client";

// Dados da instituição (SPEC-033, RF-42): nome, CNPJ, endereço, contato, quem assina e logotipo (PNG ou JPG até
// 200 KB, lido no navegador como data URL). A validação vale no servidor. Layout em docs/layout/prototipo.html#instituicao.
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Instituicao } from "@/server/academico/secretaria";
import { CLASSE_BOTAO_PRIMARIO, CLASSE_BOTAO_SECUNDARIO, CLASSE_CAMPO, CLASSE_ROTULO, Cartao, ErroCampo, Mensagem } from "./ui";

const CAMPOS: { nome: string; rotulo: string; tipo?: string }[] = [
  { nome: "nome", rotulo: "Nome da instituição" },
  { nome: "cnpj", rotulo: "CNPJ" },
  { nome: "endereco", rotulo: "Endereço" },
  { nome: "cidadeUf", rotulo: "Cidade/UF" },
  { nome: "telefone", rotulo: "Telefone", tipo: "tel" },
  { nome: "email", rotulo: "E-mail", tipo: "email" },
  { nome: "responsavelSecretaria", rotulo: "Responsável pela secretaria (assina os documentos)" },
];

export function FormularioInstituicao({ instituicao }: { instituicao: Instituicao }) {
  const router = useRouter();
  const [logotipo, setLogotipo] = useState<string | null>(instituicao?.logotipo ?? null);
  const [logoMudou, setLogoMudou] = useState(false);
  const [previa, setPrevia] = useState({ nome: instituicao?.nome ?? "", cnpj: instituicao?.cnpj ?? "", endereco: instituicao?.endereco ?? "", cidadeUf: instituicao?.cidadeUf ?? "", responsavelSecretaria: instituicao?.responsavelSecretaria ?? "" });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function escolherLogo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      setLogotipo(String(leitor.result));
      setLogoMudou(true);
    };
    leitor.readAsDataURL(arquivo);
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(evento.currentTarget));
    delete dados.arquivoLogotipo;
    setEnviando(true);
    setErro(null);
    setErros({});
    setSucesso(null);
    const corpo = { ...dados, ...(logoMudou ? { logotipo } : { manterLogotipo: true }) };
    const resposta = await fetch("/api/instituicao", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) }).catch(() => null);
    const retorno = resposta ? await resposta.json().catch(() => ({})) : {};
    setEnviando(false);
    if (!resposta?.ok) {
      setErro(retorno.erro ?? "Não foi possível salvar.");
      setErros(retorno.campos ?? {});
      return;
    }
    setLogoMudou(false);
    setSucesso("Dados salvos. O boletim e o histórico já saem com eles.");
    router.refresh();
  }

  const quadroLogo = logotipo ? (
    // eslint-disable-next-line @next/next/no-img-element -- prévia de data URL local.
    <img src={logotipo} alt="Logotipo" className="h-14 w-14 rounded-lg border border-traco object-contain" />
  ) : (
    <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-traco text-xs text-mudo">sem logo</span>
  );

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1.6fr_1fr]">
      <Cartao>
        <form onSubmit={salvar} onChange={(e) => setPrevia((p) => ({ ...p, ...Object.fromEntries(new FormData(e.currentTarget)) }))} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {CAMPOS.map((c) => (
              <div key={c.nome} className={c.nome === "responsavelSecretaria" ? "sm:col-span-2" : ""}>
                <label htmlFor={c.nome} className={CLASSE_ROTULO}>{c.rotulo}</label>
                <input id={c.nome} name={c.nome} type={c.tipo ?? "text"} defaultValue={(instituicao?.[c.nome as keyof NonNullable<Instituicao>] as string | null) ?? ""} aria-invalid={Boolean(erros[c.nome])} className={CLASSE_CAMPO} />
                <ErroCampo mensagem={erros[c.nome]} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label htmlFor="arquivoLogotipo" className={CLASSE_ROTULO}>Logotipo (PNG ou JPG, até 200 KB)</label>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                {quadroLogo}
                <input id="arquivoLogotipo" name="arquivoLogotipo" type="file" accept="image/png,image/jpeg" onChange={escolherLogo} className="text-sm" />
                {logotipo && (
                  <button type="button" onClick={() => { setLogotipo(null); setLogoMudou(true); }} className={CLASSE_BOTAO_SECUNDARIO}>Remover</button>
                )}
              </div>
              <ErroCampo mensagem={erros.logotipo} />
            </div>
          </div>
          {erro && Object.keys(erros).length === 0 && <Mensagem tipo="erro">{erro}</Mensagem>}
          {sucesso && <Mensagem tipo="sucesso">{sucesso}</Mensagem>}
          <button type="submit" disabled={enviando} className={CLASSE_BOTAO_PRIMARIO}>{enviando ? "Salvando..." : "Salvar"}</button>
        </form>
      </Cartao>
      <Cartao titulo="Prévia do cabeçalho">
        <div className="flex items-center gap-3 border-b-2 border-marinho pb-3">
          {quadroLogo}
          <div className="min-w-0">
            <p className="font-bold">{previa.nome || "Nome da instituição"}</p>
            <p className="text-sm text-mudo">{[previa.cnpj && `CNPJ ${previa.cnpj}`, previa.endereco, previa.cidadeUf].filter(Boolean).join(" · ") || "CNPJ · endereço · cidade"}</p>
          </div>
        </div>
        {previa.responsavelSecretaria && (
          <p className="mx-auto mt-8 w-60 border-t border-texto pt-1.5 text-center text-xs">{previa.responsavelSecretaria}<br />Secretaria acadêmica</p>
        )}
      </Cartao>
    </div>
  );
}
