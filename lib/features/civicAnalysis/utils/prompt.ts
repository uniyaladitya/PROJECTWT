type PriorMessage = {
  type: "user" | "ai";
  content: string;
};

const systemPrompt = `You are a civic issue analysis assistant. Classify the user's issue as exactly one of RTI, TENANCY, WELFARE, or GENERAL. Return only the requested structured object. Be practical, cautious, and do not invent laws or precise legal advice. Set grayArea.detected to true when the facts are ambiguous or more information is needed. legalBasis is intentionally omitted because retrieval is not available yet.`;

export function buildPrompt(query: string, priorMessages: PriorMessage[] = []) {
  const context = priorMessages.length
    ? priorMessages.map((message) => `${message.type.toUpperCase()}: ${message.content}`).join("\n")
    : "No previous conversation context.";

  return [
    { role: "system" as const, content: systemPrompt },
    {
      role: "user" as const,
      content: `Conversation context:\n${context}\n\nNew civic issue:\n${query}`,
    },
  ];
}
