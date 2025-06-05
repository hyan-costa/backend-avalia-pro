import { Autor, Projeto } from "@prisma/client";
import { CreateAutorDTO, UpdateAutorDTO } from "../dto/autor";
import { IAutorRepository } from "../repositories/interface/IAutorRepository";

// Classe de serviço para encapsular a lógica de negócios relacionada a Autores.
export class AutorService {

  constructor(private readonly autorRepository: IAutorRepository) {}

  /**
   * Cria um novo autor.
   * Verifica se já existe um autor com o mesmo CPF ou Email.
   * @param data - Dados para criação do autor.
   * @returns O autor criado.
   * @throws Error se o CPF ou Email já estiverem cadastrados.
   */
  async createAutor(data: CreateAutorDTO): Promise<Autor> {
    const { cpf, email } = data;

    const autorByCPF = await this.autorRepository.findByCPF(cpf);
    if (autorByCPF) {
      throw new Error("Autor com este CPF já existe."); // 409 Conflict
    }

    const autorByEmail = await this.autorRepository.findByEmail(email);
    if (autorByEmail) {
      throw new Error("Autor com este Email já existe.");
    }

    try {
      return await this.autorRepository.create(data);
    } catch (error: any) {
      console.error("Erro no serviço ao criar autor:", error);
      throw new Error(`Não foi possível criar o autor: ${error.message}`);
    }
  }

  /**
   * Busca um autor pelo ID.
   * @param id - O ID do autor.
   * @returns O autor encontrado.
   * @throws Error se o autor não for encontrado ou estiver inativo.
   */
  async getAutorById(id: number): Promise<Autor> {
    const autor = await this.autorRepository.findById(id);
    if (!autor || !autor.status) {
      throw new Error("Autor não encontrado ou inativo."); // 404 Not Found
    }
    return autor;
  }

  /**
   * Lista todos os autores ativos.
   * @returns Uma lista de autores.
   * @throws Error em caso de erro na listagem.
   */
  async listAutores(): Promise<Autor[]> {
    try {
      return await this.autorRepository.findAll();
    } catch (error: any) {
      console.error("Erro no serviço ao listar autores:", error);
      throw new Error(`Não foi possível listar os autores: ${error.message}`);
    }
  }

  /**
   * Atualiza os dados de um autor.
   * @param id - O ID do autor a ser atualizado.
   * @param data - Dados para atualização.
   * @returns O autor atualizado.
   * @throws Error se o autor não for encontrado, estiver inativo, ou se houver conflito de CPF/Email.
   */
  async updateAutor(id: number, data: UpdateAutorDTO): Promise<Autor> {
    const autorExistente = await this.autorRepository.findById(id);
    if (!autorExistente || !autorExistente.status) {
      throw new Error("Autor não encontrado ou inativo.");
    }

    // Verifica conflito de CPF, se estiver sendo alterado
    if (data.cpf && data.cpf !== autorExistente.cpf) {
      const conflitoCPF = await this.autorRepository.findByCPF(data.cpf);
      if (conflitoCPF && conflitoCPF.id !== id) {
        throw new Error("CPF já cadastrado para outro autor.");
      }
    }

    // Verifica conflito de Email, se estiver sendo alterado
    if (data.email && data.email !== autorExistente.email) {
      const conflitoEmail = await this.autorRepository.findByEmail(data.email);
      if (conflitoEmail && conflitoEmail.id !== id) {
        throw new Error("Email já cadastrado para outro autor.");
      }
    }

    try {
      return await this.autorRepository.update(id, data);
    } catch (error: any) {
      console.error("Erro no serviço ao atualizar autor:", error);
      throw new Error(`Não foi possível atualizar o autor: ${error.message}`);
    }
  }

  /**
   * Inativa um autor (soft delete).
   * @param id - O ID do autor a ser inativado.
   * @returns Mensagem de sucesso.
   * @throws Error se o autor não for encontrado ou já estiver inativo.
   */
  async deleteAutor(id: number): Promise<string> {
    const autor = await this.autorRepository.findById(id);
    if (!autor || !autor.status) {
      throw new Error("Autor não encontrado ou já está inativo.");
    }

    try {
      const autorInativado = await this.autorRepository.delete(id);
      if (autorInativado && !autorInativado.status) {
        return "Autor inativado com sucesso.";
      } else {
        // Este caso teoricamente não deveria acontecer se o delete no repositório funcionar
        throw new Error("Erro ao inativar o autor.");
      }
    } catch (error: any) {
      console.error("Erro no serviço ao deletar autor:", error);
      // Se for um AppError vindo do repositório, repassa. Senão, cria um novo.
      if (error instanceof Error) throw error;
      throw new Error(`Não foi possível inativar o autor: ${error.message}`);
    }
  }

  /**
   * Obtém todos os projetos ativos de um autor específico.
   * @param autorId - O ID do autor.
   * @returns Uma lista de projetos.
   * @throws Error se o autor não for encontrado ou se houver erro na busca.
   */
  async getProjetosDoAutor(autorId: number): Promise<Projeto[]> {
    const autor = await this.autorRepository.findById(autorId);
    if (!autor || !autor.status) {
      throw new Error("Autor não encontrado ou inativo.");
    }
    try {
      return await this.autorRepository.getProjetosByAutor(autorId);
    } catch (error: any) {
      console.error("Erro no serviço ao buscar projetos do autor:", error);
      throw new Error(`Não foi possível buscar os projetos do autor: ${error.message}`);
    }
  }

  /**
   * Conta o número de projetos ativos de um autor específico.
   * @param autorId - O ID do autor.
   * @returns O número de projetos.
   * @throws Error se o autor não for encontrado ou se houver erro na contagem.
   */
  async countProjetosDoAutor(autorId: number): Promise<number> {
    const autor = await this.autorRepository.findById(autorId);
    if (!autor || !autor.status) {
      throw new Error("Autor não encontrado ou inativo.");
    }
    try {
      return await this.autorRepository.countProjetosByAutor(autorId);
    } catch (error: any) {
      console.error("Erro no serviço ao contar projetos do autor:", error);
      throw new Error(`Não foi possível contar os projetos do autor: ${error.message}`);
    }
  }
}
