import { NextRequest } from "next/server";
import { UserService } from "@/lib/features/users/service/user.service";
import { updateProfileSchema } from "@/lib/features/users/dto/user.dto";
import { ApiResponse } from "@/lib/api.response";
import { ApiError } from "@/lib/api.error";
import { getCurrentUser } from "@/lib/features/auth/utils/auth.util";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getCurrentUser(req);
    const profile = await UserService.getUserProfile(userId);
    return ApiResponse.success(profile, "Profile retrieved successfully", 200);
  } catch (error) {
    return ApiError.handle(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = getCurrentUser(req);
    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const updatedProfile = await UserService.updateUserProfile(userId, data);
    return ApiResponse.success(updatedProfile, "Profile updated successfully", 200);
  } catch (error) {
    return ApiError.handle(error);
  }
}
