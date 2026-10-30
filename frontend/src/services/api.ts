import axios, { AxiosInstance } from 'axios';
import { 
  AuthResponse, 
  UserProfile, 
  PetResponse, 
  PetCreateRequest,
  RescueReportRequest,
  SwipeResponse, 
  MatchItem, 
  ChatMessage, 
  PresignedUrlResponse,
  SwipeType,
  Species,
  ListingType,
  UserRole
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://3.25.130.67:8080/api/v1';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    // Interceptor to inject JWT Bearer Token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token && config.headers) {
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers.Authorization = authHeader;
      }
      return config;
    });

    // Global response interceptor for 401 Unauthorized handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token invalid or expired
          this.setToken(null);
        }
        return Promise.reject(error);
      }
    );
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

  // --- Auth APIs ---
  async register(
    email: string, 
    password: string, 
    role: UserRole = 'ADOPTER',
    fullName?: string,
    phone?: string,
    city?: string,
    latitude?: number,
    longitude?: number
  ): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/register', { 
      email, 
      password,
      role,
      fullName: fullName || 'New Member',
      phone: phone || '',
      city: city || 'Austin, TX',
      latitude: latitude ?? 30.2672,
      longitude: longitude ?? -97.7431
    });

    if (data?.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/login', { email, password });
    if (data?.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const { data } = await this.client.get<UserProfile>('/auth/me');
    return data;
  }

  async updateProfile(update: Partial<UserProfile>): Promise<UserProfile> {
    const { data } = await this.client.put<UserProfile>('/auth/me', update);
    return data;
  }

  // --- Pet Listings & Photo Upload APIs ---
  async getMyPets(): Promise<PetResponse[]> {
    try {
      const { data } = await this.client.get<PetResponse[]>('/pets/my-pets');
      return Array.isArray(data) ? data : [];
    } catch {
      try {
        const { data } = await this.client.get<PetResponse[]>('/pets/my');
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn('[API] Could not fetch my-pets:', err);
        return [];
      }
    }
  }

  async createPet(request: PetCreateRequest): Promise<PetResponse> {
    const { data } = await this.client.post<PetResponse>('/pets', request);
    return data;
  }

  async deletePet(petId: string): Promise<void> {
    await this.client.delete(`/pets/${petId}`);
  }

  // --- 3-Step S3 Direct Photo Upload Workflow ---
  async uploadPhotoToS3(file: File): Promise<string> {
    const contentType = file.type || 'image/jpeg';

    // Step 1: Request pre-signed S3 URL (tries /pets/photos/presign, falls back to /profiles/photos/presign)
    let presign: PresignedUrlResponse;
    try {
      const res = await this.client.post<PresignedUrlResponse>(
        `/pets/photos/presign?contentType=${encodeURIComponent(contentType)}`
      );
      presign = res.data;
    } catch {
      const res = await this.client.post<PresignedUrlResponse>(
        `/profiles/photos/presign?contentType=${encodeURIComponent(contentType)}`
      );
      presign = res.data;
    }

    if (!presign || !presign.uploadUrl) {
      throw new Error('Server did not return a valid pre-signed S3 upload URL.');
    }

    // Step 2: Binary direct PUT to S3
    await axios.put(presign.uploadUrl, file, {
      headers: { 'Content-Type': contentType },
      timeout: 30000,
    });

    // Step 3: Return public URL to link in Pet or Rescue alert
    return presign.publicUrl;
  }

  // --- Discovery Swiping Deck APIs ---
  async getDiscoveryPets(
    species?: Species,
    listingType?: ListingType,
    latitude?: number,
    longitude?: number,
    maxDistanceKm: number = 50,
    limit: number = 20
  ): Promise<PetResponse[]> {
    const params = new URLSearchParams();
    if (species) params.append('species', species);
    if (listingType) params.append('listingType', listingType);
    if (latitude) params.append('latitude', String(latitude));
    if (longitude) params.append('longitude', String(longitude));
    params.append('maxDistanceKm', String(maxDistanceKm));
    params.append('limit', String(limit));

    try {
      const { data } = await this.client.get<PetResponse[]>(`/discovery/pets?${params.toString()}`);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[API] Could not fetch discovery pets from backend:', err);
      return [];
    }
  }

  async submitSwipe(petId: string, type: SwipeType): Promise<SwipeResponse> {
    const { data } = await this.client.post<SwipeResponse>('/swipes', {
      petId,
      type,
    });

    const isMatch = (data as any).match ?? (data as any).isMatch ?? false;
    return {
      ...data,
      match: isMatch,
    };
  }

  // --- Emergency Animal Rescue Alerts APIs ---
  async getNearbyRescueAlerts(
    species?: Species,
    latitude?: number,
    longitude?: number,
    maxDistanceKm: number = 50,
    limit: number = 20
  ): Promise<PetResponse[]> {
    const params = new URLSearchParams();
    if (species) params.append('species', species);
    if (latitude) params.append('latitude', String(latitude));
    if (longitude) params.append('longitude', String(longitude));
    params.append('maxDistanceKm', String(maxDistanceKm));
    params.append('limit', String(limit));

    try {
      const { data } = await this.client.get<PetResponse[]>(`/rescue-alerts/nearby?${params.toString()}`);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[API] Could not fetch nearby rescue alerts:', err);
      return [];
    }
  }

  async reportRescueAlert(request: RescueReportRequest): Promise<PetResponse> {
    const { data } = await this.client.post<PetResponse>('/rescue-alerts', request);
    return data;
  }

  async respondToRescueAlert(alertId: string): Promise<{ matchId: string; message: string }> {
    const { data } = await this.client.post<{ matchId: string; message: string }>(
      `/rescue-alerts/${alertId}/respond`
    );
    return data;
  }

  // --- Conversations & Real-Time Chat APIs ---
  async getMatches(): Promise<MatchItem[]> {
    try {
      const { data } = await this.client.get<MatchItem[]>('/matches');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[API] Could not fetch matches:', err);
      return [];
    }
  }

  async unmatch(matchId: string): Promise<void> {
    await this.client.delete(`/matches/${matchId}`);
  }

  async getMessages(matchId: string, page: number = 0, size: number = 50): Promise<ChatMessage[]> {
    try {
      const { data } = await this.client.get<any>(
        `/matches/${matchId}/messages?page=${page}&size=${size}`
      );
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.content)) return data.content;
      return [];
    } catch (err) {
      console.warn(`[API] Could not fetch messages for ${matchId}:`, err);
      return [];
    }
  }

  async sendMessage(matchId: string, content: string): Promise<ChatMessage> {
    const { data } = await this.client.post<ChatMessage>(`/matches/${matchId}/messages`, {
      content,
    });
    return data;
  }

  async markMessagesRead(matchId: string): Promise<void> {
    try {
      await this.client.post(`/matches/${matchId}/read`);
    } catch {
      // ignore
    }
  }
}

export const api = new ApiService();
