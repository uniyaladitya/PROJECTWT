import { prisma } from "@/lib/db/prisma";
import { analyzeRequestDto, analysisSchema, AnalyzeRequest } from "../dto/analyze.dto";
import { AnalyzeResponse } from "../types/types";
import { ApiError } from "@/lib/api.error";
import { buildPrompt } from "../utils/prompt";
import gemma from "@/lib/ollama";
import { generateObject, generateText } from "ai";

export class CivicAnalysisService {
  /**
   * Analyze a civic issue query.
   * Creates or continues a conversation, saves user message and AI response.
   *
   * @param userId  Authenticated user's ID
   * @param input   Validated analyze request body
   */
  static async analyze(userId: string, input: AnalyzeRequest): Promise<AnalyzeResponse> {
    const data = analyzeRequestDto.parse(input);

    // --- Resolve or create conversation ---
    let conversationId = data.conversationId;
    let priorMessages: { type: "user" | "ai"; content: string }[] = [];

    if (conversationId) {
      // Verify conversation belongs to this user
      const existing = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { userId: true },
      });

      if (!existing) {
        throw new ApiError(404, "Conversation not found");
      }
      if (existing.userId !== userId) {
        throw new ApiError(403, "Forbidden: conversation does not belong to you");
      }

      priorMessages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        select: { type: true, content: true },
      });
    } else {
      // Create a new conversation with a title derived from the query
      const title = data.query.slice(0, 80) + (data.query.length > 80 ? "…" : "");
      const conversation = await prisma.conversation.create({
        data: { userId, title },
      });
      conversationId = conversation.id;
    }

    // --- Save user message ---
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        type: "user",
        content: data.query,
      },
    });

    const messages = buildPrompt(data.query, priorMessages);
    let analysis;

    try {
      const result = await generateObject({
        model: gemma,
        schema: analysisSchema,
        schemaName: "CivicAnalysis",
        messages,
        repairText: async ({ text }) => {
          const start = text.indexOf("{");
          const end = text.lastIndexOf("}");
          return start >= 0 && end > start ? text.slice(start, end + 1) : text;
        },
      });
      analysis = result.object;
    } catch (error) {
      console.error("Structured civic analysis failed:", error);
      const fallback = await generateText({ model: gemma, messages });
      const start = fallback.text.indexOf("{");
      const end = fallback.text.lastIndexOf("}");
      if (start < 0 || end <= start) {
        throw new ApiError(502, "The analysis model returned an invalid response");
      }
      try {
        analysis = analysisSchema.parse(JSON.parse(fallback.text.slice(start, end + 1)));
      } catch {
        throw new ApiError(502, "The analysis model returned an invalid response");
      }
    }

    const aiContent = JSON.stringify(analysis);

    // --- Save AI response ---
    const aiMessage = await prisma.message.create({
      data: {
        conversationId,
        type: "ai",
        content: aiContent,
      },
    });

    return {
      conversationId,
      userMessageId: userMessage.id,
      aiMessageId: aiMessage.id,
      analysis,
    };
  }
}
