import { Autor, Projeto } from "@prisma/client";
import { CreateAutorDTO, UpdateAutorDTO } from "../dto/autor";
import { IAutorRepository } from "./interface/IAutorRepository";
import { prisma } from "../config/prisma";

// Implementação concreta da interface IAutorRepository utilizando Prisma.
export class AutorRepository implements IAutorRepository {

  /**
   * Cria um novo autor no banco de dados.
   * @param data - Dados para a criação do autor.
   * @returns O autor criado.
   * @throws Error se ocorrer um erro durante a criação.
   */
  async create(data: CreateAutorDTO): Promise<Autor> {
    try {
      return await prisma.autor.create({ data });
    } catch (error: any) {
      console.error("Erro ao criar autor:", error);
      throw new Error(`Erro ao criar autor: ${error.message}`);
    }
  }

  /**
   * Busca um autor pelo seu ID.
   * @param id - O ID do autor.
   * @returns O autor encontrado ou null se não existir.
   * @throws Error se ocorrer um erro durante a busca.
   */
  async findById(id: number): Promise<Autor | null> {
    try {
      return await prisma.autor.findUnique({
        where: { id },
      });
    } catch (error: any) {
      console.error("Erro ao buscar autor por ID:", error);
      throw new Error(`Erro ao buscar autor por ID: ${error.message}`);
    }
  }

  /**
   * Busca um autor pelo seu CPF.
   * @param cpf - O CPF do autor.
   * @returns O autor encontrado ou null se não existir.
   * @throws Error se ocorrer um erro durante a busca.
   */
  async findByCPF(cpf: string): Promise<Autor | null> {
    try {
      return await prisma.autor.findUnique({
        where: { cpf },
      });
    } catch (error: any) {
      console.error("Erro ao buscar autor por CPF:", error);
      throw new Error(`Erro ao buscar autor por CPF: ${error.message}`);
    }
  }

  /**
   * Busca um autor pelo seu email.
   * @param email - O email do autor.
   * @returns O autor encontrado ou null se não existir.
   * @throws Error se ocorrer um erro durante a busca.
   */
  async findByEmail(email: string): Promise<Autor | null> {
    try {
      return await prisma.autor.findUnique({
        where: { email },
      });
    } catch (error: any) {
      console.error("Erro ao buscar autor por Email:", error);
      throw new Error(`Erro ao buscar autor por Email: ${error.message}`);
    }
  }

  /**
   * Busca todos os autores ativos (status: true).
   * @returns Uma lista de autores ativos.
   * @throws Error se ocorrer um erro durante a busca.
   */
  async findAll(): Promise<Autor[]> {
    try {
      return await prisma.autor.findMany({
        where: { status: true },
        include: { projetos: { where: { status: true } } }, // Inclui projetos ativos do autor
      });
    } catch (error: any) {
      console.error("Erro ao buscar todos os autores:", error);
      throw new Error(`Erro ao buscar todos os autores: ${error.message}`);
    }
  }

  /**
   * Atualiza os dados de um autor existente.
   * @param id - O ID do autor a ser atualizado.
   * @param data - Dados parciais para atualizar o autor.
   * @returns O autor atualizado.
   * @throws Error se ocorrer um erro durante a atualização.
   */
  async update(id: number, data: UpdateAutorDTO): Promise<Autor> {
    try {
      return await prisma.autor.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar autor:", error);
      throw new Error(`Erro ao atualizar autor: ${error.message}`);
    }
  }

  /**
   * Realiza a "deleção lógica" de um autor, marcando seu status como inativo.
   * Também inativa os projetos associados a este autor.
   * @param id - O ID do autor a ser inativado.
   * @returns O autor inativado ou null se não for encontrado.
   * @throws Error se ocorrer um erro durante a deleção.
   */
  async delete(id: number): Promise<Autor | null> {
    try {
      // Transação para garantir atomicidade: inativar autor e seus projetos
      return await prisma.$transaction(async (tx) => {
        // Inativa os projetos do autor
        await tx.projeto.updateMany({
          where: {
            autores: {
              some: { id: id }
            }
          },
          data: { status: false },
        });

        // Inativa o autor
        const autorInativado = await tx.autor.update({
          where: { id },
          data: { status: false },
        });

        return autorInativado;
      });
    } catch (error: any) {
      console.error("Erro ao deletar autor:", error);
      throw new Error(`Erro ao deletar autor: ${error.message}`);
    }
  }

  /**
   * Retorna todos os projetos ativos associados a um autor específico.
   * @param autorId - O ID do autor.
   * @returns Uma lista de projetos ativos do autor.
   * @throws Error se ocorrer um erro durante a busca.
   */
  async getProjetosByAutor(autorId: number): Promise<Projeto[]> {
    try {
      const autorComProjetos = await prisma.autor.findUnique({
        where: { id: autorId, status: true }, // Busca apenas autor ativo
        include: {
          projetos: {
            where: { status: true }, // Busca apenas projetos ativos
          },
        },
      });
      return autorComProjetos?.projetos ?? [];
    } catch (error: any) {
      console.error("Erro ao buscar projetos do autor:", error);
      throw new Error(`Erro ao buscar projetos do autor: ${error.message}`);
    }
  }

  /**
   * Conta o número total de projetos ativos associados a um autor específico.
   * @param autorId - O ID do autor.
   * @returns O número total de projetos ativos do autor.
   * @throws Error se ocorrer um erro durante a contagem.
   */
  async countProjetosByAutor(autorId: number): Promise<number> {
    try {
      const count = await prisma.projeto.count({
        where: {
          status: true, // Considera apenas projetos ativos
          autores: {
            some: {
              id: autorId,
              status: true, // Garante que o autor também esteja ativo
            },
          },
        },
      });
      return count;
    } catch (error: any) {
      console.error("Erro ao contar projetos do autor:", error);
      throw new Error(`Erro ao contar projetos do autor: ${error.message}`);
    }
  }


  async mediaNotas(autorId: number): Promise<number | null> {
    try {
    const resultado = await prisma.projeto.aggregate({
      where: {
        autores:{
          some:{
            id:autorId
          }
        }
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
}
