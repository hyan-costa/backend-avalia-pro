import { Avaliador, Projeto } from "@prisma/client";
import { CreateAvaliadorDTO } from "../dto/avaliador";
import { IAvaliadorRepository } from "../repositories/IAvaliadorRepository";

export class AvaliadorService {
  constructor(private readonly avaliadorRepository: IAvaliadorRepository) {}

  async createAvaliador(avaliador: CreateAvaliadorDTO): Promise<Avaliador> {
    if (await this.avaliadorRepository.findByCPF(avaliador.cpf)) {
      throw new Error("Avaliador com esse CPF já existe");
    }
    if (await this.avaliadorRepository.findByEmail(avaliador.email)) {
      throw new Error("Avaliador com esse Email já existe");
    }

    return this.avaliadorRepository.create(avaliador);
  }

  async getAvaliadorById(id: number): Promise<Avaliador | null> {
    const avaliador = await this.avaliadorRepository.findById(id);
    if (!avaliador || !avaliador.status) {
      throw new Error("Avaliador não encontrado ou inativo");
    }
    return avaliador;
  }

  async listAvaliadores(): Promise<Avaliador[]> {
    return this.avaliadorRepository.findAll();
  }

  async deleteAvaliador(id: number): Promise<string> {
    const avaliador = await this.avaliadorRepository.findById(id);
    if (!avaliador || !avaliador.status) {
      throw new Error("Avaliador não encontrado ou já inativo");
    }

    const avaliadorInativo = await this.avaliadorRepository.delete(id);
    if (!avaliadorInativo?.status) {
      return "Avaliador inativado com sucesso";
    } else {
      throw new Error("erro ao inativar avaliador");
    }
  }

  async countProjetos(avaliadorId: number): Promise<number> {
    return this.avaliadorRepository.countProjetosByAvaliador(avaliadorId);
  }

  async getProjetos(avaliadorId: number): Promise<Projeto[]> {
    return this.avaliadorRepository.getProjetosByAvaliador(avaliadorId);
  }

  async mediaNotas(avaliadorId: number): Promise<number | null> {
    return this.avaliadorRepository.mediaNotas(avaliadorId);
  }


  async updateAvaliador(id: number, data: Partial<CreateAvaliadorDTO>): Promise<Avaliador> {
  const avaliador = await this.avaliadorRepository.findById(id);
  if (!avaliador || !avaliador.status) {
    throw new Error("Avaliador não encontrado ou inativo");
  }

  return this.avaliadorRepository.update(id, data);
}
}
