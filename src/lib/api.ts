// API service layer for connecting to Cloudflare Workers backend

const API_BASE = '/api';

export interface QueryFilters {
  source?: string;
  product?: string;
  country?: string;
  timeRange?: string;
}

export interface QueryResponse {
  ok: boolean;
  filters?: QueryFilters;
  totalCount?: number;
  charts?: {
    byTheme?: Array<{ key: string; count: number }>;
    byPlatform?: Array<{ key: string; count: number }>;
    byCountry?: Array<{ key: string; count: number }>;
    byProduct?: Array<{ key: string; count: number }>;
    byTime?: Array<{ key: string; count: number }>;
    bySentiment?: Array<{ key: string; count: number }>;
    byUrgency?: Array<{ key: string; count: number }>;
    byValue?: Array<{ key: string; count: number }>;
  };
  error?: string;
}

export async function queryFeedback(filters: QueryFilters): Promise<QueryResponse> {
  try {
    const params = new URLSearchParams();
    if (filters.timeRange) params.set('timeRange', filters.timeRange);
    if (filters.source) params.set('platform', filters.source);
    if (filters.product) params.set('product', filters.product);
    if (filters.country) params.set('country', filters.country);

    const response = await fetch(`${API_BASE}/query?${params.toString()}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function processFeedback(feedbackId?: string, batchSize?: number) {
  try {
    const response = await fetch(`${API_BASE}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedbackId, batchSize })
    });
    return await response.json();
  } catch (error) {
    console.error('Process Error:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getAIAdvice(filters: QueryFilters, chartData: any) {
  try {
    const response = await fetch(`${API_BASE}/ai-advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters, chartData })
    });
    return await response.json();
  } catch (error) {
    console.error('AI Advice Error:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function saveView(name: string, filters: QueryFilters) {
  try {
    const response = await fetch(`${API_BASE}/save-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, filters })
    });
    return await response.json();
  } catch (error) {
    console.error('Save View Error:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getSavedViews() {
  try {
    const response = await fetch(`${API_BASE}/save-view`);
    return await response.json();
  } catch (error) {
    console.error('Get Saved Views Error:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export interface GitHubConnection {
  connected: boolean;
  repo: string;
  owner?: string;
}

export async function connectGitHub(repo: string): Promise<{ ok: boolean; error?: string }> {
  try {
    // In a real implementation, this would:
    // 1. Open GitHub OAuth flow
    // 2. Store access token securely
    // 3. Verify repository access
    // 4. Save connection state
    
    // For now, we'll just validate the repo format
    const repoPattern = /^[\w\-\.]+\/[\w\-\.]+$/;
    if (!repoPattern.test(repo)) {
      return { ok: false, error: 'Invalid repository format. Use: owner/repo' };
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('github_connection', JSON.stringify({
      connected: true,
      repo: repo,
      connectedAt: new Date().toISOString()
    }));
    
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function getGitHubConnection(): GitHubConnection | null {
  try {
    const stored = localStorage.getItem('github_connection');
    if (stored) {
      const data = JSON.parse(stored);
      return {
        connected: data.connected || false,
        repo: data.repo || 'hong10054010-art/test-project'
      };
    }
  } catch (error) {
    console.error('Error reading GitHub connection:', error);
  }
  return null;
}

export function disconnectGitHub() {
  localStorage.removeItem('github_connection');
}

export interface FeedbackListItem {
  id: string;
  date: string;
  user: string;
  source: string;
  sentiment: string;
  rating: number;
  category: string;
  tags: string[];
  text: string;
  verified: boolean;
}

export interface FeedbackListResponse {
  ok: boolean;
  items?: FeedbackListItem[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  error?: string;
}

export async function getFeedbackList(filters: {
  source?: string;
  sentiment?: string;
  category?: string;
  timeRange?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<FeedbackListResponse> {
  try {
    const params = new URLSearchParams();
    if (filters.timeRange) params.set('timeRange', filters.timeRange);
    if (filters.source && filters.source !== 'all') params.set('source', filters.source);
    if (filters.sentiment && filters.sentiment !== 'all') params.set('sentiment', filters.sentiment);
    if (filters.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.pageSize) params.set('pageSize', filters.pageSize.toString());
    if (filters.search) params.set('search', filters.search);

    const response = await fetch(`${API_BASE}/feedback-list?${params.toString()}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Feedback List API Error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
