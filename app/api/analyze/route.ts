import { NextRequest } from "next/server";
import { CivicAnalysisService } from "@/lib/features/civicAnalysis/service/civicAnalysis.service";
import { analyzeRequestDto } from "@/lib/features/civicAnalysis/dto/analyze.dto";
import { ApiResponse } from "@/lib/api.response";
import { ApiError } from "@/lib/api.error";
import { ENV } from "@/lib/env";
import jwt from "jsonwebtoken";

function extractUserId(req: NextRequest): string {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as { userId: string; role: string };
    return payload.userId;
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}

/**
 * POST /api/analyze
 *
 * Analyzes a civic issue query for the authenticated user.
 * Creates a new conversation (or continues an existing one),
 * saves messages and returns a structured civic analysis.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = extractUserId(req);
    const body = await req.json();

    // Validate request body
    const input = analyzeRequestDto.parse(body);

    const result = await CivicAnalysisService.analyze(userId, input);

    return ApiResponse.success(result, "Analysis completed successfully", 200);
  } catch (error) {
    return ApiError.handle(error);
  }
}
