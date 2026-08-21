import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import { loginUserDto, createUserDto } from "@/lib/features/auth/dto/auth.dto";
import { analyzeRequestDto, analysisSchema } from "@/lib/features/civicAnalysis/dto/analyze.dto";

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const errorSchema = z.object({
  success: z.literal(false),
  data: z.null(),
  error: z.object({ code: z.number(), message: z.string() }),
});

const conversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

registry.register("LoginUserRequest", loginUserDto);
registry.register("CreateUserRequest", createUserDto);
registry.register("AnalyzeRequest", analyzeRequestDto);
registry.register("AnalysisResult", analysisSchema);
registry.register("ErrorResponse", errorSchema);
registry.register("Conversation", conversationSchema);

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  summary: "Authenticate a user",
  tags: ["Auth"],
  request: { body: { required: true, content: { "application/json": { schema: loginUserDto } } } },
  responses: {
    200: { description: "User authenticated successfully" },
    400: {
      description: "Invalid request",
      content: { "application/json": { schema: errorSchema } },
    },
    401: {
      description: "Invalid credentials",
      content: { "application/json": { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/signup",
  summary: "Create a user",
  tags: ["Auth"],
  request: { body: { required: true, content: { "application/json": { schema: createUserDto } } } },
  responses: {
    201: { description: "User created successfully" },
    400: {
      description: "Invalid request",
      content: { "application/json": { schema: errorSchema } },
    },
    409: {
      description: "Email already exists",
      content: { "application/json": { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/analyze",
  summary: "Analyze a civic issue",
  tags: ["Analysis"],
  security: [{ BearerAuth: [] }],
  request: {
    body: { required: true, content: { "application/json": { schema: analyzeRequestDto } } },
  },
  responses: {
    200: {
      description: "Structured civic analysis",
      content: { "application/json": { schema: analysisSchema } },
    },
    400: {
      description: "Invalid request",
      content: { "application/json": { schema: errorSchema } },
    },
    401: {
      description: "Authentication required",
      content: { "application/json": { schema: errorSchema } },
    },
    403: {
      description: "Conversation ownership violation",
      content: { "application/json": { schema: errorSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/conversations",
  summary: "List the authenticated user's conversations",
  tags: ["Conversations"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: "Conversation list" },
    401: { description: "Authentication required" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/conversations",
  summary: "Create a new conversation",
  tags: ["Conversations"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      required: false,
      content: { "application/json": { schema: z.object({ title: z.string().optional() }) } },
    },
  },
  responses: {
    200: { description: "Conversation created", content: { "application/json": { schema: conversationSchema } } },
    401: { description: "Authentication required" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/conversations/{conversationId}",
  summary: "Get a conversation and its messages",
  tags: ["Conversations"],
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ conversationId: z.string() }) },
  responses: {
    200: { description: "Conversation details" },
    403: { description: "Forbidden" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/conversations/{conversationId}",
  summary: "Rename a conversation",
  tags: ["Conversations"],
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ conversationId: z.string() }),
    body: {
      required: true,
      content: { "application/json": { schema: z.object({ title: z.string() }) } },
    },
  },
  responses: {
    200: { description: "Conversation renamed" },
    400: { description: "Invalid title" },
    403: { description: "Forbidden" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/conversations/{conversationId}",
  summary: "Delete a conversation and its related records",
  tags: ["Conversations"],
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ conversationId: z.string() }) },
  responses: {
    200: { description: "Conversation deleted" },
    403: { description: "Forbidden" },
    404: { description: "Not found" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/documents",
  summary: "Save uploaded document metadata",
  tags: ["Documents"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.string().describe("Uploaded file"),
            conversationId: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    201: { description: "Document metadata saved" },
    400: { description: "Invalid upload" },
    403: { description: "Forbidden" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/documents/{documentId}/analyze",
  summary: "Queue document analysis",
  tags: ["Documents"],
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ documentId: z.string() }) },
  responses: {
    200: { description: "RAG-ready analysis stub" },
    403: { description: "Forbidden" },
    404: { description: "Not found" },
  },
});

export function getOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Civic Analysis API",
      version: "1.0.0",
      description: "Backend API for authenticated civic issue analysis and conversations.",
    },
  });
}
