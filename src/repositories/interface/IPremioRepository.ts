import { Premio, Projeto } from "@prisma/client";
import { CreatePremioDTO, UpdatePremioDTO } from "../../dto/premio";

// Interface que define as operações de persistência para a entidade Premio.
export interface IPremioRepository {
  /**
   * Cria um novo prémio no banco de dados.
   * @param data - Dados para a criação do prémio.
   * @returns O prémio criado.
   */
  create(data: CreatePremioDTO): Promise<Premio>;

  /**
   * Busca um prémio pelo seu ID.
   * @param id - O ID do prémio.
   * @returns O prémio encontrado ou null se não existir.
   */
  findById(id: number): Promise<Premio | null>;

  /**
   * Busca um prémio pelo seu nome e ano de edição.
   * @param nome - O nome do prémio.
   * @param anoEdicao - O ano de edição do prémio.
   * @returns O prémio encontrado ou null se não existir.
   */
  findByNomeAndAno(nome: string, anoEdicao: number): Promise<Premio | null>;

  /**
   * Busca todos os prémios ativos.
   * @returns Uma lista de prémios ativos.
   */
  findAll(apenasAtivos?: boolean): Promise<Premio[]>;

  /**
   * Atualiza os dados de um prémio existente.
   * @param id - O ID do prémio a ser atualizado.
   * @param data - Dados parciais para atualizar o prémio.
   * @returns O prémio atualizado.
   */
  update(id: number, data: UpdatePremioDTO): Promise<Premio>;

  /**
   * Realiza a "deleção lógica" de um prémio, marcando seu status como inativo.
   * @param id - O ID do prémio a ser inativado.
   * @returns O prémio inativado ou null se não for encontrado.
   */
  delete(id: number): Promise<Premio | null>;

  /**
   * Retorna todos os projetos associados a um prémio específico.
   * @param premioId - O ID do prémio.
   * @returns Uma lista de projetos do prémio.
   */
  getProjetosByPremio(premioId: number): Promise<Projeto[]>;

  /**
   * Conta o número total de projetos ativos associados a um prémio específico.
   * @param premioId - O ID do prémio.
   * @returns O número total de projetos do prémio.
   */
  countProjetosByPremio(premioId: number): Promise<number>;

   /**
   * Busca prémios por ano de edição.
   * @param anoEdicao - O ano de edição.
   * @returns Uma lista de prémios daquele ano.
   */
  findByAnoEdicao(anoEdicao: number): Promise<Premio[]>;
}
