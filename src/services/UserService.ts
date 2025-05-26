import { Usuario } from "@prisma/client";
import { IUserRepository } from "../repositories/IUserRepository";
import bcrypt from "bcryptjs";

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(
    nome: string, 
    email: string,
    senha: string
  ): Promise<Usuario> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error("Usuário já existe com esse e-mail");
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    return this.userRepository.create({ nome, email, senha: hashedPassword });
  }

  async login(email: string, senha: string): Promise<Usuario | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(senha, user.senha);
    if (!isValid) return null;

    return user;
  }

  async getUser(id: number): Promise<Pick<Usuario, 'id' | 'nome' | 'email' | 'createdAt' | 'updatedAt'> | null> {
    return this.userRepository.findById(id);
  }

  async updateUser(
    id: number,
    data: Partial<Usuario>
  ): Promise<Usuario | null> {
    return this.userRepository.update(id, data);
  }
}
