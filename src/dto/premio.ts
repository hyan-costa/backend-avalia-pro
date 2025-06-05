import { Premio } from "@prisma/client";

export type CreatePremioDTO = Omit<Premio, "id" | "status" | "projetos">;

export type UpdatePremioDTO = Partial<CreatePremioDTO>;