import { Avaliador } from "@prisma/client";

export type CreateAvaliadorDTO = Omit<Avaliador, "id" | "status" | "projeto">;