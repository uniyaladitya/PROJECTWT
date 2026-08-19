import type { AnalysisResult } from "../dto/analyze.dto";

export type { AnalysisResult };

export interface AnalyzeResponse {
  conversationId: string;
  userMessageId: string;
  aiMessageId: string;
  analysis: AnalysisResult;
}
