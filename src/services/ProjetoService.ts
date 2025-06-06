import { Projeto, AreaTematica, Autor, Premio, Avaliador, Prisma } from "@prisma/client";
import { CreateProjetoDTO, UpdateProjetoDTO, EvaluateProjetoDTO, SituacaoProjeto } from "../dto/projeto"; // Ajuste o caminho
import { IProjetoRepository } from "../repositories/interface/IProjetoRepository";
import { IAutorRepository } from "../repositories/interface/IAutorRepository";
import { IPremioRepository } from "../repositories/interface/IPremioRepository";
import { IAvaliadorRepository } from "../repositories/interface/IAvaliadorRepository";



// Define um tipo para Projeto que inclui suas relações carregadas
type ProjetoComRelacoes = Prisma.ProjetoGetPayload<{
  include: { autores: true; premio: true; avaliador: true };
}>;

export class ProjetoService {
  constructor(
    private readonly projetoRepository: IProjetoRepository,
    private readonly autorRepository: IAutorRepository,
    private readonly premioRepository: IPremioRepository,
    private readonly avaliadorRepository: IAvaliadorRepository
  ) {}

  /**
   * Cria um novo projeto.
   * @returns O projeto criado com suas relações.
   */
  async createProjeto(data: CreateProjetoDTO): Promise<ProjetoComRelacoes> {
    const { titulo, premioId, autorIds } = data;

    const premio = await this.premioRepository.findById(premioId);
    if (!premio || !premio.status) {
      throw new Error("Prêmio não encontrado, inativo ou inválido.");
    }

    

    if (!autorIds || autorIds.length === 0) {
        throw new Error("O projeto deve ter pelo menos um autor.");
    }
    for (const autorId of autorIds) {
      const autor = await this.autorRepository.findById(autorId);
      if (!autor || !autor.status) {
        throw new Error(`Autor com ID ${autorId} não encontrado, inativo ou inválido.`);
      }
    }
    
    const projetoExistente = await this.projetoRepository.findByTituloAndPremio(titulo, premioId);
    if (projetoExistente) {
      throw new Error(`Projeto com título "${titulo}" já existe para este prêmio.`);
    }
    
    try {
      const novoProjeto = await this.projetoRepository.create({
          ...data,
          situacao: data.situacao || SituacaoProjeto.SUBMETIDO
      });
      // Assumindo que o método 'create' do repositório retorna o projeto com relações incluídas.
      // Se não, a chamada ao repositório também precisa garantir a inclusão.
      return novoProjeto as ProjetoComRelacoes;
    } catch (error: any) {
      console.error("Erro no serviço ao criar projeto:", error);
      throw new Error(`Não foi possível criar o projeto: ${error.message}`);
    }
  }

  /**
   * Busca um projeto pelo ID.
   * @returns O projeto encontrado com suas relações.
   */
  async getProjetoById(id: number): Promise<ProjetoComRelacoes> {
    const projeto = await this.projetoRepository.findById(id);
    if (!projeto) {
      throw new Error("Projeto não encontrado.");
    }
    if (!projeto.status) { 
      throw new Error("Projeto encontrado, mas está inativo.");
    }
    // Assumindo que o método 'findById' do repositório retorna o projeto com relações incluídas.
    return projeto as ProjetoComRelacoes;
  }

  /**
   * Lista todos os projetos.
   * @returns Uma lista de projetos com suas relações.
   */
  async listProjetos(apenasAtivos: boolean = true): Promise<ProjetoComRelacoes[]> {
    try {
      const projetos = await this.projetoRepository.findAll(apenasAtivos);
      // Assumindo que o método 'findAll' do repositório retorna os projetos com relações incluídas.
      return projetos as ProjetoComRelacoes[];
    } catch (error: any) {
      console.error("Erro no serviço ao listar projetos:", error);
      throw new Error(`Não foi possível listar os projetos: ${error.message}`);
    }
  }

  /**
   * Atualiza os dados de um projeto.
   * @returns O projeto atualizado com suas relações.
   */
  async updateProjeto(id: number, data: UpdateProjetoDTO): Promise<ProjetoComRelacoes> {
    const projetoAtual = await this.getProjetoById(id); 

    const novoTitulo = data.titulo ?? projetoAtual.titulo;
    const novoPremioId = data.premioId ?? projetoAtual.premioId;

    if (data.titulo !== undefined || data.premioId !== undefined) {
        if (novoTitulo !== projetoAtual.titulo || novoPremioId !== projetoAtual.premioId) {
            const projetoExistenteComNovoTitulo = await this.projetoRepository.findByTituloAndPremio(novoTitulo, novoPremioId);
            if (projetoExistenteComNovoTitulo && projetoExistenteComNovoTitulo.id !== id) {
                throw new Error(`Já existe um projeto com o título "${novoTitulo}" para o prêmio selecionado.`);
            }
        }
    }

    if (data.premioId && data.premioId !== projetoAtual.premioId) {
      const premio = await this.premioRepository.findById(data.premioId);
      if (!premio || !premio.status) throw new Error("Novo prêmio não encontrado ou inativo.");
    }
    if (data.avaliadorId && data.avaliadorId !== projetoAtual.avaliadorId) {
      const avaliador = await this.avaliadorRepository.findById(data.avaliadorId);
      if (!avaliador || !avaliador.status) throw new Error("Novo avaliador não encontrado ou inativo.");
    }
    if (data.autorIds) {
       if (data.autorIds.length === 0) {
        throw new Error("O projeto deve ter pelo menos um autor.");
      }
      for (const autorId of data.autorIds) {
        const autor = await this.autorRepository.findById(autorId);
        if (!autor || !autor.status) throw new Error(`Autor com ID ${autorId} (para atualização) não encontrado ou inativo.`);
      }
    }

    try {
      const projetoAtualizado = await this.projetoRepository.update(id, data);
      // Assumindo que o método 'update' do repositório retorna o projeto com relações incluídas.
      return projetoAtualizado as ProjetoComRelacoes;
    } catch (error: any) {
      console.error("Erro no serviço ao atualizar projeto:", error);
      throw new Error(`Não foi possível atualizar o projeto: ${error.message}`);
    }
  }

  /**
   * Inativa um projeto (soft delete).
   */
  async deleteProjeto(id: number): Promise<string> {
    const projeto = await this.projetoRepository.findById(id); 
    if (!projeto) {
      throw new Error("Projeto não encontrado.");
    }
    if (!projeto.status) {
      return "Projeto já estava inativo."; 
    }

    try {
      await this.projetoRepository.delete(id);
      return "Projeto inativado com sucesso.";
    } catch (error: any) {
      console.error("Erro no serviço ao deletar projeto:", error);
      throw new Error(`Não foi possível inativar o projeto: ${error.message}`);
    }
  }

  /**
   * Avalia um projeto.
   * @returns O projeto avaliado com suas relações.
   */
  async evaluateProjeto(id: number, avaliacaoData: EvaluateProjetoDTO): Promise<ProjetoComRelacoes> {
    const projeto = await this.getProjetoById(id); 

    if (avaliacaoData.nota < 0 || avaliacaoData.nota > 10) { 
        throw new Error("Nota da avaliação deve estar entre 0 e 10 (ou sua escala definida).");
    }

    const situacoesValidasAvaliacao = [
        SituacaoProjeto.AVALIADO_APROVADO, 
        SituacaoProjeto.AVALIADO_REPROVADO, 
        SituacaoProjeto.PENDENTE_AJUSTES
    ];
    if (!situacoesValidasAvaliacao.includes(avaliacaoData.situacao)) {
        throw new Error(`Situação "${avaliacaoData.situacao}" inválida para uma avaliação. Use uma das seguintes: ${situacoesValidasAvaliacao.join(', ')}.`);
    }

    if (projeto.situacao !== SituacaoProjeto.EM_AVALIACAO && projeto.situacao !== SituacaoProjeto.PENDENTE_AJUSTES && projeto.situacao !== SituacaoProjeto.SUBMETIDO) {
       console.warn(`Projeto ID ${id} está sendo avaliado mas sua situação atual é ${projeto.situacao}. Esperado: ${SituacaoProjeto.EM_AVALIACAO} ou ${SituacaoProjeto.PENDENTE_AJUSTES}.`);
    }

    try {
      const projetoAvaliado = await this.projetoRepository.evaluate(id, avaliacaoData);
      // Assumindo que o método 'evaluate' do repositório retorna o projeto com relações incluídas.
      return projetoAvaliado as ProjetoComRelacoes;
    } catch (error: any) {
      console.error("Erro no serviço ao avaliar projeto:", error);
      throw new Error(`Não foi possível avaliar o projeto: ${error.message}`);
    }
  }

  /**
   * Busca projetos por ID do avaliador.
   * @returns Lista de projetos com suas relações.
   */
  async getProjetosByAvaliador(avaliadorId: number, apenasAtivos: boolean = true): Promise<ProjetoComRelacoes[]> {
     const avaliador = await this.avaliadorRepository.findById(avaliadorId);
     if (!avaliador) throw new Error("Avaliador não encontrado.");
    try {
      const projetos = await this.projetoRepository.findByAvaliador(avaliadorId, apenasAtivos);
      return projetos as ProjetoComRelacoes[];
    } catch (error: any) {
      console.error("Erro ao buscar projetos por avaliador:", error);
      throw new Error(`Erro ao buscar projetos por avaliador: ${error.message}`);
    }
  }

  /**
   * Busca projetos por ID do prêmio.
   * @returns Lista de projetos com suas relações.
   */
  async getProjetosByPremio(premioId: number, apenasAtivos: boolean = true): Promise<ProjetoComRelacoes[]> {
    const premio = await this.premioRepository.findById(premioId);
    if (!premio) throw new Error("Prêmio não encontrado.");

    try {
      const projetos = await this.projetoRepository.findByPremio(premioId, apenasAtivos);
      return projetos as ProjetoComRelacoes[];
    } catch (error: any) {
      console.error("Erro ao buscar projetos por prêmio:", error);
      throw new Error(`Erro ao buscar projetos por prêmio: ${error.message}`);
    }
  }

  /**
   * Busca projetos por área temática.
   * @returns Lista de projetos com suas relações.
   */
  async getProjetosByAreaTematica(areaTematica: AreaTematica, apenasAtivos: boolean = true): Promise<ProjetoComRelacoes[]> {
    try {
      const projetos = await this.projetoRepository.findByAreaTematica(areaTematica, apenasAtivos);
      return projetos as ProjetoComRelacoes[];
    } catch (error: any) {
      console.error("Erro ao buscar projetos por área temática:", error);
      throw new Error(`Erro ao buscar projetos por área temática: ${error.message}`);
    }
  }

   /**
   * Busca projetos por situação.
   * @returns Lista de projetos com suas relações.
   */
  async getProjetosBySituacao(situacao: SituacaoProjeto, apenasAtivos: boolean = true): Promise<ProjetoComRelacoes[]> {
    try {
      const projetos = await this.projetoRepository.findBySituacao(situacao, apenasAtivos);
      return projetos as ProjetoComRelacoes[];
    } catch (error: any) {
      console.error("Erro ao buscar projetos por situação:", error);
      throw new Error(`Erro ao buscar projetos por situação: ${error.message}`);
    }
  }

  /**
   * Busca projetos por ID de autor.
   * @returns Lista de projetos com suas relações.
   */
  async getProjetosByAutor(autorId: number, apenasAtivos: boolean = true): Promise<ProjetoComRelacoes[]> {
    const autor = await this.autorRepository.findById(autorId);
    if(!autor) throw new Error("Autor não encontrado.");

    try {
      const projetos = await this.projetoRepository.findByAutor(autorId, apenasAtivos);
      return projetos as ProjetoComRelacoes[];
    } catch (error: any) {
      console.error("Erro ao buscar projetos por autor:", error);
      throw new Error(`Erro ao buscar projetos por autor: ${error.message}`);
    }
  }

  /**
   * Conta projetos por situação para um determinado prêmio.
   */
  async countProjetosBySituacaoAndPremio(premioId: number, situacao: SituacaoProjeto): Promise<number> {
    const premio = await this.premioRepository.findById(premioId);
    if (!premio) throw new Error("Prêmio não encontrado.");

    try {
        return await this.projetoRepository.countBySituacaoAndPremio(premioId, situacao);
    } catch (error: any) {
        console.error("Erro ao contar projetos por situação e prêmio:", error);
        throw new Error(`Erro ao contar projetos: ${error.message}`);
    }
  }

  /**
   * Adiciona um autor a um projeto.
   * @returns O projeto atualizado com suas relações.
   */
  async addAutor(projetoId: number, autorId: number): Promise<ProjetoComRelacoes> {
    const projeto = await this.getProjetoById(projetoId); 
    const autor = await this.autorRepository.findById(autorId);
    if (!autor || !autor.status) {
        throw new Error(`Autor com ID ${autorId} não encontrado ou inativo.`);
    }

    const autorJaExisteNoProjeto = projeto.autores.some(a => a.id === autorId);
    if (autorJaExisteNoProjeto) {
        throw new Error(`Autor com ID ${autorId} já está associado a este projeto.`);
    }

    try {
        const projetoAtualizado = await this.projetoRepository.addAutorToProjeto(projetoId, autorId);
        // Assumindo que o método 'addAutorToProjeto' do repositório retorna o projeto com relações incluídas.
        return projetoAtualizado as ProjetoComRelacoes;
    } catch (error: any) {
        console.error("Erro no serviço ao adicionar autor ao projeto:", error);
        throw new Error(`Não foi possível adicionar autor ao projeto: ${error.message}`);
    }
  }

  /**
   * Remove um autor de um projeto.
   * @returns O projeto atualizado com suas relações.
   */
  async removeAutor(projetoId: number, autorId: number): Promise<ProjetoComRelacoes> {
      const projeto = await this.getProjetoById(projetoId); 
      const autor = await this.autorRepository.findById(autorId); 
      if (!autor) {
          throw new Error(`Autor com ID ${autorId} não encontrado.`);
      }

      const autorExisteNoProjeto = projeto.autores.some(a => a.id === autorId);
      if (!autorExisteNoProjeto) {
          throw new Error(`Autor com ID ${autorId} não está associado a este projeto.`);
      }

      if (projeto.autores.length <= 1 && autorExisteNoProjeto) {
          throw new Error("Não é possível remover o último autor do projeto. Adicione outro autor primeiro ou delete o projeto.");
      }

      try {
          const projetoAtualizado = await this.projetoRepository.removeAutorFromProjeto(projetoId, autorId);
          // Assumindo que o método 'removeAutorFromProjeto' do repositório retorna o projeto com relações incluídas.
          return projetoAtualizado as ProjetoComRelacoes;
      } catch (error: any) {
          console.error("Erro no serviço ao remover autor do projeto:", error);
          throw new Error(`Não foi possível remover autor do projeto: ${error.message}`);
      }
  }

}
