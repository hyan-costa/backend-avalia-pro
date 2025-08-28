import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repositories/UserRepository";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { CreateUserDTO } from "../dto/user";
dotenv.config();

const userRepository = new UserRepository();

export class UserController {
  private userService = new UserService(userRepository);

  async create(req: Request, res: Response) {
    try {
      const data: CreateUserDTO = req.body;
      const user = await this.userService.createUser(data);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;
      const user = await this.userService.login(email, senha);

      if (!user) {
        res.status(401).json({ error: "Credenciais inválidas" });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET as string;
      if (!jwtSecret) {
        res.status(500).json({ error: "Configuração do servidor inválida" });
        return;
      }

      const payload = {
        id: Number(user.id),
        email: String(user.email),
      };

      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: "1d",
      });

      res.json({ token });
    } catch (error: any) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async get(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const user = await this.userService.getUser(id);
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }
    res.json(user);
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const data = req.body;
    const user = await this.userService.updateUser(id, data);
    res.json(user);
  }
}
