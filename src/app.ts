import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import avaliadorRouters from "./routes/avaliadorRouters";
import autorRouters from "./routes/autorRouters";
import premioRouters from "./routes/premioRouters";
import projetoRouters from "./routes/projetoRouters";
import morgan from "morgan";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use("/api", userRoutes);
app.use("/api", avaliadorRouters);
app.use("/api", autorRouters);
app.use("/api", premioRouters);
app.use("/api", projetoRouters);
export default app;
