import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { ProjetoController } from "../controllers/ProjetoController";

const router = Router();
const projetoController = new ProjetoController();

// --- Rotas Principais de CRUD do Projeto ---

// Cria um novo projeto
router.post("/projetos", authenticateToken, (req, res) =>
  projetoController.create(req, res)
);

// Lista todos os projetos (ativos por padrão, use ?ativos=false para todos)
router.get("/projetos", authenticateToken, (req, res) =>
  projetoController.list(req, res)
);

// Busca um projeto específico por ID
router.get("/projetos/:id", authenticateToken, (req, res) =>
  projetoController.getById(req, res)
);

// Atualiza um projeto
router.put("/projetos/:id", authenticateToken, (req, res) =>
  projetoController.update(req, res)
);

// Deleta (inativa) um projeto
router.delete("/projetos/:id", authenticateToken, (req, res) =>
  projetoController.delete(req, res)
);


// --- Rotas de Ações Específicas sobre um Projeto ---

// Avalia um projeto (fornecer nota, parecer e situação no corpo da requisição)
router.patch("/projetos/:id/avaliar", authenticateToken, (req, res) =>
  projetoController.evaluate(req, res)
);

// Adiciona um autor a um projeto
router.post("/projetos/:id/autores", authenticateToken, (req, res) =>
    projetoController.addAutor(req, res)
);

// Remove um autor de um projeto
router.delete("/projetos/:projetoId/autores/:autorId", authenticateToken, (req, res) =>
    projetoController.removeAutor(req, res)
);


// --- Rotas de Filtro e Busca ---

// Busca projetos por área temática
router.get("/projetos/filtro/area/:area", authenticateToken, (req, res) =>
    projetoController.getByAreaTematica(req, res)
);

// Busca projetos por situação
router.get("/projetos/filtro/situacao/:situacao", authenticateToken, (req, res) =>
    projetoController.getBySituacao(req, res)
);

// Busca projetos de um autor específico
// OBS: Esta rota poderia também estar no autorRouter.ts como GET /autores/:id/projetos
router.get("/projetos/filtro/autor/:id", authenticateToken, (req, res) =>
    projetoController.getByAutor(req, res)
);

// Busca projetos de um prêmio específico
// OBS: Esta rota poderia também estar no premioRouter.ts como GET /premios/:id/projetos
router.get("/projetos/filtro/premio/:id", authenticateToken, (req, res) =>
    projetoController.getByPremio(req, res)
);

// Busca projetos de um avaliador específico
// OBS: Esta rota poderia também estar no avaliadorRouter.ts como GET /avaliadores/:id/projetos
router.get("/projetos/filtro/avaliador/:id", authenticateToken, (req, res) =>
    projetoController.getByAvaliador(req, res)
);

/**
 * Rota para contar projetos de um determinado prêmio, filtrados por uma situação específica.
 * Exemplo de uso: GET /projetos/contagem/premio/1/situacao/Submetido
 */
router.get(
  "/projetos/contagem/premio/:premioId/situacao/:situacao",
  authenticateToken,
  (req, res) => projetoController.countBySituacaoAndPremio(req, res)
);

export default router;