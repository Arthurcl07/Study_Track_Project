// Carrega DATABASE_URL e JWT_SECRET do .env local para os testes de integração.
import { config } from "dotenv";

config({ quiet: true });

// SPEC-017: toda turma é de um período letivo (chave estrangeira pelo nome). Os testes usam "2026/2", que em
// banco novo (CI) ainda não existe; os períodos criados pelos próprios testes começam com "19" e são apagados.
import { prisma } from "@/server/dados/prisma";

await prisma.periodoLetivo.upsert({ where: { nome: "2026/2" }, update: {}, create: { nome: "2026/2" } });
