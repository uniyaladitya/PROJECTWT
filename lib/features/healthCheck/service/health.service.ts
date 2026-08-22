import { prisma } from "../../../db/prisma";
import { HealthCheckResponse } from "../types";

export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response: HealthCheckResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      prisma: { status: "down" },
      vectorDb: { status: "down" },
      keys: { status: "missing", missingKeys: [] },
    },
  };

  // 1. Check Prisma DB
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.services.prisma.status = "up";
  } catch (error: unknown) {
    response.services.prisma.message = error instanceof Error ? error.message : "Failed to connect to Prisma DB";
    response.status = "error";
  }

  // 2. Check Vector DB
  try {
    const vectorDbUrl = process.env.VECTOR_DB_URL;
    if (vectorDbUrl) {
      // Placeholder for actual vector DB connection check
      response.services.vectorDb.status = "up";
    } else {
      response.services.vectorDb.message = "VECTOR_DB_URL is not configured";
      response.status = "error";
    }
  } catch (error: unknown) {
    response.services.vectorDb.message = error instanceof Error ? error.message : "Failed to verify Vector DB";
    response.status = "error";
  }

  // 3. Check Keys
  const requiredKeys = ["OPENAI_API_KEY"];
  const missingKeys = requiredKeys.filter((key) => !process.env[key]);

  if (missingKeys.length === 0) {
    response.services.keys.status = "configured";
  } else {
    response.services.keys.missingKeys = missingKeys;
    response.status = "error";
  }

  return response;
};
