import { prisma } from "@/lib/db/prisma";
import { createUserDto, loginUserDto } from "../dto/auth.dto";
import { CreateUserInput, LoginUserInput, AuthResponse } from "../types/types";
import { ApiError } from "@/lib/api.error";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "@/lib/env";

export class AuthService {
  private static generateToken(userId: string, role: string) {
    return jwt.sign({ userId, role }, ENV.JWT_SECRET, { expiresIn: '7d' });
  }

  static async signup(inputs: CreateUserInput): Promise<AuthResponse> {
    const data = createUserDto.parse(inputs);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
      }
    });

    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token
    };
  }

  static async login(inputs: LoginUserInput): Promise<AuthResponse> {
    const data = loginUserDto.parse(inputs);

    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }
}
