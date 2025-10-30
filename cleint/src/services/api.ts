import { HistoryItem, HistoryResponse, AdminStats, ApiResponse } from '../types';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('firebase_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // History endpoints
  async getHistory(page: number = 1, limit: number = 20): Promise<HistoryResponse> {
    const response = await this.request<HistoryResponse>(`/history?page=${page}&limit=${limit}`);
    return response.data!;
  }

  async searchHistory(query: string): Promise<HistoryItem[]> {
    const response = await this.request<HistoryItem[]>(`/history/search?q=${encodeURIComponent(query)}`);
    return response.data!;
  }

  async toggleFavorite(historyId: string): Promise<HistoryItem> {
    const response = await this.request<HistoryItem>(`/history/${historyId}/favorite`, {
      method: 'PATCH',
    });
    return response.data!;
  }

  async deleteHistory(historyId: string): Promise<void> {
    await this.request(`/history/${historyId}`, {
      method: 'DELETE',
    });
  }

  // Snipe endpoint
  async snipeError(error: string): Promise<{ solution: string; responseTime: number }> {
    const response = await this.request<{ solution: string; responseTime: number }>(
      `/snipe?error=${encodeURIComponent(error)}`
    );
    return response.data!;
  }

  // AI endpoints
  async debugError(error: string, code?: string): Promise<{ solution: string; responseTime: number }> {
    const params = new URLSearchParams({ error });
    if (code) params.append('code', code);
    
    const response = await this.request<{ solution: string; responseTime: number }>(
      `/ai/debug?${params}`
    );
    return response.data!;
  }

  async reviewCode(code: string): Promise<{ review: string; responseTime: number }> {
    const response = await this.request<{ review: string; responseTime: number }>(
      `/ai/review?code=${encodeURIComponent(code)}`
    );
    return response.data!;
  }

  async explainConcept(concept: string): Promise<{ explanation: string; responseTime: number }> {
    const response = await this.request<{ explanation: string; responseTime: number }>(
      `/ai/explain?concept=${encodeURIComponent(concept)}`
    );
    return response.data!;
  }

  // Admin endpoints
  async getAdminStats(): Promise<AdminStats> {
    const response = await this.request<AdminStats>('/admin/dashboard');
    return response.data!;
  }
}

export const apiService = new ApiService();
