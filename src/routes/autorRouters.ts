import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { AutorController } from "../controllers/AutorController";

const router = Router();
const autorController = new AutorController();

// Rota para criar um novo autor
router.post("/autores", authenticateToken, (req, res) =>
  autorController.create(req, res)
);

// Rota para buscar um autor específico por ID
router.get("/autores/:id", authenticateToken, (req, res) =>
  autorController.getById(req, res)
);

// Rota para listar todos os autores
router.get("/autores", authenticateToken, (req, res) =>
  autorController.list(req, res)
);

// Rota para atualizar um autor
router.put("/autores/:id", authenticateToken, (req, res) =>
  autorController.update(req, res)
);

// Rota para deletar (inativar) um autor
router.delete("/autores/:id", authenticateToken, (req, res) =>
  autorController.delete(req, res)
);
// Rota para mostrar a média de um autor
router.post("/autores/:id/projetos/media", authenticateToken, (req, res) =>
  autorController.mediaNotas(req, res)
);
export default router;