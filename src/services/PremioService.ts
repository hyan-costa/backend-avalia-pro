import { Premio, Projeto } from "@prisma/client";
import { CreatePremioDTO, UpdatePremioDTO } from "../dto/premio"; // Ajuste o caminho
import { IPremioRepository } from "../repositories/interface/IPremioRepository";
 // Supondo que você tenha um manipulador de erros customizado

// Classe de serviço para encapsular a lógica de negócios relacionada a Prémios.
export class PremioService {
  // Injeção de dependência do repositório de Prémio.
  constructor(private readonly premioRepository: IPremioRepository) {}

  /**
   * Cria um novo prémio.
   * Verifica se já existe um prémio com o mesmo nome e ano de edição.
   * Valida se a data de fim é posterior à data de início.
   * @param data - Dados para criação do prémio.
   * @returns O prémio criado.
   * @throws Error se já existir um prémio com o mesmo nome e ano, ou se as datas forem inválidas.
   */
  async createPremio(data: CreatePremioDTO): Promise<Premio> {
    const { nome, anoEdicao, dataInicio, dataFim } = data;

    const premioExistente = await this.premioRepository.findByNomeAndAno(nome, anoEdicao);
    if (premioExistente) {
      throw new Error(`Prémio "${nome}" já existe para o ano de ${anoEdicao}.`); // 409 Conflict
    }

    if (new Date(dataFim) <= new Date(dataInicio)) {
      throw new Error("A data de fim deve ser posterior à data de início."); // 400 Bad Request
    }

    try {
      return await this.premioRepository.create(data);
    } catch (error: any) {
      console.error("Erro no serviço ao criar prémio:", error);
      throw new Error(`Não foi possível criar o prémio: ${error.message}`);
    }
  }

  /**
   * Busca um prémio pelo ID.
   * @param id - O ID do prémio.
   * @returns O prémio encontrado.
   * @throws Error se o prémio não for encontrado ou estiver inativo.
   */
  async getPremioById(id: number): Promise<Premio> {
    const premio = await this.premioRepository.findById(id);
    if (!premio || !premio.status) {
      throw new Error("Prémio não encontrado ou inativo."); // 404 Not Found
    }
    return premio;
  }

  /**
   * Lista todos os prémios, opcionalmente filtrando apenas os ativos.
   * @param apenasAtivos - Se true (padrão), retorna apenas prémios ativos.
   * @returns Uma lista de prémios.
   * @throws Error em caso de erro na listagem.
   */
  async listPremios(apenasAtivos: boolean = true): Promise<Premio[]> {
    try {
      return await this.premioRepository.findAll(apenasAtivos);
    } catch (error: any) {
      console.error("Erro no serviço ao listar prémios:", error);
      throw new Error(`Não foi possível listar os prémios: ${error.message}`);
    }
  }

  /**
   * Atualiza os dados de um prémio.
   * @param id - O ID do prémio a ser atualizado.
   * @param data - Dados para atualização.
   * @returns O prémio atualizado.
   * @throws Error se o prémio não for encontrado, estiver inativo, ou se houver conflito de nome/ano ou datas inválidas.
   */
  async updatePremio(id: number, data: UpdatePremioDTO): Promise<Premio> {
    const premioExistente = await this.premioRepository.findById(id);
    if (!premioExistente || !premioExistente.status) {
      throw new Error("Prémio não encontrado ou inativo.");
    }

    // Valida consistência das datas se ambas forem fornecidas
    const dataInicio = data.dataInicio ? new Date(data.dataInicio) : new Date(premioExistente.dataInicio);
    const dataFim = data.dataFim ? new Date(data.dataFim) : new Date(premioExistente.dataFim);

    if (dataFim <= dataInicio) {
      throw new Error("A data de fim deve ser posterior à data de início.");
    }
    
    // Verifica conflito de nome e ano de edição, se estiverem sendo alterados
    const nomeAtualizado = data.nome ?? premioExistente.nome;
    const anoEdicaoAtualizado = data.anoEdicao ?? premioExistente.anoEdicao;

    if ((data.nome || data.anoEdicao) && (nomeAtualizado !== premioExistente.nome || anoEdicaoAtualizado !== premioExistente.anoEdicao) ) {
        const conflitoNomeAno = await this.premioRepository.findByNomeAndAno(nomeAtualizado, anoEdicaoAtualizado);
        if (conflitoNomeAno && conflitoNomeAno.id !== id) {
            throw new Error(`Prémio "${nomeAtualizado}" já existe para o ano de ${anoEdicaoAtualizado}.`);
        }
    }


    try {
      return await this.premioRepository.update(id, data);
    } catch (error: any) {
      console.error("Erro no serviço ao atualizar prémio:", error);
      throw new Error(`Não foi possível atualizar o prémio: ${error.message}`);
    }
  }

  /**
   * Inativa um prémio (soft delete).
   * Verifica se há projetos ativos vinculados antes de inativar.
   * @param id - O ID do prémio a ser inativado.
   * @returns Mensagem de sucesso.
   * @throws Error se o prémio não for encontrado, já estiver inativo, ou se tiver projetos ativos vinculados.
   */
  async deletePremio(id: number): Promise<string> {
    const premio = await this.premioRepository.findById(id);
    if (!premio || !premio.status) {
      throw new Error("Prémio não encontrado ou já está inativo.");
    }

    const projetosVinculados = await this.premioRepository.countProjetosByPremio(id);
    if (projetosVinculados > 0) {
      throw new Error(
        `Não é possível inativar o prémio. Existem ${projetosVinculados} projetos ativos vinculados a ele. Considere inativar ou desvincular os projetos primeiro.`
      );
    }

    try {
      const premioInativado = await this.premioRepository.delete(id); // O repositório já faz a verificação de projetos, mas reforçamos aqui.
      if (premioInativado && !premioInativado.status) {
        return "Prémio inativado com sucesso.";
      } else {
        throw new Error("Erro ao inativar o prémio.");
      }
    } catch (error: any) {
      console.error("Erro no serviço ao deletar prémio:", error);
      if (error instanceof Error) throw error;
      throw new Error(`Não foi possível inativar o prémio: ${error.message}`);
    }
  }

  /**
   * Obtém todos os projetos ativos de um prémio específico.
   * @param premioId - O ID do prémio.
   * @returns Uma lista de projetos.
   * @throws Error se o prémio não for encontrado ou se houver erro na busca.
   */
  async getProjetosDoPremio(premioId: number): Promise<Projeto[]> {
    const premio = await this.premioRepository.findById(premioId);
    if (!premio || !premio.status) { // Verifica se o prémio em si está ativo
      throw new Error("Prémio não encontrado ou inativo.");
    }
    try {
      return await this.premioRepository.getProjetosByPremio(premioId);
    } catch (error: any) {
      console.error("Erro no serviço ao buscar projetos do prémio:", error);
      throw new Error(`Não foi possível buscar os projetos do prémio: ${error.message}`);
    }
  }

  /**
   * Conta o número de projetos ativos de um prémio específico.
   * @param premioId - O ID do prémio.
   * @returns O número de projetos.
   * @throws Error se o prémio não for encontrado ou se houver erro na contagem.
   */
  async countProjetosDoPremio(premioId: number): Promise<number> {
    const premio = await this.premioRepository.findById(premioId);
     if (!premio || !premio.status) { // Verifica se o prémio em si está ativo
      throw new Error("Prémio não encontrado ou inativo.");
    }
    try {
      return await this.premioRepository.countProjetosByPremio(premioId);
    } catch (error: any) {
      console.error("Erro no serviço ao contar projetos do prémio:", error);
      throw new Error(`Não foi possível contar os projetos do prémio: ${error.message}`);
    }
  }

  /**
   * Busca prémios ativos por ano de edição.
   * @param anoEdicao - O ano de edição.
   * @returns Uma lista de prémios.
   * @throws Error em caso de erro na busca.
   */
  async getPremiosByAnoEdicao(anoEdicao: number): Promise<Premio[]> {
    if (isNaN(anoEdicao) || anoEdicao <= 0) {
        throw new Error("Ano de edição inválido.");
    }
    try {
      return await this.premioRepository.findByAnoEdicao(anoEdicao);
    } catch (error: any) {
      console.error("Erro no serviço ao buscar prémios por ano:", error);
      throw new Error(`Não foi possível buscar os prémios por ano: ${error.message}`);
    }
  }
}