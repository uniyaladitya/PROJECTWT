import type { SupportedLanguage } from "@/lib/i18n";

// User and Authentication
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  language?: SupportedLanguage;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  userId: string;
  user: { displayName: string; avatarUrl?: string };
  rating: number;
  reviewText: string;
  category?: string;
  createdAt: string;
  updatedAt?: string;
  verified: boolean;
  helpfulCount: number;
  helpfulByCurrentUser?: boolean;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ReviewList {
  reviews: Review[];
  summary: ReviewSummary;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Backend Civic Analysis Result
export interface RelevantAuthority {
  name: string;
  role: string;
  contactHint?: string;
}

export interface GrayArea {
  detected: boolean;
  description?: string;
}

export interface AnalysisResult {
  category: "RTI" | "TENANCY" | "WELFARE" | "GENERAL" | "UNKNOWN";
  summary: string;
  issues: string[];
  recommendedActions: string[];
  relevantAuthorities: RelevantAuthority[];
  grayArea: GrayArea;
  estimatedResolutionTime?: string;
}

export interface AnalyzeResponse {
  conversationId: string;
  userMessageId: string;
  aiMessageId: string;
  analysis: AnalysisResult;
}

// Evidence
export interface Evidence {
  id: string;
  name: string;
  description: string;
  status: "verified" | "missing" | "pending" | "rejected";
  importance?: "required" | "recommended" | "optional";
}

// Document
export interface Document {
  id: string;
  userId?: string;
  documentName: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  conversationId?: string;
  createdAt?: string;
  uploadedAt?: string;
  status?: "uploaded" | "analyzing" | "completed" | "failed" | "pending";
}

// Message
export interface Message {
  id: string;
  type: "user" | "ai";
  content: string; // JSON string for 'ai' type
  createdAt: string;
  parsedAnalysis?: AnalysisResult;
}

// Conversation / Case
export interface Conversation {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  status?: "active" | "action_required" | "pending" | "completed";
  progress?: number;
  nextAction?: string;
  deadline?: string;
  lastUpdated?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
    documents: number;
  };
  messages?: Message[];
  documents?: Document[];
  timeline?: TimelineEvent[];
  analysis?: Analysis;
}

export type CivicCase = Conversation;

// Analysis UI interface compatibility wrapper
export interface Analysis {
  id: string;
  documentId?: string;
  decision?: string;
  confidence?: number;
  explanation?: string;
  recommendedAction?: string;
  status: "pending" | "review_required" | "completed";
  createdAt: string;
  missingEvidence?: string[];
  missingInformation?: string[];
  requiredEvidence?: Evidence[];
  analysisResult?: AnalysisResult;
  category?: "RTI" | "TENANCY" | "WELFARE" | "GENERAL" | "UNKNOWN";
  summary?: string;
  issues?: string[];
  recommendedActions?: string[];
  relevantAuthorities?: RelevantAuthority[];
  grayArea?: GrayArea;
  estimatedResolutionTime?: string;
}

// Timeline Event
export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type:
    | "document_uploaded"
    | "analysis_completed"
    | "evidence_required"
    | "deadline"
    | "action_required";
  status: "completed" | "pending";
}

// Health Check Status
export interface HealthStatus {
  status: string;
  details?: {
    database: string;
    vectorDb: string;
  };
}

// API Response Envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?:
    | {
        code: number;
        message: string;
      }
    | string;
  message?: string;
  status?: string;
}

// Form States
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

// UI States
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface UploadState {
  status: LoadingState;
  file?: File;
  progress: number;
  error?: string;
}
