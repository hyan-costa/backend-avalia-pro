import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { PremioController } from "../controllers/PremioController";

const router = Router();
const premioController = new PremioController();

// --- Rotas Principais de CRUD ---

// Cria um novo prémio
router.post("/premios", authenticateToken, (req, res) =>
  premioController.create(req, res)
);

// Lista todos os prémios (ativos por padrão, use ?ativos=false para todos)
router.get("/premios", authenticateToken, (req, res) =>
  premioController.list(req, res)
);

// Busca um prémio específico por ID
router.get("/premios/:id", authenticateToken, (req, res) =>
  premioController.getById(req, res)
);

// Atualiza um prémio
router.put("/premios/:id", authenticateToken, (req, res) =>
  premioController.update(req, res)
);

// Deleta (inativa) um prémio
router.delete("/premios/:id", authenticateToken, (req, res) =>
  premioController.delete(req, res)
);

// --- Rotas de Relacionamento e Consultas Específicas ---

// Busca prémios por ano de edição
router.get("/premios/ano/:ano", authenticateToken, (req, res) =>
  premioController.getByAno(req, res)
);

// Lista os projetos de um prémio específico
router.get("/premios/:id/projetos", authenticateToken, (req, res) =>
  premioController.getProjetos(req, res)
);

// Conta os projetos de um prémio específico
router.get("/premios/:id/projetos/count", authenticateToken, (req, res) =>
  premioController.countProjetos(req, res)
);

export default router;