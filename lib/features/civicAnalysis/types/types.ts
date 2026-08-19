export type IssueCategory = "RTI" | "TENANCY" | "WELFARE" | "GENERAL";

export interface AuthorityMapping {
  name: string;
  role: string;
  contactHint?: string;
}

export interface AnalysisResult {
  category: IssueCategory;
  summary: string;
  legalBasis: string;
  recommendedActions: string[];
  relevantAuthorities: AuthorityMapping[];
  estimatedResolutionTime?: string;
}

export interface AnalyzeResponse {
  conversationId: string;
  userMessageId: string;
  aiMessageId: string;
  analysis: AnalysisResult;
}
