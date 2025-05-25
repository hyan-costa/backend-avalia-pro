import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();
const userController = new UserController();

router.post("/users", (req, res) => userController.create(req, res));
router.post("/login", (req, res) => userController.login(req, res));
router.get("/:id", authenticateToken, (req, res) =>
  userController.get(req, res)
);
router.put("/users/:id", authenticateToken, (req, res) =>
  userController.update(req, res)
);

export default router;
