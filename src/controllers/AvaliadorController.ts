import { Request, Response } from "express";
import { AvaliadorService } from "../services/AvaliadorService";
import { AvaliadorRepository } from "../repositories/AvaliadorRepository";
import { CreateAvaliadorDTO } from "../dto/avaliador";

const avaliadorRepository = new AvaliadorRepository();
const avaliadorService = new AvaliadorService(avaliadorRepository);

export class AvaliadorController {
  async create(req: Request, res: Response) {
    try {
      const data: CreateAvaliadorDTO = req.body;
      const avaliador = await avaliadorService.createAvaliador(data);
      res.status(201).json(avaliador);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const avaliador = await avaliadorService.getAvaliadorById(id);
      if (!avaliador) {
        res.status(404).json({ error: "Avaliador não encontrado" });
        return;
      }
      res.json(avaliador);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const avaliadores = await avaliadorService.listAvaliadores();
      res.json(avaliadores);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await avaliadorService.deleteAvaliador(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async countProjetos(req: Request, res: Response) {
    try {
      const avaliadorId = Number(req.params.id);
      const count = await avaliadorService.countProjetos(avaliadorId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProjetos(req: Request, res: Response) {
    try {
      const avaliadorId = Number(req.params.id);
      const projetos = await avaliadorService.getProjetos(avaliadorId);
      res.json(projetos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async mediaNotas(req: Request, res: Response) {
    try {
      const avaliadorId = Number(req.params.id);
      const media = await avaliadorService.mediaNotas(avaliadorId);
      res.json({ media });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }


  async update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await avaliadorService.updateAvaliador(id, data);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
}
