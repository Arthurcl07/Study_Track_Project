-- CreateEnum
CREATE TYPE "CategoriaAuditoria" AS ENUM ('Administrativa', 'Acadêmica');

-- CreateTable
CREATE TABLE "RegistroAuditoria" (
    "id" TEXT NOT NULL,
    "categoria" "CategoriaAuditoria" NOT NULL,
    "acao" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "antes" JSONB,
    "depois" JSONB,
    "autorId" TEXT NOT NULL,
    "cursoId" TEXT,
    "turmaId" TEXT,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistroAuditoria_categoria_registradoEm_idx" ON "RegistroAuditoria"("categoria", "registradoEm");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_cursoId_registradoEm_idx" ON "RegistroAuditoria"("cursoId", "registradoEm");

-- AddForeignKey
ALTER TABLE "RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;
