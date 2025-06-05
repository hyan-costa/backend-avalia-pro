import { Projeto, AreaTematica } from "@prisma/client";
import { CreateProjetoDTO, EvaluateProjetoDTO, SituacaoProjeto, UpdateProjetoDTO } from "../../dto/projeto";

// Interface que define as operações de persistência para a entidade Projeto.
export interface IProjetoRepository {
  /**
   * Cria um novo projeto no banco de dados.
   * @param data - Dados para a criação do projeto, incluindo IDs dos autores.
   * @returns O projeto criado.
   */
  create(data: CreateProjetoDTO): Promise<Projeto>;

  /**
   * Busca um projeto pelo seu ID.
   * @param id - O ID do projeto.
   * @returns O projeto encontrado ou null se não existir.
   */
  findById(id: number): Promise<Projeto | null>;

  /**
   * Busca um projeto pelo título e ID do prémio (para verificar duplicidade).
   * @param titulo - Título do projeto.
   * @param premioId - ID do prémio associado.
   * @returns O projeto encontrado ou null.
   */
  findByTituloAndPremio(titulo: string, premioId: number): Promise<Projeto | null>;

  /**
   * Busca todos os projetos, com opção de filtrar por ativos.
   * @param apenasAtivos - Se true (padrão), retorna apenas projetos com status true.
   * @returns Uma lista de projetos.
   */
  findAll(apenasAtivos?: boolean): Promise<Projeto[]>;

  /**
   * Atualiza os dados de um projeto existente.
   * @param id - O ID do projeto a ser atualizado.
   * @param data - Dados parciais para atualizar o projeto.
   * @returns O projeto atualizado.
   */
  update(id: number, data: UpdateProjetoDTO): Promise<Projeto>;

  /**
   * Realiza a "deleção lógica" de um projeto, marcando seu status como inativo.
   * @param id - O ID do projeto a ser inativado.
   * @returns O projeto inativado ou null se não for encontrado.
   */
  delete(id: number): Promise<Projeto | null>;

  /**
   * Busca projetos por ID do avaliador.
   * @param avaliadorId - ID do avaliador.
   * @param apenasAtivos - Se true (padrão), filtra por projetos ativos.
   * @returns Lista de projetos do avaliador.
   */
  findByAvaliador(avaliadorId: number, apenasAtivos?: boolean): Promise<Projeto[]>;

  /**
   * Busca projetos por ID do prémio.
   * @param premioId - ID do prémio.
   * @param apenasAtivos - Se true (padrão), filtra por projetos ativos.
   * @returns Lista de projetos do prémio.
   */
  findByPremio(premioId: number, apenasAtivos?: boolean): Promise<Projeto[]>;

  /**
   * Busca projetos por área temática.
   * @param areaTematica - Área temática do projeto.
   * @param apenasAtivos - Se true (padrão), filtra por projetos ativos.
   * @returns Lista de projetos da área temática.
   */
  findByAreaTematica(areaTematica: AreaTematica, apenasAtivos?: boolean): Promise<Projeto[]>;

  /**
   * Busca projetos por situação.
   * @param situacao - Situação do projeto.
   * @param apenasAtivos - Se true (padrão), filtra por projetos ativos.
   * @returns Lista de projetos com a situação especificada.
   */
  findBySituacao(situacao: SituacaoProjeto, apenasAtivos?: boolean): Promise<Projeto[]>;

  /**
   * Busca projetos por ID de autor.
   * @param autorId - ID do autor.
   * @param apenasAtivos - Se true (padrão), filtra por projetos ativos.
   * @returns Lista de projetos do autor.
   */
  findByAutor(autorId: number, apenasAtivos?: boolean): Promise<Projeto[]>;

  /**
   * Atualiza os dados de avaliação de um projeto.
   * @param id - O ID do projeto a ser avaliado.
   * @param data - Dados da avaliação (nota, parecer, situação).
   * @returns O projeto com os dados de avaliação atualizados.
   */
  evaluate(id: number, data: EvaluateProjetoDTO): Promise<Projeto>;

  /**
   * Conta o número de projetos por situação para um determinado prêmio.
   * @param premioId - O ID do prêmio.
   * @param situacao - A situação do projeto.
   * @returns O número de projetos.
   */
  countBySituacaoAndPremio(premioId: number, situacao: SituacaoProjeto): Promise<number>;

  /**
   * Adiciona um autor a um projeto.
   * @param projetoId O ID do projeto.
   * @param autorId O ID do autor.
   * @returns O projeto atualizado.
   */
  addAutorToProjeto(projetoId: number, autorId: number): Promise<Projeto>;

    /**
   * Remove um autor de um projeto.
   * @param projetoId O ID do projeto.
   * @param autorId O ID do autor.
   * @returns O projeto atualizado.
   */
  removeAutorFromProjeto(projetoId: number, autorId: number): Promise<Projeto>;
}
