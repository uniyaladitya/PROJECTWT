import { createOllama } from "ollama-ai-provider-v2";

const ollama = createOllama({
  baseURL: "http://localhost:11434/api",
});

const gemma = ollama("gemma4:e4b");

export default gemma;
