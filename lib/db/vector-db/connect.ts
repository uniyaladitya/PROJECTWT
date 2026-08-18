import { QdrantClient } from "@qdrant/js-client-rest";
import { ENV } from "@/lib/env";

export const qdrantClient = new QdrantClient({
  url: ENV.VECTOR_DB_URL,
});
