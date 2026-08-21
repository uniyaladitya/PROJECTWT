import { NextRequest } from "next/server";
import { UserService } from "@/lib/features/users/service/user.service";
import { changePasswordSchema } from "@/lib/features/users/dto/user.dto";
import { ApiResponse } from "@/lib/api.response";
import { ApiError } from "@/lib/api.error";
import { getCurrentUser } from "@/lib/features/auth/utils/auth.util";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getCurrentUser(req);
    const body = await req.json();
    const data = changePasswordSchema.parse(body);

    const result = await UserService.changePassword(userId, data);
    return ApiResponse.success(result, "Password changed successfully", 200);
  } catch (error) {
    return ApiError.handle(error);
  }
}
