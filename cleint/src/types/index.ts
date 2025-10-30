export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface HistoryItem {
  _id: string;
  userId: string;
  feature: 'debug' | 'review' | 'rewrite' | 'explain' | 'snipe';
  query: string;
  response: string;
  source: 'ai' | 'stackoverflow';
  timestamp: Date;
  metadata: {
    errorType?: string;
    codeLanguage?: string;
    tokensUsed?: number;
    responseTime?: number;
    isFavorite?: boolean;
    hasSolution?: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface HistoryResponse {
  history: HistoryItem[];
  pagination: PaginationInfo;
}

export interface AdminStats {
  totalUsers: number;
  activeToday: number;
  totalHistoryEntries: number;
  featureUsage: Array<{
    feature: string;
    count: number;
    percentage: number;
  }>;
  popularErrors: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
  apiPerformance: Array<{
    source: string;
    avgResponseTime: number;
    totalRequests: number;
  }>;
  successRate: number;
  averageResponseTime: number;
  system: {
    status: 'healthy' | 'degraded';
    uptime: string;
    lastError: string;
  };
}
