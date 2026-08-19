import { z } from "@/lib/zod-openapi";

export const analyzeRequestDto = z.object({
  query: z
    .string()
    .min(10, "Query must be at least 10 characters long")
    .max(2000, "Query must be at most 2000 characters long")
    .describe("The civic issue or question to analyze. Example: My landlord refused to return the security deposit."),

  conversationId: z
    .string()
    .cuid("Invalid conversation ID")
    .optional()
    .describe("Optional existing conversation ID to continue a session."),
}).describe("Request body for the civic issue analysis endpoint");

export type AnalyzeRequest = z.infer<typeof analyzeRequestDto>;
