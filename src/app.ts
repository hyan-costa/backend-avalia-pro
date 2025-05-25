import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import morgan from "morgan";

dotenv.config();

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use("/api", userRoutes);

export default app;
