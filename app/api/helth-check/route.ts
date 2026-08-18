import { NextResponse } from "next/server";
import { checkHealth } from "../../../lib/features/healthCheck/service/health.service";

/**
 * @swagger
 * /api/helth-check:
 *   get:
 *     summary: API Health Check
 *     description: Returns the health status of the API, including Prisma DB, Vector DB, and configured keys.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: All services are up and running.
 *       503:
 *         description: One or more services are down.
 */
export async function GET() {
  const healthStatus = await checkHealth();

  return NextResponse.json(healthStatus, {
    status: healthStatus.status === "ok" ? 200 : 503,
  });
}