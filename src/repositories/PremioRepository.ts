import { Premio, Projeto } from "@prisma/client";
import { IPremioRepository } from "./interface/IPremioRepository";
import { CreatePremioDTO, UpdatePremioDTO } from "../dto/premio";
import { prisma } from "../config/prisma";


// Implementação concreta da interface IPremioRepository utilizando Prisma.
export class PremioRepository implements IPremioRepository {
  /**
   * Cria um novo prémio no banco de dados.
   * @param data - Dados para a criação do prémio.
   * @returns O prémio criado.
   * @throws Error se ocorrer um erro durante a criação.
   */
  async create(data: CreatePremioDTO): Promise<Premio> {
    try {
      return await prisma.premio.create({ data });
    } catch (error: any) {
      console.error("Erro ao criar prémio:", error);
      throw new Error(`Erro ao criar prémio: ${error.message}`);
    }
  }

  /**
   * Busca um prémio pelo seu ID.
   * @param id - O ID do prémio.
   * @returns O prémio encontrado ou null se não existir.
   * @throws Error se ocorrer um erro durante a busca.
   */
  async findById(id: number): Promise<Premio | null> {
    try {
      return await prisma.premio.findUnique({
        where: { id },
        include: { projetos: { where: { status: true } } }, // Inclui projetos ativos
      });
    } catch (error: any) {
      console.error("Erro ao buscar prémio por ID:", error);
      throw new Error(`Erro ao buscar prémio por ID: ${error.message}`);
    }
  }

  /**
   * Busca um prémio pelo seu nome e ano de edição.
   * @param nome - O nome do prémio.
   * @param anoEdicao - O ano de edição do prémio.
   * @returns O prémio encontrado ou null se não existir.
   * @throws Error se ocorrer um erro durante a busca.
   */
  async findByNomeAndAno(nome: string, anoEdicao: number): Promise<Premio | null> {
    try {
      return await prisma.premio.findFirst({ // Não há unique constraint para nome+anoEdicao, usamos findFirst
        where: { nome, anoEdicao },
      });
    } catch (error: any) {
      console.error("Erro ao buscar prémio por nome e ano:", error);
      throw new Error(`Erro ao buscar prémio por nome e ano: ${error.message}`);
    }
  }

  /**
   * Busca todos os prémios.
   * @param apenasAtivos - Se true, retorna apenas prémios ativos. Default é true.
   * @returns Uma lista de prémios.
   * @throws Error se ocorrer um erro durante a busca.
   */
  async findAll(apenasAtivos: boolean = true): Promise<Premio[]> {
    try {
      return await prisma.premio.findMany({
        where: apenasAtivos ? { status: true } : undefined,
        include: { projetos: { where: { status: true } } }, // Inclui projetos ativos
      });
    } catch (error: any) {
      console.error("Erro ao buscar todos os prémios:", error);
      throw new Error(`Erro ao buscar todos os prémios: ${error.message}`);
    }
  }

  /**
   * Atualiza os dados de um prémio existente.
   * @param id - O ID do prémio a ser atualizado.
   * @param data - Dados parciais para atualizar o prémio.
   * @returns O prémio atualizado.
   * @throws Error se ocorrer um erro durante a atualização.
   */
  async update(id: number, data: UpdatePremioDTO): Promise<Premio> {
    try {
      return await prisma.premio.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar prémio:", error);
      throw new Error(`Erro ao atualizar prémio: ${error.message}`);
    }
  }

  /**
   * Realiza a "deleção lógica" de um prémio, marcando seu status como inativo.
   * Os projetos associados a este prémio NÃO são inativados automaticamente por esta operação.
   * A lógica de negócio para tratar projetos de um prémio inativado deve ser feita no service.
   * @param id - O ID do prémio a ser inativado.
   * @returns O prémio inativado ou null se não for encontrado.
   * @throws Error se ocorrer um erro durante a deleção.
   */
  async delete(id: number): Promise<Premio | null> {
    try {
      // Verifica se há projetos ativos vinculados ao prémio
      const projetosAtivos = await prisma.projeto.count({
        where: {
          premioId: id,
          status: true,
        },
      });

      if (projetosAtivos > 0) {
        // Idealmente, esta verificação deveria estar no service layer,
        // mas para evitar deleção acidental com impacto em projetos, adicionamos aqui.
        // O service pode ter uma lógica mais elaborada (ex: desvincular projetos ou inativá-los).
        throw new Error(
          `Não é possível inativar o prémio pois existem ${projetosAtivos} projetos ativos vinculados.`
        );
      }

      return await prisma.premio.update({
        where: { id },
        data: { status: false },
      });
    } catch (error: any) {
      console.error("Erro ao deletar prémio:", error);
      throw new Error(`Erro ao deletar prémio: ${error.message}`);
    }
  }

  /**
   * Retorna todos os projetos ativos associados a um prémio específico.
   * @param premioId - O ID do prémio.
   * @returns Uma lista de projetos ativos do prémio.
   * @throws Error se ocorrer um erro durante a busca.
   */
  async getProjetosByPremio(premioId: number): Promise<Projeto[]> {
    try {
      const premioComProjetos = await prisma.premio.findUnique({
        where: { id: premioId, status: true }, // Busca apenas prémio ativo
        include: {
          projetos: {
            where: { status: true }, // Busca apenas projetos ativos
          },
        },
      });
      return premioComProjetos?.projetos ?? [];
    } catch (error: any) {
      console.error("Erro ao buscar projetos do prémio:", error);
      throw new Error(`Erro ao buscar projetos do prémio: ${error.message}`);
    }
  }

  /**
   * Conta o número total de projetos ativos associados a um prémio específico.
   * @param premioId - O ID do prémio.
   * @returns O número total de projetos ativos do prémio.
   * @throws Error se ocorrer um erro durante a contagem.
   */
  async countProjetosByPremio(premioId: number): Promise<number> {
    try {
      const count = await prisma.projeto.count({
        where: {
          premioId: premioId,
          premio: { status: true }, // Garante que o prémio também esteja ativo
          status: true, // Considera apenas projetos ativos
        },
      });
      return count;
    } catch (error: any) {
      console.error("Erro ao contar projetos do prémio:", error);
      throw new Error(`Erro ao contar projetos do prémio: ${error.message}`);
    }
  }

  /**
   * Busca prémios por ano de edição.
   * @param anoEdicao - O ano de edição.
   * @returns Uma lista de prémios daquele ano.
   * @throws Error se ocorrer um erro durante a busca.
   */
  async findByAnoEdicao(anoEdicao: number): Promise<Premio[]> {
    try {
      return await prisma.premio.findMany({
        where: {
          anoEdicao: anoEdicao,
          status: true, // Retorna apenas prémios ativos por padrão
        },
        include: { projetos: { where: { status: true } } },
      });
    } catch (error: any) {
      console.error("Erro ao buscar prémios por ano de edição:", error);
      throw new Error(`Erro ao buscar prémios por ano de edição: ${error.message}`);
    }
  }
}