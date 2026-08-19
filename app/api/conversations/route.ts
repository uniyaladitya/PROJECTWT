import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api.error";
import { ApiResponse } from "@/lib/api.response";
import { getCurrentUser } from "@/lib/features/auth/utils/auth.util";
import { ConversationService } from "@/lib/features/civicAnalysis/service/conversation.service";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getCurrentUser(req);
    return ApiResponse.success(await ConversationService.list(userId));
  } catch (error) {
    return ApiError.handle(error);
  }
}
