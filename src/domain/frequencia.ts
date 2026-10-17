// Validação do percentual de frequência (SPEC-005, RF-07; faixa de OPEN-002).
// A classificação por frequência (RB-05) continua só em situacao-academica.ts.
import type { Validacao } from "./estrutura-academica";

export const MENSAGEM_FREQUENCIA_INVALIDA = "Informe uma frequência de 0 a 100%.";

// Aceita número ou texto numérico; vírgula decimal ("74,5") e símbolo "%" são aceitos.
export function validarPercentualFrequencia(entrada: unknown): Validacao<number> {
  let valor = NaN;
  if (typeof entrada === "number") valor = entrada;
  else if (typeof entrada === "string") {
    const texto = entrada.trim().replace("%", "").replace(",", ".").trim();
    valor = texto === "" ? NaN : Number(texto);
  }
  if (!Number.isFinite(valor) || valor < 0 || valor > 100) {
    return { ok: false, erros: { percentual: MENSAGEM_FREQUENCIA_INVALIDA } };
  }
  return { ok: true, dados: valor };
}
