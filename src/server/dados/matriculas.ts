// SPEC-031 / RB-30 (OPEN-053): matrícula trancada ou cancelada sai das listas de trabalho (chamada, notas,
// entregas, planos, dashboards, alertas, relatórios e comunicados) e continua no boletim e no histórico.
// Este é o filtro único usado por essas consultas (INV-031-02).
import type { Prisma } from "@prisma/client";

export const MATRICULA_CURSANDO = { situacao: "Cursando" } as const satisfies Prisma.MatriculaWhereInput;
