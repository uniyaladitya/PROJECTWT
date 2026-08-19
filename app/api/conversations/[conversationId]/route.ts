import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api.error";
import { ApiResponse } from "@/lib/api.response";
import { getCurrentUser } from "@/lib/features/auth/utils/auth.util";
import { ConversationService } from "@/lib/features/civicAnalysis/service/conversation.service";

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = getCurrentUser(req);
    const { conversationId } = await params;
    return ApiResponse.success(await ConversationService.get(conversationId, userId));
  } catch (error) {
    return ApiError.handle(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = getCurrentUser(req);
    const { conversationId } = await params;
    const body = await req.json();
    return ApiResponse.success(
      await ConversationService.updateTitle(conversationId, userId, body.title),
    );
  } catch (error) {
    return ApiError.handle(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = getCurrentUser(req);
    const { conversationId } = await params;
    await ConversationService.delete(conversationId, userId);
    return ApiResponse.success(null);
  } catch (error) {
    return ApiError.handle(error);
  }
}
