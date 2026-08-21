import "dotenv/config";

export class ENV {
  static get DATABASE_URL(): string {
    const val = process.env.DATABASE_URL;
    if (!val) throw new Error("Missing DATABASE_URL");
    return val;
  }

  static get VECTOR_DB_URL(): string {
    const val = process.env.VECTOR_DB_URL;
    if (!val) throw new Error("Missing VECTOR_DB_URL");
    return val;
  }

  static get VECTOR_DB_COLLECTION_NAME(): string {
    const val = process.env.VECTOR_DB_COLLECTION_NAME;
    if (!val) throw new Error("Missing VECTOR_DB_COLLECTION_NAME");
    return val;
  }

  static get OPENAI_API_KEY(): string {
    const val = process.env.OPENAI_API_KEY;
    if (!val) throw new Error("Missing OPENAI_API_KEY");
    return val;
  }

  static get JWT_SECRET(): string {
    const val = process.env.JWT_SECRET;
    if (!val) throw new Error("Missing JWT_SECRET");
    return val;
  }

  static get OLLAMA_URL(): string {
    return process.env.OLLAMA_URL || "http://localhost:11434/api";
  }

  static get OLLAMA_MODEL(): string {
    return process.env.OLLAMA_MODEL || "gemma4:e4b";
  }
}
