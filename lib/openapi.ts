import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { loginUserDto, createUserDto } from "@/lib/features/auth/dto/auth.dto";

export const registry = new OpenAPIRegistry();

/**
 * Security
 */
registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

/**
 * Schemas
 */
registry.register("LoginUserRequest", loginUserDto);
registry.register("CreateUserRequest", createUserDto);

/**
 * POST /api/auth/login
 */
registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  summary: "Authenticate a user",
  tags: ["Auth"],

  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: loginUserDto,
        },
      },
    },
  },

  responses: {
    200: {
      description: "User authenticated successfully",
    },
    400: {
      description: "Invalid request",
    },
    401: {
      description: "Invalid credentials",
    },
  },
});

/**
 * POST /api/users
 */
registry.registerPath({
  method: "post",
  path: "/api/auth/signup",
  summary: "Create a user",
  tags: ["Auth"],

  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createUserDto,
        },
      },
    },
  },

  responses: {
    201: {
      description: "User created successfully",
    },
    400: {
      description: "Invalid request",
    },
  },
});

export function getOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",

    info: {
      title: "Next.js Swagger API",
      version: "1.0.0",
      description: "API documentation for my Next.js application",
    },

    security: [],
  });
}
