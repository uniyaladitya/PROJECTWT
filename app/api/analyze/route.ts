import { NextRequest } from "next/server";
import { AgentService } from "@/lib/features/agent/service/agent.service";
import { analyzeRequestDto } from "@/lib/features/civicAnalysis/dto/analyze.dto";
import { ApiResponse } from "@/lib/api.response";
import { ApiError } from "@/lib/api.error";
import { getCurrentUser } from "@/lib/features/auth/utils/auth.util";

/**
 * POST /api/analyze
 *
 * Analyzes a civic issue query for the authenticated user.
 * Creates a new conversation (or continues an existing one),
 * saves messages and returns a structured civic analysis.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = getCurrentUser(req);
    const body = await req.json();

    // Validate request body
    const input = analyzeRequestDto.parse(body);

    const result = await AgentService.chat(userId, input);

    return ApiResponse.success(result, "Analysis completed successfully", 200);
  } catch (error) {
    return ApiError.handle(error);
  }
}
