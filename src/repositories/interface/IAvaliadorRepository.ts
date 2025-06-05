import { Avaliador, Projeto } from "@prisma/client";
import { CreateAvaliadorDTO } from "../../dto/avaliador";

export interface IAvaliadorRepository {
  create(data: CreateAvaliadorDTO): Promise<Avaliador>;
  findById(id: number): Promise<Avaliador | null>;
  findByCPF(cpf: string): Promise<Avaliador | null>;
  findByEmail(email: string): Promise<Avaliador | null>;
  findAll(): Promise<Avaliador[]>;
  delete(id: number): Promise<Avaliador | null>;
  countProjetosByAvaliador(avaliadorId: number): Promise<number>;
  getProjetosByAvaliador(avaliadorId: number): Promise<Projeto[]>;
  mediaNotas(avaliadorId: number): Promise<number | null>;
  update(id: number, data: Partial<CreateAvaliadorDTO>): Promise<Avaliador>;
}
