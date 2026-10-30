export type UserRole = 'ADOPTER' | 'REHOMER' | 'RESCUER';

export type Species = 'DOG' | 'CAT' | 'BIRD' | 'REPTILE' | 'SMALL_ANIMAL' | 'OTHER';

export type ListingType = 'ADOPTION' | 'FOSTER' | 'RESCUE_ALERT';

export type Urgency = 'NORMAL' | 'HIGH' | 'CRITICAL';

export type PetGender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export type PetSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export type PetStatus = 'AVAILABLE' | 'PENDING' | 'ADOPTED' | 'RESCUED';

export type SwipeType = 'LIKE' | 'PASS';

export interface PetPhoto {
  id: string;
  photoUrl: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface PetResponse {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  name: string;
  species: Species;
  breed: string;
  ageMonths: number;
  gender: PetGender;
  size: PetSize;
  description: string;
  listingType: ListingType;
  urgency: Urgency;
  healthStatus: string;
  status: PetStatus;
  latitude?: number;
  longitude?: number;
  city: string;
  distanceKm?: number;
  photos: PetPhoto[];
  createdAt?: string;
}

export interface PetCreateRequest {
  name: string;
  species: Species;
  breed?: string;
  ageMonths?: number;
  gender?: PetGender;
  size?: PetSize;
  description?: string;
  listingType?: ListingType;
  urgency?: Urgency;
  healthStatus?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  photoUrls?: string[];
}

export interface RescueReportRequest {
  titleOrName?: string;
  species: Species;
  description?: string;
  injuryDetails?: string;
  urgency: Urgency;
  latitude: number;
  longitude: number;
  city?: string;
  addressNote?: string;
  photoUrls?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  profileCompleted: boolean;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

export interface SwipeRequest {
  petId: string;
  type: SwipeType;
}

export interface SwipeResponse {
  match: boolean;
  matchId: string | null;
  matchedPet: PetResponse | null;
  message: string;
}

export interface MatchItem {
  matchId: string;
  matchedUserId: string;
  matchedUserName: string;
  matchedUserRole: string;
  pet: PetResponse;
  matchType: string;
  lastMessage: string | null;
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
