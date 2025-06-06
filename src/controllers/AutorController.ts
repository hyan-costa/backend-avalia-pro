import { Request, Response } from "express";
import { AutorService } from "../services/AutorService";
import { AutorRepository } from "../repositories/AutorRepository";
import { CreateAutorDTO } from "../dto/autor";

// Instanciação do repositório e do serviço
const autorRepository = new AutorRepository();
const autorService = new AutorService(autorRepository);

export class AutorController {
  /**
   * Cria um novo autor.
   */
  async create(req: Request, res: Response) {
    try {
      const data: CreateAutorDTO = req.body;
      const autor = await autorService.createAutor(data);
      res.status(201).json(autor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Busca um autor pelo ID.
   */
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const autor = await autorService.getAutorById(id);
      if (!autor) {
        res.status(404).json({ error: "Autor não encontrado" });
        return;
      }
      res.json(autor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Lista todos os autores ativos.
   */
  async list(req: Request, res: Response) {
    try {
      const autores = await autorService.listAutores();
      res.json(autores);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualiza os dados de um autor.
   */
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = req.body;
      const autorAtualizado = await autorService.updateAutor(id, data);
      res.json(autorAtualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Deleta (inativa) um autor.
   */
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await autorService.deleteAutor(id);
      res.status(204).send(); // Resposta de sucesso sem conteúdo
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

    async mediaNotas(req: Request, res: Response) {
        try {
        const id = Number(req.params.id);
        const media = await autorService.mediaNotas(id);
        res.json({ media });
        } catch (error: any) {
        res.status(500).json({ error: error.message });
        }
    }
}