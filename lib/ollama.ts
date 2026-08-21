import { createOllama } from "ollama-ai-provider-v2";
import { ENV } from "./env";

const ollama = createOllama({
  baseURL: ENV.OLLAMA_URL,
});

const gemma = ollama(ENV.OLLAMA_MODEL);

export default gemma;
