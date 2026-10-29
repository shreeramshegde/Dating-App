import { UserProfile, DiscoveryCard, MatchItem, ChatMessage } from '../types';

export const CURRENT_USER: UserProfile = {
  userId: 'b42d5299-3ca5-4614-863a-ab9a3cb59002',
  email: 'alex.dating@example.com',
  firstName: 'Alex',
  birthDate: '1998-05-14',
  age: 26,
  gender: 'MALE',
  genderPreference: 'FEMALE',
  bio: 'Product Designer at TechFlow. Design nerd, specialty coffee addict, and amateur film photographer. Always down for late night gallery walks or finding the best ramen spot in town.',
  latitude: 37.7749,
  longitude: -122.4194,
  city: 'San Francisco',
  maxDistanceKm: 50,
  minAgePref: 21,
  maxAgePref: 32,
  photos: [
    {
      id: 'photo_alex_1',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      displayOrder: 0,
      isPrimary: true,
    },
    {
      id: 'photo_alex_2',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
      displayOrder: 1,
      isPrimary: false,
    },
  ],
};

export const MOCK_DISCOVERY_CARDS: DiscoveryCard[] = [
  {
    userId: '894e3482-4c1f-4824-8438-2209e6b60bed',
    firstName: 'Sophia',
    age: 25,
    gender: 'FEMALE',
    bio: 'Architectural Consultant • Sustainable spaces, mid-century furniture, and spontaneous weekend road trips to coastal towns. The best way to win me over: suggest an obscure museum followed by arguing over matcha lattes 🍵',
    city: 'San Francisco',
    distanceKm: 2.4,
    photos: [
      {
        id: 'p_sophia_1',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 0,
        isPrimary: true,
      },
      {
        id: 'p_sophia_2',
        photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 1,
        isPrimary: false,
      },
    ],
  },
  {
    userId: '921c1284-7d2e-4195-a739-1198e5b41cad',
    firstName: 'Elena',
    age: 24,
    gender: 'FEMALE',
    bio: 'Biotech Research Scientist • Deciphering molecular genetics by day, rock climbing and trying every Thai street food stall by weekend. Looking for a partner in crime for film festivals and coffee walks 🧗‍♀️',
    city: 'San Francisco',
    distanceKm: 5.1,
    photos: [
      {
        id: 'p_elena_1',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 0,
        isPrimary: true,
      },
      {
        id: 'p_elena_2',
        photoUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 1,
        isPrimary: false,
      },
    ],
  },
  {
    userId: '445e9912-1a2f-4881-8172-3392a8c19bee',
    firstName: 'Maya',
    age: 26,
    gender: 'FEMALE',
    bio: 'Documentary Filmmaker • Telling stories about urban ecosystems and folk musicians. Vinyl records, vintage Super 8 cameras, and spicy chai. Together we could road trip the Pacific Coast with no GPS 🎥',
    city: 'Berkeley',
    distanceKm: 8.7,
    photos: [
      {
        id: 'p_maya_1',
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 0,
        isPrimary: true,
      },
    ],
  },
  {
    userId: '778a4419-5d3e-4991-8812-4491b7d88fed',
    firstName: 'Chloe',
    age: 27,
    gender: 'FEMALE',
    bio: 'Ceramicist & Coffee Roaster • Hand-thrown mugs, Japanese minimalism, and sourdough experimenting. Looking for someone genuine who loves slow Sunday mornings and good conversation ☕',
    city: 'Oakland',
    distanceKm: 12.0,
    photos: [
      {
        id: 'p_chloe_1',
        photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80',
        displayOrder: 0,
        isPrimary: true,
      },
    ],
  },
];

export const MOCK_MATCHES: MatchItem[] = [
  {
    matchId: '242e84b7-c4e9-47f5-ae4f-e5e8970bbc8d',
    targetUserId: '894e3482-4c1f-4824-8438-2209e6b60bed',
    targetFirstName: 'Sophia',
    targetPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80',
    lastMessage: 'Hey Sophia! Loved your design portfolio...',
    lastMessageTime: '10:18 AM',
    unreadCount: 1,
    matchedAt: 'Just now',
  },
  {
    matchId: '681e1942-8c11-4712-9901-5519e8a77d1a',
    targetUserId: '921c1284-7d2e-4195-a739-1198e5b41cad',
    targetFirstName: 'Elena',
    targetPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    lastMessage: 'That Castle Rock climb looks intense! Did you send it?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    matchedAt: 'Yesterday',
  },
];

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  '242e84b7-c4e9-47f5-ae4f-e5e8970bbc8d': [
    {
      id: 'msg_01',
      matchId: '242e84b7-c4e9-47f5-ae4f-e5e8970bbc8d',
      senderId: 'b42d5299-3ca5-4614-863a-ab9a3cb59002',
      content: 'Hey Sophia! I saw your note about the obscure museum and matcha debate. I know an underground sound installation in SOMA you would love!',
      sentAt: '10:15 AM',
      read: true,
    },
    {
      id: 'msg_02',
      matchId: '242e84b7-c4e9-47f5-ae4f-e5e8970bbc8d',
      senderId: '894e3482-4c1f-4824-8438-2209e6b60bed',
      content: 'Wait really?! That sounds right up my alley ✨ Where is it located?',
      sentAt: '10:18 AM',
      read: false,
    },
  ],
};
