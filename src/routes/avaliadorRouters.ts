import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { AvaliadorController } from "../controllers/AvaliadorController";

const router = Router();
const avaliadorController = new AvaliadorController();

// Cria um avaliador
router.post("/avaliadores", authenticateToken, (req, res) =>
  avaliadorController.create(req, res)
);

// Busca um avaliador por ID
router.get("/avaliadores/:id", authenticateToken, (req, res) =>
  avaliadorController.getById(req, res)
);

// Lista todos os avaliadores
router.get("/avaliadores", authenticateToken, (req, res) =>
  avaliadorController.list(req, res)
);

// Deleta (inativa) um avaliador
router.delete("/avaliadores/:id", authenticateToken, (req, res) =>
  avaliadorController.delete(req, res)
);

// Conta os projetos de um avaliador
router.get("/avaliadores/:id/projetos/count", authenticateToken, (req, res) =>
  avaliadorController.countProjetos(req, res)
);

// Lista os projetos de um avaliador
router.get("/avaliadores/:id/projetos", authenticateToken, (req, res) =>
  avaliadorController.getProjetos(req, res)
);

// Média das notas dos projetos de um avaliador
router.get("/avaliadores/:id/projetos/media", authenticateToken, (req, res) =>
  avaliadorController.mediaNotas(req, res)
);

// Atualiza um avaliador
router.put("/avaliadores/:id", authenticateToken, (req, res) =>
  avaliadorController.update(req, res)
);
export default router;
