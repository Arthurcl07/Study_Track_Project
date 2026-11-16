// Teste de desempenho (SPEC-054, RNF-01): entra com cada perfil e mede P50, P95 e máximo das páginas e APIs
// principais com requisições simultâneas, com a faculdade povoada. P95 de 3 s ou mais sai em vermelho e o script
// termina com código 1 (AC-054-02). Rode contra o build de produção: `npm run build`, `npm run start` e
// `npm run carga` (ou `npm run carga -- http://outro-endereco:3000 30` para mudar a URL e o número de requisições).
// Sem dependência nova: só o fetch do Node. Nada é gravado, a não ser o aceite dos termos das contas usadas.
const URL_BASE = process.argv[2] ?? "http://localhost:3000";
const REQUISICOES = Number(process.argv[3] ?? 20);
const SIMULTANEAS = 5;
const LIMITE_MS = 3000;
const SENHA = "StudyTrack@2026";

// A coordenadora Marina fica de fora de propósito: ela mostra o primeiro acesso na apresentação.
const ROTEIRO: { perfil: string; email: string; caminhos: string[] }[] = [
  { perfil: "Estudante", email: "estudante@studytrack.test", caminhos: ["/estudante", "/estudante/curso", "/estudante/documentos", "/requerimentos", "/api/painel"] },
  { perfil: "Professor", email: "professor@studytrack.test", caminhos: ["/professor", "/professor/notas", "/professor/frequencia", "/relatorios"] },
  { perfil: "Coordenador", email: "paula.martins@studytrack.test", caminhos: ["/coordenador", "/relatorios", "/evasao", "/coordenador/acompanhamento", "/api/relatorios/excel"] },
  { perfil: "Administrador", email: "admin@studytrack.test", caminhos: ["/admin", "/admin/estudantes", "/evasao", "/admin/saude", "/requerimentos"] },
];

const cor = { vermelho: "\x1b[31m", verde: "\x1b[32m", amarelo: "\x1b[33m", fim: "\x1b[0m" };

async function entrar(email: string): Promise<string> {
  const resposta = await fetch(`${URL_BASE}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, senha: SENHA }) });
  if (!resposta.ok) throw new Error(`Login de ${email} falhou (${resposta.status}). Rode o seed: npm run seed`);
  const cookie = (resposta.headers.get("set-cookie") ?? "").split(";")[0];
  const { destino } = await resposta.json();
  if (destino === "/termos/aceite") {
    await fetch(`${URL_BASE}/api/termos/aceite`, { method: "POST", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify({ versao: "1.0" }) });
  }
  return cookie;
}

function percentil(tempos: number[], p: number) {
  const ordenados = [...tempos].sort((a, b) => a - b);
  return ordenados[Math.min(ordenados.length - 1, Math.ceil((p / 100) * ordenados.length) - 1)];
}

async function medir(caminho: string, cookie: string) {
  const tempos: number[] = [];
  let falhas = 0;
  let proxima = 0;
  async function trabalhador() {
    while (proxima < REQUISICOES) {
      proxima++;
      const inicio = performance.now();
      const resposta = await fetch(`${URL_BASE}${caminho}`, { headers: { cookie }, redirect: "manual" }).catch(() => null);
      await resposta?.arrayBuffer().catch(() => null);
      tempos.push(performance.now() - inicio);
      if (!resposta || resposta.status >= 400 || resposta.status === 307) falhas++;
    }
  }
  await Promise.all(Array.from({ length: SIMULTANEAS }, trabalhador));
  return { p50: percentil(tempos, 50), p95: percentil(tempos, 95), max: Math.max(...tempos), falhas };
}

async function main() {
  console.log(`Teste de carga do StudyTrack em ${URL_BASE}: ${REQUISICOES} requisições por tela, ${SIMULTANEAS} simultâneas. Limite: P95 < ${LIMITE_MS / 1000} s.\n`);
  // Aquece o servidor (a primeira requisição de cada rota compila ou carrega o código).
  const linhas: string[] = [];
  let acimaDoLimite = 0;
  for (const { perfil, email, caminhos } of ROTEIRO) {
    const cookie = await entrar(email);
    for (const caminho of caminhos) {
      await fetch(`${URL_BASE}${caminho}`, { headers: { cookie } }).then((r) => r.arrayBuffer()).catch(() => null);
      const r = await medir(caminho, cookie);
      const ruim = r.p95 >= LIMITE_MS || r.falhas > 0;
      if (ruim) acimaDoLimite++;
      const tom = ruim ? cor.vermelho : r.p95 >= 1000 ? cor.amarelo : cor.verde;
      linhas.push(`${tom}${perfil.padEnd(14)}${caminho.padEnd(32)}${`${Math.round(r.p50)} ms`.padStart(9)}${`${Math.round(r.p95)} ms`.padStart(10)}${`${Math.round(r.max)} ms`.padStart(10)}${r.falhas ? `  ${r.falhas} falha(s)` : ""}${cor.fim}`);
      console.log(linhas.at(-1));
    }
  }
  console.log(`\n${"Perfil".padEnd(14)}${"Tela".padEnd(32)}${"P50".padStart(9)}${"P95".padStart(10)}${"Máximo".padStart(10)}`);
  for (const l of linhas) console.log(l);
  if (acimaDoLimite > 0) {
    console.log(`\n${cor.vermelho}${acimaDoLimite} tela(s) acima do limite (RNF-01).${cor.fim}`);
    process.exit(1);
  }
  console.log(`\n${cor.verde}Todas as telas com P95 abaixo de ${LIMITE_MS / 1000} s (RNF-01).${cor.fim}`);
}

main().catch((erro) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
