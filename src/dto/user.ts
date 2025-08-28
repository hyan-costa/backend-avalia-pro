import { User, Role } from "@prisma/client";

export type CreateUserDTO = {
  nome: string;
  email: string;
  password: string;
  role?: Role; // Optional, will default to 'USER' if not provided
};

export type UpdateUserDTO = Partial<CreateUserDTO>;

export type LoginUserDTO = {
  email: string;
  password: string;
};