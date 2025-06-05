import { Avaliador, Projeto } from "@prisma/client";
import { IAvaliadorRepository } from "./interface/IAvaliadorRepository";
import { prisma } from "../config/prisma";
import { CreateAvaliadorDTO } from "../dto/avaliador";

export class AvaliadorRepository implements IAvaliadorRepository {
  async create(data: CreateAvaliadorDTO): Promise<Avaliador> {
    try {
      return prisma.avaliador.create({ data });
    } catch (error: any) {
      throw new Error("Erro ao criar avaliador." + error.message);
    }
  }
  async findByEmail(email: string): Promise<Avaliador | null> {
    try {
      return prisma.avaliador.findUnique({ where: { email } });
    } catch (error: any) {
      throw new Error("Erro ao buscar avaliador." + error.message);
    }
  }
  async findByCPF(cpf: string): Promise<Avaliador | null> {
    try {
      return prisma.avaliador.findUnique({ where: { cpf } });
    } catch (error: any) {
      throw new Error("Erro ao buscar avaliador." + error.message);
    }
  }
  async findById(id: number): Promise<Avaliador | null> {
    try {
      return prisma.avaliador.findUnique({
        where: { id },
      });
    } catch (error: any) {
      throw new Error("Erro ao buscar avaliador." + error.message);
    }
  }

  async findAll(): Promise<Avaliador[]> {
    try {
      return prisma.avaliador.findMany({
        where: { status: true },
      });
    } catch (error: any) {
      throw new Error("Erro ao buscar avaliadores." + error.message);
    }
  }

  async delete(id: number): Promise<Avaliador | null> {
    try {
      return prisma.avaliador.update({
        where: { id },
        data: { status: false },
      });
    } catch (error: any) {
      throw new Error("Erro ao deletar avaliador." + error.message);
    }
  }

  async countProjetosByAvaliador(avaliadorId: number): Promise<number> {
    try {
      const total = await prisma.projeto.count({
        where: {
          avaliadorId: avaliadorId,
          status: true,
        },
      });
      return total;
    } catch (error: any) {
      throw new Error("Erro ao contar projetos do avaliador: " + error.message);
    }
  }

  async getProjetosByAvaliador(avaliadorId: number): Promise<Projeto[]> {
    try {
      const avaliadorComProjetos = await prisma.avaliador.findUnique({
        where: { id: avaliadorId },
        include: { projeto: { where: { status: true } } },
      });

      return avaliadorComProjetos?.projeto ?? [];
    } catch (error: any) {
      throw new Error("Erro ao buscar projetos do avaliador: " + error.message);
    }
  }

  async mediaNotas(avaliadorId: number): Promise<number | null> {
    try {
      const resultado = await prisma.projeto.aggregate({
        where: {
          avaliadorId,
        },
        _avg: {
          nota: true,
        },
      });
      return resultado._avg.nota;
    } catch (error: any) {
      throw new Error(
        "Erro ao buscar média dos projetos do avaliador: " + error.message
      );
    }
  }

  async update(id: number, data: Partial<CreateAvaliadorDTO>): Promise<Avaliador> {
  try {
    return await prisma.avaliador.update({
      where: { id },
      data,
    });
  } catch (error: any) {
    throw new Error("Erro ao atualizar avaliador: " + error.message);
  }
}
}
