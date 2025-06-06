import { Projeto, AreaTematica, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma"; // Ajuste o caminho se necessário
import { CreateProjetoDTO, UpdateProjetoDTO, EvaluateProjetoDTO, SituacaoProjeto } from "../dto/projeto"; // Ajuste o caminho se necessário
import { IProjetoRepository } from "./interface/IProjetoRepository";



// Implementação concreta da interface IProjetoRepository utilizando Prisma.
export class ProjetoRepository implements IProjetoRepository {
  /**
   * Cria um novo projeto no banco de dados, conectando os autores fornecidos.
   */
  async create(data: CreateProjetoDTO): Promise<Projeto> {
    try {
      return await prisma.projeto.create({
        data: {
          titulo: data.titulo,
          areaTematica: data.areaTematica,
          resumo: data.resumo,
          situacao: data.situacao || SituacaoProjeto.SUBMETIDO,
          nota: 0,
          parecerDescritivo: "Pendente de avaliação.",
          premio: {
            connect: { id: data.premioId },
          },
          autores: {
            connect: data.autorIds.map((id) => ({ id })),
          }
        },
        include: {
          autores: true,
          premio: true,
          avaliador: true,
        },
      });
    } catch (error: any) {
      console.error("Erro ao criar projeto:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Check for foreign key constraint errors (e.g., non-existent author, premio, or avaliador)
        if (error.code === 'P2025') {
          throw new Error(`Erro ao criar projeto: Um ou mais Autores, Prêmio ou Avaliador não foram encontrados com os IDs fornecidos.`);
        }
      }
      throw new Error(`Erro ao criar projeto: ${error.message}`);
    }
  }

  /**
   * Busca um projeto pelo seu ID, incluindo autores, prêmio e avaliador.
   */
  async findById(id: number): Promise<Projeto | null> {
    try {
      return await prisma.projeto.findUnique({
        where: { id },
        include: { autores: true, premio: true, avaliador: true },
      });
    } catch (error: any) {
      console.error("Erro ao buscar projeto por ID:", error);
      throw new Error(`Erro ao buscar projeto por ID: ${error.message}`);
    }
  }

  /**
   * Busca um projeto pelo título e ID do prêmio.
   */
  async findByTituloAndPremio(titulo: string, premioId: number): Promise<Projeto | null> {
    try {
      return await prisma.projeto.findFirst({
        where: { titulo, premioId },
        include: { autores: true, premio: true, avaliador: true },
      });
    } catch (error: any) {
      console.error("Erro ao buscar projeto por título e prêmio:", error);
      throw new Error(`Erro ao buscar projeto por título e prêmio: ${error.message}`);
    }
  }

  /**
   * Busca todos os projetos.
   * @param apenasAtivos - Se true (padrão), retorna apenas projetos com status true.
   */
  async findAll(apenasAtivos: boolean = true): Promise<Projeto[]> {
    try {
      return await prisma.projeto.findMany({
        where: apenasAtivos ? { status: true } : undefined,
        include: { autores: true, premio: true, avaliador: true },
      });
    } catch (error: any) {
      console.error("Erro ao buscar todos os projetos:", error);
      throw new Error(`Erro ao buscar todos os projetos: ${error.message}`);
    }
  }

  /**
   * Atualiza os dados de um projeto existente.
   * Se 'autorIds' for fornecido, os autores existentes são substituídos pelos novos.
   * Trata campos 'nota' e 'parecerDescritivo' que podem ser 'null' no DTO:
   * se forem 'null', não são incluídos no payload de atualização,
   * significando "não atualizar este campo".
   */
  async update(id: number, data: UpdateProjetoDTO): Promise<Projeto> {
    const {
      autorIds,
      nota,
      parecerDescritivo,
      ...baseData // Resto dos campos do UpdateProjetoDTO
    } = data;

    try {
      const updatePayload: Prisma.ProjetoUpdateInput = { ...baseData };

      
      if (nota !== undefined && nota !== null) {
        updatePayload.nota = nota;
      }

     
      if (parecerDescritivo !== undefined && parecerDescritivo !== null) {
        updatePayload.parecerDescritivo = parecerDescritivo;
      }

      // Se autorIds for fornecido, atualiza a relação de autores.
      if (autorIds) {
        updatePayload.autores = {
          set: autorIds.map(authorId => ({ id: authorId }))
        };
      }

      return await prisma.projeto.update({
        where: { id },
        data: updatePayload,
        include: { autores: true, premio: true, avaliador: true },
      });
    } catch (error: any) {
      console.error("Erro ao atualizar projeto:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
            throw new Error(`Erro ao atualizar projeto: Registro não encontrado para atualização ou um dos IDs relacionados (autor, prêmio, avaliador) é inválido.`);
        }
      }
      throw new Error(`Erro ao atualizar projeto: ${error.message}`);
    }
  }

  /**
   * Realiza a "deleção lógica" de um projeto (marca status como false).
   */
  async delete(id: number): Promise<Projeto | null> {
    try {
      return await prisma.projeto.update({
        where: { id },
        data: { status: false },
        include: { autores: true, premio: true, avaliador: true },
      });
    } catch (error: any) {
      console.error("Erro ao deletar projeto:", error);
      throw new Error(`Erro ao deletar projeto: ${error.message}`);
    }
  }

  /**
   * Busca projetos por ID do avaliador.
   */
  async findByAvaliador(avaliadorId: number, apenasAtivos: boolean = true): Promise<Projeto[]> {
    try {
      return await prisma.projeto.findMany({
        where: {
          avaliadorId,
          ...(apenasAtivos && { status: true }),
        },
        include: { autores: true, premio: true, avaliador: true },
      });
    } catch (error: any) {
      console.error("Erro ao buscar projetos por avaliador:", error);
      throw new Error(`Erro ao buscar projetos por avaliador: ${error.message}`);
    }
  }

  /**
   * Busca projetos por ID do prémio.
   */
  async findByPremio(premioId: number, apenasAtivos: boolean = true): Promise<Projeto[]> {
    try {
      return await prisma.projeto.findMany({
        where: {
          premioId,
          ...(apenasAtivos && { status: true }),
        },
        include: { autores: true, premio: true, avaliador: true },
      });
    } catch (error: any) {
      console.error("Erro ao buscar projetos por prêmio:", error);
      throw new Error(`Erro ao buscar projetos por prêmio: ${error.message}`);
    }
  }

  /**
   * Busca projetos por área temática.
   */
  async findByAreaTematica(areaTematica: AreaTematica, apenasAtivos: boolean = true): Promise<Projeto[]> {
    try {
      return await prisma.projeto.findMany({
        where: {
          areaTematica,
          ...(apenasAtivos && { status: true }),
        },
        include: { autores: true, premio: true, avaliador: true },
      });
    } catch (error: any) {
      console.error("Erro ao buscar projetos por área temática:", error);
      throw new Error(`Erro ao buscar projetos por área temática: ${error.message}`);
    }
  }

  /**
   * Busca projetos por situação.
   */
  async findBySituacao(situacao: SituacaoProjeto, apenasAtivos: boolean = true): Promise<Projeto[]> {
     try {
      return await prisma.projeto.findMany({
        where: {
          situacao,
          ...(apenasAtivos && { status: true }),
        },
        include: { autores: true, premio: true, avaliador: true },
      });
    } catch (error: any) {
      console.error("Erro ao buscar projetos por situação:", error);
      throw new Error(`Erro ao buscar projetos por situação: ${error.message}`);
    }
  }

  /**
   * Busca projetos por ID de autor.
   */
  async findByAutor(autorId: number, apenasAtivos: boolean = true): Promise<Projeto[]> {
    try {
      return await prisma.projeto.findMany({
        where: {
          autores: { some: { id: autorId } },
          ...(apenasAtivos && { status: true }),
        },
        include: { autores: true, premio: true, avaliador: true },
      });
    } catch (error: any) {
      console.error("Erro ao buscar projetos por autor:", error);
      throw new Error(`Erro ao buscar projetos por autor: ${error.message}`);
    }
  }

  /**
   * Atualiza os dados de avaliação de um projeto (nota, parecerDescritivo, situacao).
   */
  async evaluate(id: number, data: EvaluateProjetoDTO): Promise<Projeto> {
    try {
      return await prisma.projeto.update({
        where: { id },
        data, // { nota, parecerDescritivo, situacao }
        include: { autores: true, premio: true, avaliador: true },
      });
    } catch (error: any) {
      console.error("Erro ao avaliar projeto:", error);
      throw new Error(`Erro ao avaliar projeto: ${error.message}`);
    }
  }

  /**
   * Conta o número de projetos por situação para um determinado prêmio (considerando apenas projetos ativos).
   */
  async countBySituacaoAndPremio(premioId: number, situacao: SituacaoProjeto): Promise<number> {
    try {
      return await prisma.projeto.count({
        where: {
          premioId,
          situacao,
          status: true, // Consider only active projects
        },
      });
    } catch (error: any) {
      console.error("Erro ao contar projetos por situação e prêmio:", error);
      throw new Error(`Erro ao contar projetos por situação e prêmio: ${error.message}`);
    }
  }

  /**
   * Adiciona um autor a um projeto.
   */
  async addAutorToProjeto(projetoId: number, autorId: number): Promise<Projeto> {
    try {
        return await prisma.projeto.update({
            where: { id: projetoId },
            data: {
                autores: {
                    connect: { id: autorId }, // Connects an existing author
                },
            },
            include: { autores: true, premio: true, avaliador: true },
        });
    } catch (error: any) {
        console.error("Erro ao adicionar autor ao projeto:", error);
        // P2025 can occur if the project or author to connect does not exist.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new Error(`Erro ao adicionar autor: Projeto com ID ${projetoId} ou Autor com ID ${autorId} não encontrado.`);
        }
        throw new Error(`Erro ao adicionar autor ao projeto: ${error.message}`);
    }
  }

  /**
   * Remove um autor de um projeto.
   */
  async removeAutorFromProjeto(projetoId: number, autorId: number): Promise<Projeto> {
      try {
          // First, check if the project exists to provide a clearer error message if not.
          const projeto = await prisma.projeto.findUnique({
              where: { id: projetoId },
              select: { autores: { select: { id: true } } } // Select only what's needed
          });

          if (!projeto) {
              throw new Error(`Erro ao remover autor: Projeto com ID ${projetoId} não encontrado.`);
          }

          return await prisma.projeto.update({
              where: { id: projetoId },
              data: {
                  autores: {
                      disconnect: { id: autorId }, // Disconnects an author
                  },
              },
              include: { autores: true, premio: true, avaliador: true },
          });
      } catch (error: any) {
          console.error("Erro ao remover autor do projeto:", error);
           // P2025 in disconnect usually means the main record (projeto) wasn't found.
           if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new Error(`Erro ao remover autor: Projeto com ID ${projetoId} não encontrado.`);
           }
          throw new Error(`Erro ao remover autor do projeto: ${error.message}`);
      }
  }
}