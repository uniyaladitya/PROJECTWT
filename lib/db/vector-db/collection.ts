import { qdrantClient } from "./connect";
import { ENV } from "@/lib/env";

export const createQdrantCollection = async () => {
  const { collections } = await qdrantClient.getCollections();

  const exists = collections.find(
    (collection) => collection.name === ENV.VECTOR_DB_COLLECTION_NAME,
  );

  if (exists) {
    console.log("Collection already exists");
    return;
  }

  await qdrantClient.createCollection(ENV.VECTOR_DB_COLLECTION_NAME, {
    vectors: {
      dense: {
        size: 3072,
        distance: "Cosine",
        on_disk: true,
        datatype: "float32",
        hnsw_config: {
          payload_m: 24,
          ef_construct: 256,
          // m: 16 // Optional, or omit to use Qdrant's default
        },
      },
    },
    sparse_vectors: {
      sparse: {
        index: {
          on_disk: true,
        },
        modifier: "idf",
      },
    },
  });

  console.log(`Collection ${ENV.VECTOR_DB_COLLECTION_NAME} created successfully`);
};

export const deleteQdrantCollection = async () => {
  await qdrantClient.deleteCollection(ENV.VECTOR_DB_COLLECTION_NAME);
  console.log(`Collection ${ENV.VECTOR_DB_COLLECTION_NAME} deleted successfully`);
};
