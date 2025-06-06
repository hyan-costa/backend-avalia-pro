import { Request, Response } from "express";
import { PremioService } from "../services/PremioService";
import { PremioRepository } from "../repositories/PremioRepository";
import { CreatePremioDTO, UpdatePremioDTO } from "../dto/premio";

// Instanciação das dependências
const premioRepository = new PremioRepository();
const premioService = new PremioService(premioRepository);

export class PremioController {
  /**
   * Cria um novo prémio.
   */
  async create(req: Request, res: Response) {
    try {
      const data: CreatePremioDTO = req.body;
      const premio = await premioService.createPremio(data);
      res.status(201).json(premio);
    } catch (error: any) {
      // Erros de validação do serviço (e.g., nome duplicado, datas inválidas)
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Busca um prémio pelo ID.
   */
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const premio = await premioService.getPremioById(id);
      res.json(premio);
    } catch (error: any) {
      // O serviço lança erro se não encontrar, que aqui se torna um 404.
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Lista todos os prémios (ativos por padrão).
   * Aceita um query param `?ativos=false` para listar todos.
   */
  async list(req: Request, res: Response) {
    try {
      const apenasAtivos = req.query.ativos !== 'false';
      const premios = await premioService.listPremios(apenasAtivos);
      res.json(premios);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualiza os dados de um prémio.
   */
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data: UpdatePremioDTO = req.body;
      const premioAtualizado = await premioService.updatePremio(id, data);
      res.json(premioAtualizado);
    } catch (error: any) {
      if (error.message.includes("não encontrado")) {
        res.status(404).json({ error: error.message });
      } else {
        // Outros erros de validação (datas, nome duplicado, etc.)
        res.status(400).json({ error: error.message });
      }
    }
  }

  /**
   * Deleta (inativa) um prémio.
   */
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const mensagem = await premioService.deletePremio(id);
      res.status(200).json({ message: mensagem }); // Retorna a mensagem de sucesso
    } catch (error: any) {
      if (error.message.includes("não encontrado")) {
        res.status(404).json({ error: error.message });
      } else {
        // Erro por ter projetos vinculados, por exemplo.
        res.status(400).json({ error: error.message });
      }
    }
  }

  /**
   * Lista todos os projetos de um prémio.
   */
  async getProjetos(req: Request, res: Response) {
    try {
      const premioId = Number(req.params.id);
      const projetos = await premioService.getProjetosDoPremio(premioId);
      res.json(projetos);
    } catch (error: any) {
      res.status(404).json({ error: error.message }); // 404 se o prémio não existe
    }
  }

  /**
   * Conta os projetos de um prémio.
   */
  async countProjetos(req: Request, res: Response) {
    try {
      const premioId = Number(req.params.id);
      const count = await premioService.countProjetosDoPremio(premioId);
      res.json({ count });
    } catch (error: any) {
      res.status(404).json({ error: error.message }); // 404 se o prémio não existe
    }
  }

  /**
   * Busca prémios por ano de edição.
   */
  async getByAno(req: Request, res: Response) {
    try {
      const ano = Number(req.params.ano);
      const premios = await premioService.getPremiosByAnoEdicao(ano);
      res.json(premios);
    } catch (error: any) {
        res.status(400).json({ error: error.message }); // 400 se o ano for inválido
    }
  }
}