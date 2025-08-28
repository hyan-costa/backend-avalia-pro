import { Usuario, Role } from "@prisma/client";
import { IUserRepository } from "../repositories/interface/IUserRepository";
import bcrypt from "bcryptjs";
import { CreateUserDTO } from "../dto/user";

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(data: CreateUserDTO): Promise<Usuario> {
    const { nome, email, password, role } = data;

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error("Usuário já existe com esse e-mail");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userRole = role || Role.USER;

    return this.userRepository.create({
      nome,
      email,
      senha: hashedPassword,
      role: userRole
    });
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
