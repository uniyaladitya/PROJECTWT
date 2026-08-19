import { prisma } from "@/lib/db/prisma";
import { analyzeRequestDto, AnalyzeRequest } from "../dto/analyze.dto";
import { AnalyzeResponse } from "../types/types";
import { ApiError } from "@/lib/api.error";

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

    // --- TODO: Integrate LLM (Task 10) ---
    // Placeholder analysis — will be replaced by real AI call
    const placeholderAnalysis = {
      category: "GENERAL" as const,
      summary: "Analysis pending LLM integration.",
      legalBasis: "To be determined",
      recommendedActions: ["Consult a legal expert", "File a complaint with the relevant authority"],
      relevantAuthorities: [
        { name: "District Collector Office", role: "General grievance redressal" },
      ],
      estimatedResolutionTime: "30-60 days",
    };

    const aiContent = JSON.stringify(placeholderAnalysis);

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
      analysis: placeholderAnalysis,
    };
  }
}
