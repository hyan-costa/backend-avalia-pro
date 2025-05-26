import { Usuario } from "@prisma/client";

export interface IUserRepository {
  create(
    data: Omit<Usuario, "id" | "createdAt" | "updatedAt" | "status">
  ): Promise<Usuario>;
  findById(
    id: number
  ): Promise<Pick<
    Usuario,
    "id" | "nome" | "email" | "createdAt" | "updatedAt"
  > | null>;
  update(id: number, data: Partial<Usuario>): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
}
