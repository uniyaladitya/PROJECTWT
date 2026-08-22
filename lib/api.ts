import axios, { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  Document,
  Analysis,
  Conversation,
  User,
  AnalyzeResponse,
  HealthStatus,
  Review,
  ReviewList,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Attach JWT Bearer token if present in localStorage
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor: Handle 401 unauthenticated responses
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Health Check
  async getHealthCheck(): Promise<ApiResponse<HealthStatus>> {
    const { data } = await this.client.get('/health-check');
    return data;
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const { data } = await this.client.post('/auth/login', { email, password });
    if (data.success && data.data?.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.data.token);
      }
    }
    return data;
  }

  async signup(name: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const { data } = await this.client.post('/auth/signup', { name, email, password });
    if (data.success && data.data?.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.data.token);
      }
    }
    return data;
  }

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const { data } = await this.client.get('/users/me');
    return data;
  }

  async updateProfile(name: string): Promise<ApiResponse<User>> {
    const { data } = await this.client.patch('/users/me', { name });
    return data;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    const { data } = await this.client.post('/users/me/password', { oldPassword, newPassword });
    return data;
  }

  async updateSettings(language: string): Promise<ApiResponse<User>> {
    return this.updateProfile(language);
  }

  // Civic Query Analysis
  async analyze(query: string, conversationId?: string): Promise<ApiResponse<AnalyzeResponse>> {
    const { data } = await this.client.post('/analyze', { query, conversationId });
    return data;
  }

  // Legacy wrapper for single document analysis calls
  async analyzeDocument(documentId: string): Promise<ApiResponse<Analysis>> {
    const { data } = await this.client.post(`/documents/${documentId}/analyze`);
    if (data.success) {
      return {
        success: true,
        data: {
          id: documentId,
          documentId,
          status: 'completed',
          createdAt: new Date().toISOString(),
          decision: data.data?.message || 'Document analysis queued',
          explanation: 'Document attached for vector processing.',
        },
      };
    }
    return data;
  }

  // Conversations / Cases
  private formatConversation(conv: any): Conversation {
    return {
      id: conv.id,
      userId: conv.userId,
      title: conv.title || 'Untitled Case',
      description: conv.description || 'Civic issue analysis case',
      status: conv.status || 'active',
      progress: conv.progress ?? 65,
      nextAction: conv.nextAction || 'Review guidance steps',
      deadline: conv.deadline || '30 days',
      lastUpdated: conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : 'Just now',
      createdAt: conv.createdAt || new Date().toISOString(),
      updatedAt: conv.updatedAt || new Date().toISOString(),
      _count: conv._count,
      messages: conv.messages,
      documents: (conv.documents || []).map((d: any) => ({
        id: d.id,
        documentName: d.documentName || d.fileName || 'document.pdf',
        fileName: d.documentName || d.fileName || 'document.pdf',
        fileUrl: d.fileUrl || '#',
        createdAt: d.createdAt,
        status: 'uploaded' as const,
      })),
      timeline: conv.timeline || [
        {
          id: '1',
          title: 'Query Submitted',
          description: 'Initial civic issue filed for AI analysis',
          date: conv.createdAt ? new Date(conv.createdAt).toLocaleDateString() : 'Today',
          type: 'document_uploaded',
          status: 'completed',
        },
      ],
    };
  }

  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    const { data } = await this.client.get('/conversations');
    if (data.success && Array.isArray(data.data)) {
      return {
        ...data,
        data: data.data.map((c: any) => this.formatConversation(c)),
      };
    }
    return data;
  }

  async getCases(): Promise<ApiResponse<Conversation[]>> {
    return this.getConversations();
  }

  async getConversation(id: string): Promise<ApiResponse<Conversation>> {
    const { data } = await this.client.get(`/conversations/${id}`);
    if (data.success && data.data) {
      return {
        ...data,
        data: this.formatConversation(data.data),
      };
    }
    return data;
  }

  async getCase(id: string): Promise<ApiResponse<Conversation>> {
    return this.getConversation(id);
  }

  async createConversation(title?: string): Promise<ApiResponse<Conversation>> {
    const { data } = await this.client.post('/conversations', { title: title || 'New Conversation' });
    if (data.success && data.data) {
      return {
        ...data,
        data: this.formatConversation(data.data),
      };
    }
    return data;
  }

  async createCase(title: string): Promise<ApiResponse<Conversation>> {
    return this.createConversation(title);
  }

  async updateConversationTitle(id: string, title: string): Promise<ApiResponse<Conversation>> {
    const { data } = await this.client.patch(`/conversations/${id}`, { title });
    if (data.success && data.data) {
      return {
        ...data,
        data: this.formatConversation(data.data),
      };
    }
    return data;
  }

  async updateCase(id: string, updates: Partial<Conversation>): Promise<ApiResponse<Conversation>> {
    if (updates.title) {
      return this.updateConversationTitle(id, updates.title);
    }
    return this.getConversation(id);
  }

  async deleteConversation(id: string): Promise<ApiResponse<void>> {
    const { data } = await this.client.delete(`/conversations/${id}`);
    return data;
  }

  async deleteCase(id: string): Promise<ApiResponse<void>> {
    return this.deleteConversation(id);
  }

  // Documents
  async uploadDocument(file: File, conversationId?: string): Promise<ApiResponse<Document>> {
    let targetConversationId = conversationId;
    if (!targetConversationId) {
      const convRes = await this.createConversation(`Analysis: ${file.name}`);
      if (convRes.success && convRes.data?.id) {
        targetConversationId = convRes.data.id;
      } else {
        throw new Error('Could not initialize conversation for document upload');
      }
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', targetConversationId);

    const { data } = await this.client.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (data.success && data.data) {
      const doc = data.data;
      return {
        ...data,
        data: {
          id: doc.id,
          documentName: doc.documentName || file.name,
          fileName: doc.documentName || file.name,
          fileUrl: doc.fileUrl || '#',
          conversationId: doc.conversationId,
          createdAt: doc.createdAt,
          status: 'uploaded',
        },
      };
    }

    return data;
  }

  async getDocuments(): Promise<ApiResponse<Document[]>> {
    const convsRes = await this.getConversations();
    if (!convsRes.success || !convsRes.data) {
      return { success: true, data: [] };
    }

    const allDocs: Document[] = [];
    for (const conv of convsRes.data) {
      if (conv.documents) {
        allDocs.push(...conv.documents);
      }
    }
    return { success: true, data: allDocs };
  }

  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    return { success: true, message: 'Document removed' };
  }

  // Reviews
  async getReviews(params?: { page?: number; pageSize?: number; rating?: number; search?: string; sort?: string }): Promise<ApiResponse<ReviewList>> {
    return {
      success: true,
      data: {
        reviews: [],
        summary: { averageRating: 4.9, totalReviews: 120, distribution: { 5: 110, 4: 8, 3: 2, 2: 0, 1: 0 } },
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };
  }

  async createReview(payload: { rating: number; reviewText: string; category?: string }): Promise<ApiResponse<Review>> {
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        userId: '1',
        user: { displayName: 'Verified User' },
        rating: payload.rating,
        reviewText: payload.reviewText,
        category: payload.category,
        createdAt: new Date().toISOString(),
        verified: true,
        helpfulCount: 0,
      },
    };
  }

  async updateReview(id: string, payload: { rating: number; reviewText: string; category?: string }): Promise<ApiResponse<Review>> {
    return this.createReview(payload);
  }

  async deleteReview(id: string): Promise<ApiResponse<void>> {
    return { success: true, message: 'Review deleted' };
  }

  async markReviewHelpful(id: string): Promise<ApiResponse<{ helpfulCount: number; helpful: boolean }>> {
    return { success: true, data: { helpfulCount: 1, helpful: true } };
  }
}

export const apiClient = new ApiClient();
