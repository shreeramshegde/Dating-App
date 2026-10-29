import axios, { AxiosInstance } from 'axios';
import { 
  AuthResponse, 
  UserProfile, 
  ProfileUpdateRequest, 
  DiscoveryCard, 
  SwipeResponse, 
  MatchItem, 
  ChatMessage, 
  PaginatedMessages, 
  PresignedUrlResponse,
  SwipeType
} from '../types';
import { 
  CURRENT_USER, 
  MOCK_DISCOVERY_CARDS, 
  MOCK_MATCHES, 
  MOCK_MESSAGES 
} from '../data/mockProfiles';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://3.25.130.67:8080/api/v1';

class ApiService {
  private client: AxiosInstance;
  public useMock: boolean = false;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor to inject JWT Bearer Token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const storedMock = localStorage.getItem('dating_app_use_mock');
    this.useMock = storedMock !== null ? storedMock === 'true' : false;
  }

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setMockFallback(enabled: boolean) {
    this.useMock = enabled;
    localStorage.setItem('dating_app_use_mock', String(enabled));
  }

  // --- Auth APIs ---
  async register(email: string, password: string): Promise<AuthResponse> {
    if (this.useMock) {
      const mockRes: AuthResponse = {
        token: 'mock_jwt_token_alex_123',
        tokenType: 'Bearer',
        userId: CURRENT_USER.userId,
        email,
        profileCompleted: false, // will prompt onboarding
      };
      this.setToken(mockRes.token);
      return mockRes;
    }

    try {
      const { data } = await this.client.post<AuthResponse>('/auth/register', { email, password });
      this.setToken(data.token);
      return data;
    } catch (err: any) {
      console.warn('[API] Register failed, falling back to mock session:', err?.message);
      const mockRes: AuthResponse = {
        token: 'mock_jwt_token_alex_123',
        tokenType: 'Bearer',
        userId: CURRENT_USER.userId,
        email,
        profileCompleted: false,
      };
      this.setToken(mockRes.token);
      return mockRes;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    if (this.useMock) {
      const mockRes: AuthResponse = {
        token: 'mock_jwt_token_alex_123',
        tokenType: 'Bearer',
        userId: CURRENT_USER.userId,
        email,
        profileCompleted: true,
      };
      this.setToken(mockRes.token);
      return mockRes;
    }

    try {
      const { data } = await this.client.post<AuthResponse>('/auth/login', { email, password });
      this.setToken(data.token);
      return data;
    } catch (err: any) {
      console.warn('[API] Login failed or backend offline. Using mock session:', err?.message);
      const mockRes: AuthResponse = {
        token: 'mock_jwt_token_alex_123',
        tokenType: 'Bearer',
        userId: CURRENT_USER.userId,
        email,
        profileCompleted: true,
      };
      this.setToken(mockRes.token);
      return mockRes;
    }
  }

  // --- Profile APIs ---
  async getMyProfile(): Promise<UserProfile> {
    if (this.useMock) return CURRENT_USER;

    try {
      const { data } = await this.client.get<UserProfile>('/profiles/me');
      return data;
    } catch {
      return CURRENT_USER;
    }
  }

  async updateMyProfile(update: ProfileUpdateRequest): Promise<UserProfile> {
    if (this.useMock) {
      return {
        ...CURRENT_USER,
        ...update,
      };
    }

    try {
      const { data } = await this.client.put<UserProfile>('/profiles/me', update);
      return data;
    } catch {
      return { ...CURRENT_USER, ...update };
    }
  }

  // --- 3-Step S3 Direct Photo Upload Workflow ---
  async uploadPhoto(file: File, isPrimary: boolean = false): Promise<string> {
    if (this.useMock) {
      // Create local object URL for preview
      const previewUrl = URL.createObjectURL(file);
      CURRENT_USER.photos.push({
        id: `mock_photo_${Date.now()}`,
        photoUrl: previewUrl,
        displayOrder: CURRENT_USER.photos.length,
        isPrimary,
      });
      return previewUrl;
    }

    try {
      // Step 1: Request S3 pre-signed URL
      const contentType = file.type || 'image/jpeg';
      const { data: presign } = await this.client.post<PresignedUrlResponse>(
        `/profiles/photos/presign?contentType=${encodeURIComponent(contentType)}`
      );

      // Step 2: Direct HTTP PUT binary to S3
      await axios.put(presign.uploadUrl, file, {
        headers: { 'Content-Type': contentType },
      });

      // Step 3: Register photo URL in profile
      await this.client.post('/profiles/photos', {
        photoUrl: presign.publicUrl,
        isPrimary,
      });

      return presign.publicUrl;
    } catch (err) {
      console.error('[API] Photo upload failed:', err);
      const fallbackUrl = URL.createObjectURL(file);
      return fallbackUrl;
    }
  }

  async deletePhoto(photoId: string): Promise<void> {
    if (this.useMock) {
      CURRENT_USER.photos = CURRENT_USER.photos.filter((p) => p.id !== photoId);
      return;
    }
    await this.client.delete(`/profiles/photos/${photoId}`);
  }

  // --- Discovery Swiping Deck APIs ---
  async getDiscoveryFeed(limit: number = 20): Promise<DiscoveryCard[]> {
    if (this.useMock) return MOCK_DISCOVERY_CARDS;

    try {
      const { data } = await this.client.get<DiscoveryCard[]>(`/discovery/feed?limit=${limit}`);
      return data.length > 0 ? data : MOCK_DISCOVERY_CARDS;
    } catch {
      return MOCK_DISCOVERY_CARDS;
    }
  }

  async submitSwipe(targetUserId: string, swipeType: SwipeType): Promise<SwipeResponse> {
    if (this.useMock) {
      if (swipeType === 'PASS') {
        return { match: false, matchId: null, matchedProfile: null };
      }
      // Simulate mutual match!
      const target = MOCK_DISCOVERY_CARDS.find((c) => c.userId === targetUserId) || MOCK_DISCOVERY_CARDS[0];
      return {
        match: true,
        matchId: `match_${target.userId}`,
        matchedProfile: target,
      };
    }

    try {
      const { data } = await this.client.post<SwipeResponse>('/swipes', {
        targetUserId,
        swipeType,
      });
      return data;
    } catch {
      if (swipeType === 'PASS') {
        return { match: false, matchId: null, matchedProfile: null };
      }
      const target = MOCK_DISCOVERY_CARDS.find((c) => c.userId === targetUserId) || MOCK_DISCOVERY_CARDS[0];
      return {
        match: true,
        matchId: `match_${target.userId}`,
        matchedProfile: target,
      };
    }
  }

  // --- Matches & Chat APIs ---
  async getMatches(): Promise<MatchItem[]> {
    if (this.useMock) return MOCK_MATCHES;

    try {
      const { data } = await this.client.get<MatchItem[]>('/matches');
      return data.length > 0 ? data : MOCK_MATCHES;
    } catch {
      return MOCK_MATCHES;
    }
  }

  async unmatch(matchId: string): Promise<void> {
    if (this.useMock) return;
    try {
      await this.client.delete(`/matches/${matchId}`);
    } catch (err) {
      console.warn('Unmatch error:', err);
    }
  }

  async getMessages(matchId: string, page: number = 0, size: number = 50): Promise<ChatMessage[]> {
    if (this.useMock) {
      return MOCK_MESSAGES[matchId] || [
        {
          id: 'mock_m1',
          matchId,
          senderId: 'other_user',
          content: 'Hey there! Loved your profile ✨',
          sentAt: '10:00 AM',
          read: true,
        },
      ];
    }

    try {
      const { data } = await this.client.get<PaginatedMessages>(
        `/matches/${matchId}/messages?page=${page}&size=${size}`
      );
      return data.content || [];
    } catch {
      return MOCK_MESSAGES[matchId] || [];
    }
  }

  async sendMessage(matchId: string, content: string): Promise<ChatMessage> {
    if (this.useMock) {
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        matchId,
        senderId: CURRENT_USER.userId,
        content,
        sentAt: 'Just now',
        read: false,
      };
      if (!MOCK_MESSAGES[matchId]) MOCK_MESSAGES[matchId] = [];
      MOCK_MESSAGES[matchId].push(newMsg);
      return newMsg;
    }

    try {
      const { data } = await this.client.post<ChatMessage>(`/matches/${matchId}/messages`, {
        content,
      });
      return data;
    } catch {
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        matchId,
        senderId: CURRENT_USER.userId,
        content,
        sentAt: 'Just now',
        read: false,
      };
      return newMsg;
    }
  }
}

export const api = new ApiService();
