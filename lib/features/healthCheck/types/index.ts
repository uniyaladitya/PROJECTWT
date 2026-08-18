export interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: string;
  services: {
    prisma: {
      status: "up" | "down";
      message?: string;
    };
    vectorDb: {
      status: "up" | "down";
      message?: string;
    };
    keys: {
      status: "configured" | "missing";
      missingKeys?: string[];
    };
  };
}
