import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { ApiError } from "@/lib/api.error";
import { ENV } from "@/lib/env";

type AuthToken = {
  userId: string;
  role: string;
};

export function getCurrentUser(req: NextRequest): AuthToken {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid Authorization header");
  }

  try {
    const payload = jwt.verify(authHeader.slice(7), ENV.JWT_SECRET);
    if (
      typeof payload !== "object" ||
      typeof payload.userId !== "string" ||
      typeof payload.role !== "string"
    ) {
      throw new Error("Invalid token payload");
    }
    return { userId: payload.userId, role: payload.role };
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }
}
