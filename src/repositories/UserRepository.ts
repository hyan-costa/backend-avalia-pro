import { Usuario, Role } from "@prisma/client";
import { IUserRepository } from "./interface/IUserRepository";
import { prisma } from "../config/prisma";

export class UserRepository implements IUserRepository {
  async create(
    data: Pick<Usuario, "nome" | "email" | "senha" | "role">
  ): Promise<Usuario> {
    return prisma.usuario.create({ data });
  }

  async findById(
    id: number
  ): Promise<Pick<
    Usuario,
    "id" | "nome" | "email" | "createdAt" | "updatedAt"
  > | null> {
    var usuario = prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nome: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { email } });
  }

  async update(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
    return prisma.usuario.update({
      where: { id },
      data,
    });
  }
}
