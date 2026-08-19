import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api.error";
import { ApiResponse } from "@/lib/api.response";
import { getCurrentUser } from "@/lib/features/auth/utils/auth.util";
import { DocumentService } from "@/lib/features/civicAnalysis/service/document.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  try {
    const { userId } = getCurrentUser(req);
    const { documentId } = await params;
    return ApiResponse.success(await DocumentService.analyze(documentId, userId));
  } catch (error) {
    return ApiError.handle(error);
  }
}
