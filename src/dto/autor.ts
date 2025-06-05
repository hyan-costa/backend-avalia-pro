import { Autor, Projeto } from "@prisma/client";

export type CreateAutorDTO = Omit<Autor, "id" | "status" | "projetos">;

export type UpdateAutorDTO = Partial<CreateAutorDTO>;