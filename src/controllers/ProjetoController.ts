import { Request, Response } from "express";
import { ProjetoService } from "../services/ProjetoService";
import { ProjetoRepository } from "../repositories/ProjetoRepository";
import { AutorRepository } from "../repositories/AutorRepository";
import { PremioRepository } from "../repositories/PremioRepository";
import { AvaliadorRepository } from "../repositories/AvaliadorRepository";
import { CreateProjetoDTO, UpdateProjetoDTO, EvaluateProjetoDTO, SituacaoProjeto } from "../dto/projeto";
import { AreaTematica } from "@prisma/client";

// --- Injeção de Dependências ---
const projetoRepository = new ProjetoRepository();
const autorRepository = new AutorRepository();
const premioRepository = new PremioRepository();
const avaliadorRepository = new AvaliadorRepository();

const projetoService = new ProjetoService(
  projetoRepository,
  autorRepository,
  premioRepository,
  avaliadorRepository
);

export class ProjetoController {
  // --- Métodos CRUD ---

  async create(req: Request, res: Response) {
    try {
      const { premioId, ...rest } = req.body;
      const data: CreateProjetoDTO = {
        ...rest,
        premioId: Number(premioId)
      };
      const projeto = await projetoService.createProjeto(data);
      res.status(201).json(projeto);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const projeto = await projetoService.getProjetoById(id);
      res.json(projeto);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const apenasAtivos = req.query.ativos !== 'false';
      const projetos = await projetoService.listProjetos(apenasAtivos);
      res.json(projetos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const {
        titulo, areaTematica, resumo, premioId, avaliadorId, autorIds, situacao,
        nota, parecerDescritivo, status
      } = req.body;

      const data: UpdateProjetoDTO = {
        titulo, areaTematica, resumo, premioId, avaliadorId, autorIds, situacao,
        nota, parecerDescritivo, status
      };

      const projeto = await projetoService.updateProjeto(id, data);
      res.json(projeto);
    } catch (error: any) {
      if (error.message.includes("não encontrado")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const message = await projetoService.deleteProjeto(id);
      res.status(200).json({ message });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // --- Ações Específicas ---

  async evaluate(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { nota, parecerDescritivo, situacao, avaliadorId } = req.body;
      const data: EvaluateProjetoDTO = {
        nota: Number(nota),
        parecerDescritivo,
        situacao,
        avaliadorId: Number(avaliadorId),
      };
      const projeto = await projetoService.evaluateProjeto(id, data);
      res.json(projeto);
    } catch (error: any) {
       if (error.message.includes("não encontrado")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  async addAutor(req: Request, res: Response) {
    try {
        const projetoId = Number(req.params.id);
        const { autorId } = req.body;
        if (!autorId) {
            res.status(400).json({ error: "O campo 'autorId' é obrigatório." });
            return;
        }
        const projeto = await projetoService.addAutor(projetoId, Number(autorId));
        res.json(projeto);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
  }
  
  async removeAutor(req: Request, res: Response) {
    try {
        const { projetoId, autorId } = req.params;
        const projeto = await projetoService.removeAutor(Number(projetoId), Number(autorId));
        res.json(projeto);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
  }
  

  // --- Métodos de Busca/Filtro ---

  async getByAvaliador(req: Request, res: Response) {
    try {
      const avaliadorId = Number(req.params.id);
      const projetos = await projetoService.getProjetosByAvaliador(avaliadorId);
      res.json(projetos);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getByPremio(req: Request, res: Response) {
    try {
      const premioId = Number(req.params.id);
      const projetos = await projetoService.getProjetosByPremio(premioId);
      res.json(projetos);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
  
  async getByAutor(req: Request, res: Response) {
    try {
      const autorId = Number(req.params.id);
      const projetos = await projetoService.getProjetosByAutor(autorId);
      res.json(projetos);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
  
  async getByAreaTematica(req: Request, res: Response) {
    try {
      const area = req.params.area as AreaTematica;
      if (!Object.values(AreaTematica).includes(area)) {
        res.status(400).json({ error: "Área temática inválida." });
        return;
      }
      const projetos = await projetoService.getProjetosByAreaTematica(area);
      res.json(projetos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  // src/controllers/ProjetoController.ts

// ... (dentro da classe ProjetoController)

  /**
   * Conta projetos de um prêmio específico, filtrando por situação.
   */
  async countBySituacaoAndPremio(req: Request, res: Response) {
    try {
      const { premioId, situacao } = req.params;

      // Valida se a situação fornecida é uma das situações válidas do Enum
      const situacaoEnumValue = situacao as SituacaoProjeto;
      if (!Object.values(SituacaoProjeto).includes(situacaoEnumValue)) {
         res.status(400).json({ error: `Situação '${situacao}' é inválida.` });
         return
      }

      const count = await projetoService.countProjetosBySituacaoAndPremio(
        Number(premioId),
        situacaoEnumValue
      );
      
      res.json({ count });
    } catch (error: any) {
      // O serviço lança erro se o prêmio não for encontrado
      if (error.message.includes("não encontrado")) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
  async getBySituacao(req: Request, res: Response) {
    try {
      const situacao = req.params.situacao as SituacaoProjeto;
       if (!Object.values(SituacaoProjeto).includes(situacao)) {
        res.status(400).json({ error: "Situação inválida." });
        return;
      }
      const projetos = await projetoService.getProjetosBySituacao(situacao);
      res.json(projetos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}