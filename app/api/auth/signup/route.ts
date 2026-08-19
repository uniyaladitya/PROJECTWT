import { NextRequest } from "next/server";
import { AuthService } from "@/lib/features/auth/service/auth.service";
import { ApiResponse } from "@/lib/api.response";
import { ApiError } from "@/lib/api.error";

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await AuthService.signup(body);
    
    return ApiResponse.success(result, "User registered successfully", 201);
  } catch (error) {
    return ApiError.handle(error);
  }
}
