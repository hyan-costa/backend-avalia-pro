import { Autor, Projeto } from "@prisma/client";
import { CreateAutorDTO, UpdateAutorDTO } from "../../dto/autor";

// Interface que define as operações de persistência para a entidade Autor.
export interface IAutorRepository {
  /**
   * Cria um novo autor no banco de dados.
   * @param data - Dados para a criação do autor.
   * @returns O autor criado.
   */
  create(data: CreateAutorDTO): Promise<Autor>;

  /**
   * Busca um autor pelo seu ID.
   * @param id - O ID do autor.
   * @returns O autor encontrado ou null se não existir.
   */
  findById(id: number): Promise<Autor | null>;

  /**
   * Busca um autor pelo seu CPF.
   * @param cpf - O CPF do autor.
   * @returns O autor encontrado ou null se não existir.
   */
  findByCPF(cpf: string): Promise<Autor | null>;

  /**
   * Busca um autor pelo seu email.
   * @param email - O email do autor.
   * @returns O autor encontrado ou null se não existir.
   */
  findByEmail(email: string): Promise<Autor | null>;

  /**
   * Busca todos os autores ativos.
   * @returns Uma lista de autores ativos.
   */
  findAll(): Promise<Autor[]>;

  /**
   * Atualiza os dados de um autor existente.
   * @param id - O ID do autor a ser atualizado.
   * @param data - Dados parciais para atualizar o autor.
   * @returns O autor atualizado.
   */
  update(id: number, data: UpdateAutorDTO): Promise<Autor>;

  /**
   * Realiza a "deleção lógica" de um autor, marcando seu status como inativo.
   * @param id - O ID do autor a ser inativado.
   * @returns O autor inativado ou null se não for encontrado.
   */
  delete(id: number): Promise<Autor | null>;

  /**
   * Retorna todos os projetos associados a um autor específico.
   * @param autorId - O ID do autor.
   * @returns Uma lista de projetos do autor.
   */
  getProjetosByAutor(autorId: number): Promise<Projeto[]>;

  /**
   * Conta o número total de projetos ativos associados a um autor específico.
   * @param autorId - O ID do autor.
   * @returns O número total de projetos do autor.
   */
  countProjetosByAutor(autorId: number): Promise<number>;

  /**
   * Conta o número total de projetos ativos associados a um autor específico.
   * @param autorId - O ID do autor.
   * @returns A média de pontuação.
   */
  mediaNotas(autorId: number): Promise<number | null>;
}