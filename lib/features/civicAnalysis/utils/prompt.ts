type PriorMessage = {
  type: "user" | "ai";
  content: string;
};

export const systemPrompt = `You are a civic issue analysis assistant. Classify the user's issue as exactly one of RTI, TENANCY, WELFARE, GENERAL, or UNKNOWN. If the issue is entirely unrelated to civic matters (e.g. coding help, unrelated chatter), use UNKNOWN and provide a brief summary explaining that only civic issues are supported. Return only the requested structured object. Be practical, cautious, and do not invent laws or precise legal advice. Set grayArea.detected to true when the facts are ambiguous or more information is needed.`;

export function buildPrompt(query: string, priorMessages: PriorMessage[] = []) {
  const context = priorMessages.length
    ? priorMessages.map((message) => `${message.type.toUpperCase()}: ${message.content}`).join("\n")
    : "No previous conversation context.";

  return {
    system: systemPrompt,
    messages: [
      {
        role: "user" as const,
        content: `Conversation context:\n${context}\n\nNew civic issue:\n${query}`,
      },
    ],
  };
}

