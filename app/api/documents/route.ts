import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api.error";
import { ApiResponse } from "@/lib/api.response";
import { getCurrentUser } from "@/lib/features/auth/utils/auth.util";
import { DocumentService } from "@/lib/features/civicAnalysis/service/document.service";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getCurrentUser(req);
    const formData = await req.formData();
    const file = formData.get("file");
    const conversationId = formData.get("conversationId");

    if (!(file instanceof File) || !file.name) {
      throw new ApiError(400, "A file is required");
    }
    if (typeof conversationId !== "string" || !conversationId) {
      throw new ApiError(400, "conversationId is required");
    }

    const document = await DocumentService.create(userId, conversationId, file);
    return ApiResponse.success(document, "Document metadata saved", 201);
  } catch (error) {
    return ApiError.handle(error);
  }
}
