import { prisma } from "@/lib/db/prisma";
import { AnalyzeRequest, analysisSchema } from "@/lib/features/civicAnalysis/dto/analyze.dto";
import { AnalyzeResponse } from "@/lib/features/civicAnalysis/types/types";
import { ApiError } from "@/lib/api.error";
import { buildPrompt } from "@/lib/features/civicAnalysis/utils/prompt";
import gemma from "@/lib/ollama";
import { generateObject, generateText } from "ai";
import { ConversationService } from "@/lib/features/civicAnalysis/service/conversation.service";

export class AgentService {
  /**
   * Process a chat message, coordinating with CivicAnalysis and Conversation services.
   */
  static async chat(userId: string, input: AnalyzeRequest): Promise<AnalyzeResponse> {
    // --- Resolve or create conversation ---
    let conversationId = input.conversationId;
    let priorMessages: { type: "user" | "ai"; content: string }[] = [];

    if (conversationId) {
      // Use ConversationService to get and assert ownership
      const conversation = await ConversationService.get(conversationId, userId);
      priorMessages = conversation.messages.map(m => ({
        type: m.type as "user" | "ai",
        content: m.content
      }));
    } else {
      // Create a new conversation
      const title = input.query.slice(0, 80) + (input.query.length > 80 ? "…" : "");
      const conversation = await ConversationService.create(userId, title);
      conversationId = conversation.id;
    }

    // --- Save user message ---
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        type: "user",
        content: input.query,
      },
    });

    // --- Prepare system prompt & messages ---
    const messages = buildPrompt(input.query, priorMessages);
    let analysis;

    try {
      const result = await generateObject({
        model: gemma,
        schema: analysisSchema,
        schemaName: "CivicAnalysis",
        messages,
        abortSignal: AbortSignal.timeout(30000), // 30 seconds timeout
        repairText: async ({ text }) => {
          const start = text.indexOf("{");
          const end = text.lastIndexOf("}");
          return start >= 0 && end > start ? text.slice(start, end + 1) : text;
        },
      });
      analysis = result.object;
    } catch (error) {
      console.error("Structured civic analysis failed:", error);
      
      // If error is a timeout, throw immediately
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new ApiError(504, "The analysis model timed out");
      }

      const fallback = await generateText({ 
        model: gemma, 
        messages,
        abortSignal: AbortSignal.timeout(30000), // 30 seconds timeout
      });
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
