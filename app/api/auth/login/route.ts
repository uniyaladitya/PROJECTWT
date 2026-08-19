import { NextRequest } from "next/server";
import { AuthService } from "@/lib/features/auth/service/auth.service";
import { ApiResponse } from "@/lib/api.response";
import { ApiError } from "@/lib/api.error";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Auth]
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await AuthService.login(body);
    
    return ApiResponse.success(result, "User logged in successfully", 200);
  } catch (error) {
    return ApiError.handle(error);
  }
}
