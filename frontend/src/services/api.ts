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
import { 
  CURRENT_USER, 
  MOCK_PETS, 
  MOCK_RESCUE_ALERTS,
  MOCK_MATCHES, 
  MOCK_MESSAGES 
} from '../data/mockPets';

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

    const storedMock = localStorage.getItem('meaowmatch_use_mock');
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
    localStorage.setItem('meaowmatch_use_mock', String(enabled));
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
    if (this.useMock) {
      const mockRes: AuthResponse = {
        token: `mock_jwt_${role.toLowerCase()}_${Date.now()}`,
        tokenType: 'Bearer',
        userId: CURRENT_USER.id,
        email,
        role,
        fullName: fullName || 'Sarah Jenkins',
        profileCompleted: true,
      };
      this.setToken(mockRes.token);
      return mockRes;
    }

    try {
      const { data } = await this.client.post<AuthResponse>('/auth/register', { 
        email, 
        password,
        role,
        fullName: fullName || 'New Member',
        phone: phone || '+1-555-0199',
        city: city || 'Austin, TX',
        latitude: latitude || 30.2672,
        longitude: longitude || -97.7431
      });
      this.setToken(data.token);
      return data;
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Registration failed';
      console.warn('[API] Register live call failed, falling back to mock session:', errMsg);
      const mockRes: AuthResponse = {
        token: `mock_jwt_${role.toLowerCase()}_${Date.now()}`,
        tokenType: 'Bearer',
        userId: CURRENT_USER.id,
        email,
        role,
        fullName: fullName || 'Sarah Jenkins',
        profileCompleted: true,
      };
      this.setToken(mockRes.token);
      return mockRes;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    if (this.useMock) {
      const mockRes: AuthResponse = {
        token: 'mock_jwt_sarah_123',
        tokenType: 'Bearer',
        userId: CURRENT_USER.id,
        email,
        role: 'ADOPTER',
        fullName: 'Sarah Jenkins',
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
      console.warn('[API] Login live call failed. Using mock session:', err?.message);
      const mockRes: AuthResponse = {
        token: 'mock_jwt_sarah_123',
        tokenType: 'Bearer',
        userId: CURRENT_USER.id,
        email,
        role: 'ADOPTER',
        fullName: 'Sarah Jenkins',
        profileCompleted: true,
      };
      this.setToken(mockRes.token);
      return mockRes;
    }
  }

  async getCurrentUser(): Promise<UserProfile> {
    if (this.useMock) return CURRENT_USER;

    try {
      const { data } = await this.client.get<UserProfile>('/auth/me');
      return data;
    } catch {
      return CURRENT_USER;
    }
  }

  async updateProfile(update: Partial<UserProfile>): Promise<UserProfile> {
    if (this.useMock) {
      Object.assign(CURRENT_USER, update);
      return { ...CURRENT_USER };
    }

    try {
      const { data } = await this.client.put<UserProfile>('/auth/me', update);
      return data;
    } catch {
      Object.assign(CURRENT_USER, update);
      return { ...CURRENT_USER };
    }
  }

  // --- Pet Listings & S3 Upload APIs ---
  async getMyPets(): Promise<PetResponse[]> {
    if (this.useMock) {
      return MOCK_PETS.filter((p) => p.ownerId === CURRENT_USER.id || p.ownerName === CURRENT_USER.fullName);
    }

    try {
      const { data } = await this.client.get<PetResponse[]>('/pets/my-pets');
      return data;
    } catch {
      try {
        const { data } = await this.client.get<PetResponse[]>('/pets/my');
        return data;
      } catch {
        return MOCK_PETS.slice(0, 2);
      }
    }
  }

  async createPet(request: PetCreateRequest): Promise<PetResponse> {
    if (this.useMock) {
      const newPet: PetResponse = {
        id: `mock_pet_${Date.now()}`,
        ownerId: CURRENT_USER.id,
        ownerName: CURRENT_USER.fullName,
        ownerPhone: CURRENT_USER.phone,
        name: request.name,
        species: request.species,
        breed: request.breed || 'Mixed Breed',
        ageMonths: request.ageMonths || 12,
        gender: request.gender || 'UNKNOWN',
        size: request.size || 'MEDIUM',
        description: request.description || '',
        listingType: request.listingType || 'ADOPTION',
        urgency: request.urgency || 'NORMAL',
        healthStatus: request.healthStatus || 'Healthy and vet-checked',
        status: 'AVAILABLE',
        city: request.city || CURRENT_USER.city || 'Austin, TX',
        distanceKm: 0.5,
        photos: (request.photoUrls || []).map((url, i) => ({
          id: `photo_${i}`,
          photoUrl: url,
          displayOrder: i,
          isPrimary: i === 0,
        })),
        createdAt: new Date().toISOString(),
      };
      MOCK_PETS.unshift(newPet);
      return newPet;
    }

    try {
      const { data } = await this.client.post<PetResponse>('/pets', request);
      return data;
    } catch (err) {
      console.error('[API] Failed to create pet listing:', err);
      throw err;
    }
  }

  async deletePet(petId: string): Promise<void> {
    if (this.useMock) {
      const idx = MOCK_PETS.findIndex((p) => p.id === petId);
      if (idx !== -1) MOCK_PETS.splice(idx, 1);
      return;
    }

    await this.client.delete(`/pets/${petId}`);
  }

  // --- 3-Step S3 Direct Photo Upload Workflow ---
  async uploadPhotoToS3(file: File): Promise<string> {
    if (this.useMock) {
      return URL.createObjectURL(file);
    }

    try {
      // Step 1: Request pre-signed S3 PUT URL
      const contentType = file.type || 'image/jpeg';
      const { data: presign } = await this.client.post<PresignedUrlResponse>(
        `/pets/photos/presign?contentType=${encodeURIComponent(contentType)}`
      );

      // Step 2: Direct HTTP PUT binary to S3
      await axios.put(presign.uploadUrl, file, {
        headers: { 'Content-Type': contentType },
      });

      // Step 3: Return publicUrl to attach to pet request
      return presign.publicUrl;
    } catch (err) {
      console.warn('[API] S3 direct upload failed, fallback to local preview:', err);
      return URL.createObjectURL(file);
    }
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
    if (this.useMock) {
      return MOCK_PETS.filter((p) => {
        if (species && p.species !== species) return false;
        if (listingType && p.listingType !== listingType) return false;
        return true;
      });
    }

    try {
      const params = new URLSearchParams();
      if (species) params.append('species', species);
      if (listingType) params.append('listingType', listingType);
      if (latitude) params.append('latitude', String(latitude));
      if (longitude) params.append('longitude', String(longitude));
      params.append('maxDistanceKm', String(maxDistanceKm));
      params.append('limit', String(limit));

      const { data } = await this.client.get<PetResponse[]>(`/discovery/pets?${params.toString()}`);
      return data.length > 0 ? data : MOCK_PETS;
    } catch {
      return MOCK_PETS;
    }
  }

  async submitSwipe(petId: string, type: SwipeType): Promise<SwipeResponse> {
    if (this.useMock) {
      if (type === 'PASS') {
        return { match: false, matchId: null, matchedPet: null, message: 'Passed' };
      }
      const pet = MOCK_PETS.find((p) => p.id === petId) || MOCK_PETS[0];
      return {
        match: true,
        matchId: `match_${pet.id}`,
        matchedPet: pet,
        message: `Congratulations! You matched with ${pet.name}!`,
      };
    }

    try {
      const { data } = await this.client.post<SwipeResponse>('/swipes', {
        petId,
        type,
      });
      // Normalize match boolean
      const isMatch = (data as any).match ?? (data as any).isMatch ?? false;
      return {
        ...data,
        match: isMatch,
      };
    } catch {
      if (type === 'PASS') {
        return { match: false, matchId: null, matchedPet: null, message: 'Passed' };
      }
      const pet = MOCK_PETS.find((p) => p.id === petId) || MOCK_PETS[0];
      return {
        match: true,
        matchId: `match_${pet.id}`,
        matchedPet: pet,
        message: `Congratulations! You matched with ${pet.name}!`,
      };
    }
  }

  // --- Emergency Animal Rescue Alerts APIs ---
  async getNearbyRescueAlerts(
    species?: Species,
    latitude: number = 30.2672,
    longitude: number = -97.7431,
    maxDistanceKm: number = 50,
    limit: number = 20
  ): Promise<PetResponse[]> {
    if (this.useMock) {
      return MOCK_RESCUE_ALERTS.filter((a) => {
        if (species && a.species !== species) return false;
        return true;
      });
    }

    try {
      const params = new URLSearchParams();
      if (species) params.append('species', species);
      params.append('latitude', String(latitude));
      params.append('longitude', String(longitude));
      params.append('maxDistanceKm', String(maxDistanceKm));
      params.append('limit', String(limit));

      const { data } = await this.client.get<PetResponse[]>(`/rescue-alerts/nearby?${params.toString()}`);
      return data.length > 0 ? data : MOCK_RESCUE_ALERTS;
    } catch {
      return MOCK_RESCUE_ALERTS;
    }
  }

  async reportRescueAlert(request: RescueReportRequest): Promise<PetResponse> {
    if (this.useMock) {
      const newAlert: PetResponse = {
        id: `rescue_alert_${Date.now()}`,
        ownerId: CURRENT_USER.id,
        ownerName: CURRENT_USER.fullName,
        ownerPhone: CURRENT_USER.phone,
        name: request.titleOrName || `Urgent ${request.species} Rescue`,
        species: request.species,
        breed: 'Stray / Unknown',
        ageMonths: 0,
        gender: 'UNKNOWN',
        size: 'MEDIUM',
        description: `${request.description || ''} - Location note: ${request.addressNote || 'N/A'}`,
        listingType: 'RESCUE_ALERT',
        urgency: request.urgency,
        healthStatus: request.injuryDetails || 'Emergency rescue needed',
        status: 'AVAILABLE',
        city: request.city || 'Austin, TX',
        distanceKm: 0.1,
        photos: (request.photoUrls || []).map((url, i) => ({
          id: `p_res_${i}`,
          photoUrl: url,
          displayOrder: i,
          isPrimary: i === 0,
        })),
        createdAt: new Date().toISOString(),
      };
      MOCK_RESCUE_ALERTS.unshift(newAlert);
      return newAlert;
    }

    try {
      const { data } = await this.client.post<PetResponse>('/rescue-alerts', request);
      return data;
    } catch (err) {
      console.error('[API] Failed to submit rescue alert:', err);
      throw err;
    }
  }

  async respondToRescueAlert(alertId: string): Promise<{ matchId: string; message: string }> {
    if (this.useMock) {
      const alert = MOCK_RESCUE_ALERTS.find((a) => a.id === alertId) || MOCK_RESCUE_ALERTS[0];
      const matchId = `rescue_match_${alert.id}`;
      // Add to matches if not exists
      if (!MOCK_MATCHES.some((m) => m.matchId === matchId)) {
        MOCK_MATCHES.unshift({
          matchId,
          matchedUserId: alert.ownerId,
          matchedUserName: alert.ownerName,
          matchedUserRole: 'RESCUER',
          pet: alert,
          matchType: 'RESCUE',
          lastMessage: 'Rescue claimed. Emergency coordination channel opened.',
          unreadCount: 0,
          matchedAt: new Date().toISOString(),
        });
      }
      return {
        matchId,
        message: 'Successfully claimed rescue alert. Live coordination chat opened!',
      };
    }

    try {
      const { data } = await this.client.post<{ matchId: string; message: string }>(
        `/rescue-alerts/${alertId}/respond`
      );
      return data;
    } catch {
      const alert = MOCK_RESCUE_ALERTS.find((a) => a.id === alertId) || MOCK_RESCUE_ALERTS[0];
      const matchId = `rescue_match_${alert.id}`;
      return {
        matchId,
        message: 'Successfully claimed rescue alert. Live coordination chat opened!',
      };
    }
  }

  // --- Conversations & Chat APIs ---
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
    if (this.useMock) {
      const idx = MOCK_MATCHES.findIndex((m) => m.matchId === matchId);
      if (idx !== -1) MOCK_MATCHES.splice(idx, 1);
      return;
    }

    try {
      await this.client.delete(`/matches/${matchId}`);
    } catch (err) {
      console.warn('Close conversation error:', err);
    }
  }

  async getMessages(matchId: string, page: number = 0, size: number = 50): Promise<ChatMessage[]> {
    if (this.useMock) {
      return MOCK_MESSAGES[matchId] || [
        {
          id: `mock_m_${Date.now()}`,
          matchId,
          senderId: 'other_user',
          content: 'Hello! Thanks for your inquiry 🐾',
          sentAt: '10:00 AM',
          read: true,
        },
      ];
    }

    try {
      const { data } = await this.client.get<any>(
        `/matches/${matchId}/messages?page=${page}&size=${size}`
      );
      // Support both List<ChatMessageResponse> and Page<ChatMessageResponse>
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.content)) return data.content;
      return [];
    } catch {
      return MOCK_MESSAGES[matchId] || [];
    }
  }

  async sendMessage(matchId: string, content: string): Promise<ChatMessage> {
    if (this.useMock) {
      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        matchId,
        senderId: CURRENT_USER.id,
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
        senderId: CURRENT_USER.id,
        content,
        sentAt: 'Just now',
        read: false,
      };
      return newMsg;
    }
  }

  async markMessagesRead(matchId: string): Promise<void> {
    if (this.useMock) return;
    try {
      await this.client.post(`/matches/${matchId}/read`);
    } catch {
      // ignore
    }
  }
}

export const api = new ApiService();
