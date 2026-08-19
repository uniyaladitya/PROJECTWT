import { z } from "@/lib/zod-openapi";

export const createUserDto = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(255, "Name must be at most 255 characters long")
      .describe("Full name of the user. Example: John Doe"),
    email: z
      .email("Email is invalid")
      .describe("Email address of the user. Example: john@example.com"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(255, "Password must be at most 255 characters long")
      .describe("User password. Example: securePassword123"),
    role: z
      .enum(["user", "admin"])
      .default("user")
      .describe("Role of the user in the system. Defaults to user."),
  })
  .describe("Schema for registering a new user");

export const loginUserDto = z
  .object({
    email: z
      .email("Email is invalid")
      .describe("Email address of the user. Example: john@example.com"),
    password: z
      .string()
      .min(1, "Password is required")
      .describe("User password. Example: securePassword123"),
  })
  .describe("Schema for authenticating a user");
