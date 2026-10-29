export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type GenderPreference = 'MALE' | 'FEMALE' | 'EVERYONE';
export type SwipeType = 'LIKE' | 'PASS';

export interface ProfilePhoto {
  id: string;
  photoUrl: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  birthDate?: string;
  age: number;
  gender: Gender;
  genderPreference: GenderPreference;
  bio: string;
  latitude?: number;
  longitude?: number;
  city: string;
  maxDistanceKm: number;
  minAgePref: number;
  maxAgePref: number;
  photos: ProfilePhoto[];
}

export interface DiscoveryCard {
  userId: string;
  firstName: string;
  age: number;
  gender: Gender;
  bio: string;
  city: string;
  distanceKm: number | null;
  photos: ProfilePhoto[];
}

export interface SwipeRequest {
  targetUserId: string;
  swipeType: SwipeType;
}

export interface SwipeResponse {
  match: boolean;
  matchId: string | null;
  matchedProfile: DiscoveryCard | null;
}

export interface MatchItem {
  matchId: string;
  targetUserId: string;
  targetFirstName: string;
  targetPhotoUrl: string;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  matchedAt: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  sentAt: string;
  read: boolean;
}

export interface PaginatedMessages {
  content: ChatMessage[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  profileCompleted: boolean;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

export interface ProfileUpdateRequest {
  firstName: string;
  birthDate: string;
  gender: Gender;
  genderPreference: GenderPreference;
  bio: string;
  latitude?: number;
  longitude?: number;
  city: string;
  maxDistanceKm: number;
  minAgePref: number;
  maxAgePref: number;
}
