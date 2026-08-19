import { z } from "@/lib/zod-openapi";

export const analysisSchema = z
  .object({
    category: z.enum(["RTI", "TENANCY", "WELFARE", "GENERAL"]),
    summary: z.string(),
    issues: z.array(z.string()),
    recommendedActions: z.array(z.string()),
    relevantAuthorities: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
        contactHint: z.string().optional(),
      }),
    ),
    grayArea: z.object({
      detected: z.boolean(),
      description: z.string().optional(),
    }),
    estimatedResolutionTime: z.string().optional(),
  })
  .describe("Structured civic issue analysis");

export const analyzeRequestDto = z
  .object({
    query: z
      .string()
      .min(10, "Query must be at least 10 characters long")
      .max(2000, "Query must be at most 2000 characters long")
      .describe(
        "The civic issue or question to analyze. Example: My landlord refused to return the security deposit.",
      ),

    conversationId: z
      .string()
      .cuid("Invalid conversation ID")
      .optional()
      .describe("Optional existing conversation ID to continue a session."),
  })
  .describe("Request body for the civic issue analysis endpoint");

export type AnalyzeRequest = z.infer<typeof analyzeRequestDto>;
export type AnalysisResult = z.infer<typeof analysisSchema>;
