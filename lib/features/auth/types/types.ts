import { z } from "zod";
import { createUserDto, loginUserDto } from "../dto/auth.dto";

export type CreateUserInput = z.infer<typeof createUserDto>;
export type LoginUserInput = z.infer<typeof loginUserDto>;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}
