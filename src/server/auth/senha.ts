// Hash de senha com bcrypt (RNF-02, DA-06, INV-001-02).
import bcrypt from "bcryptjs";

const CUSTO_BCRYPT = 10;

export function gerarHashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, CUSTO_BCRYPT);
}

export function conferirSenha(senha: string, senhaHash: string): Promise<boolean> {
  return bcrypt.compare(senha, senhaHash);
}
