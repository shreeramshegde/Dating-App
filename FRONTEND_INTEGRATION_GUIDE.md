# MeaowMatch — Frontend Integration Guide & API Specification

> **For Frontend Developers:** This document details all available REST APIs, STOMP WebSocket protocols, S3 photo upload procedures, TypeScript interfaces, and user workflows for building the **MeaowMatch** React application.

---

## 1. Quick Start & Connection Details

* **Backend Local Base URL:** `http://localhost:8080` (or `http://<EC2_PUBLIC_IP>:8080`)
* **Interactive Swagger UI:** `http://localhost:8080/swagger-ui/index.html`
* **OpenAPI Specification (JSON):** `http://localhost:8080/v3/api-docs`
* **Health Check Endpoint:** `http://localhost:8080/health`
* **STOMP WebSocket Endpoint:** `http://localhost:8080/ws` (SockJS fallback enabled)
* **Auth Scheme:** Stateless JWT (`Authorization: Bearer <token>`)
* **Default Content-Type:** `application/json`

---

## 2. User Roles & Core Workflows

MeaowMatch supports **3 distinct user roles**:

1. **`ADOPTER`**: Users looking to adopt a pet or provide a temporary foster home.
2. **`REHOMER`**: Pet owners facing relocation or animal shelters listing pets for adoption.
3. **`RESCUER`**: Citizens and animal spotters reporting injured, stray, or endangered animals in distress.

---

## 3. Complete REST API Reference

### 3.1 Authentication (`/api/v1/auth`)

#### 1. Register User
Creates an account with a chosen role and returns a JWT token.
* **Method & URL:** `POST /api/v1/auth/register`
* **Request Body:**
  ```json
  {
    "email": "sarah@example.com",
    "password": "password123",
    "role": "ADOPTER",
    "fullName": "Sarah Jenkins",
    "phone": "+1-555-0199",
    "city": "Austin, TX",
    "latitude": 30.2672,
    "longitude": -97.7431
  }
  ```
  *(Roles: `ADOPTER`, `REHOMER`, `RESCUER`)*
* **Success Response (`201 Created`):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "userId": "b42d5299-3ca5-4614-863a-ab9a3cb59002",
    "email": "sarah@example.com",
    "role": "ADOPTER",
    "fullName": "Sarah Jenkins",
    "profileCompleted": true
  }
  ```

#### 2. Login User
* **Method & URL:** `POST /api/v1/auth/login`
* **Request Body:**
  ```json
  {
    "email": "sarah@example.com",
    "password": "password123"
  }
  ```
* **Success Response (`200 OK`):** Returns the same payload as registration.

#### 3. Get Current User Profile
* **Method & URL:** `GET /api/v1/auth/me`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
  ```json
  {
    "id": "b42d5299-3ca5-4614-863a-ab9a3cb59002",
    "email": "sarah@example.com",
    "role": "ADOPTER",
    "fullName": "Sarah Jenkins",
    "phone": "+1-555-0199",
    "city": "Austin, TX",
    "latitude": 30.2672,
    "longitude": -97.7431
  }
  ```

---

### 3.2 Pet Listings & S3 Uploads (`/api/v1/pets`)

#### 1. Request S3 Pre-signed Upload URL
Before creating a pet listing, upload photos directly to S3 in 3 steps:
* **Method & URL:** `POST /api/v1/pets/photos/presign?contentType=image/jpeg`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
  ```json
  {
    "uploadUrl": "https://storage.neon.tech/photos/pets/.../uuid.jpg?X-Amz-Algorithm=...",
    "fileKey": "pets/user-xxx/uuid.jpg",
    "publicUrl": "https://storage.neon.tech/photos/pets/user-xxx/uuid.jpg"
  }
  ```
* **Client Action:** Perform an HTTP `PUT` directly to `uploadUrl` with the raw binary file as the body and matching `Content-Type: image/jpeg`. Then include `publicUrl` in the `photoUrls` list when creating the pet!

#### 2. Create Pet Listing (For `REHOMER` / Shelters)
* **Method & URL:** `POST /api/v1/pets`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "name": "Luna",
    "species": "CAT",
    "breed": "Domestic Shorthair",
    "ageMonths": 14,
    "gender": "FEMALE",
    "size": "SMALL",
    "description": "Playful and cuddly kitten who loves sunbeams.",
    "listingType": "ADOPTION",
    "urgency": "NORMAL",
    "healthStatus": "Fully vaccinated, spayed, microchipped",
    "latitude": 30.2672,
    "longitude": -97.7431,
    "city": "Austin, TX",
    "photoUrls": [
      "https://storage.neon.tech/photos/pets/user-xxx/uuid.jpg"
    ]
  }
  ```
  *(Species: `DOG`, `CAT`, `BIRD`, `REPTILE`, `SMALL_ANIMAL`, `OTHER`)*  
  *(Listing Types: `ADOPTION`, `FOSTER`, `RESCUE_ALERT`)*  
  *(Urgency: `NORMAL`, `HIGH`, `CRITICAL`)*

#### 3. Get Pet Details by ID
* **Method & URL:** `GET /api/v1/pets/{id}`

#### 4. List Pets Owned by Current User
* **Method & URL:** `GET /api/v1/pets/my-pets`
* **Headers:** `Authorization: Bearer <token>`

---

### 3.3 Adoption Discovery Deck (`/api/v1/discovery`)

#### Get Adoption Deck for Current User
Returns pets near the adopter not yet swiped on, filtered by species and max distance.
* **Method & URL:** `GET /api/v1/discovery/pets`
* **Headers:** `Authorization: Bearer <token>`
* **Query Parameters:**
  - `species`: (Optional) `DOG`, `CAT`, `BIRD`, `REPTILE`, `SMALL_ANIMAL`, `OTHER`
  - `listingType`: (Optional) `ADOPTION`, `FOSTER`
  - `latitude`: User's latitude
  - `longitude`: User's longitude
  - `maxDistanceKm`: Default `50`
  - `limit`: Default `20`
* **Success Response (`200 OK`):**
  ```json
  [
    {
      "id": "e76b25a8-8831-4c45-8225-86dfb51e68f1",
      "ownerId": "a11a22b3-...",
      "ownerName": "Austin Animal Haven",
      "name": "Luna",
      "species": "CAT",
      "breed": "Domestic Shorthair",
      "ageMonths": 14,
      "gender": "FEMALE",
      "size": "SMALL",
      "description": "Playful and cuddly kitten who loves sunbeams.",
      "listingType": "ADOPTION",
      "urgency": "NORMAL",
      "healthStatus": "Vaccinated and healthy",
      "status": "AVAILABLE",
      "city": "Austin, TX",
      "distanceKm": 4.2,
      "photos": [
        {
          "id": "f88b...",
          "photoUrl": "https://storage.neon.tech/photos/...",
          "displayOrder": 0,
          "isPrimary": true
        }
      ]
    }
  ]
  ```

---

### 3.4 Emergency Animal Rescue Alerts (`/api/v1/rescue-alerts`)

#### 1. Report an Injured or Stray Animal (For `RESCUER`s)
* **Method & URL:** `POST /api/v1/rescue-alerts`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "titleOrName": "Injured Golden Retriever puppy",
    "species": "DOG",
    "description": "Puppy found limping near highway 183 access road.",
    "injuryDetails": "Injured left hind leg, malnourished, scared.",
    "urgency": "CRITICAL",
    "latitude": 30.2849,
    "longitude": -97.7341,
    "city": "Austin, TX",
    "addressNote": "Behind the Shell gas station",
    "photoUrls": [
      "https://storage.neon.tech/photos/..."
    ]
  }
  ```

#### 2. Get Nearby Rescue Alerts
Public emergency feed prioritized with `CRITICAL` urgency alerts first.
* **Method & URL:** `GET /api/v1/rescue-alerts/nearby`
* **Query Parameters:** `species`, `latitude`, `longitude`, `maxDistanceKm` (default 50), `limit` (default 20).

#### 3. Respond to / Claim a Rescue Alert
Volunteers or rescue clinics claim the alert, opening an instant live chat with the reporter.
* **Method & URL:** `POST /api/v1/rescue-alerts/{id}/respond`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
  ```json
  {
    "matchId": "3882408d-6140-42c9-9493-5e9a904a037a",
    "message": "Successfully claimed rescue alert. Live coordination chat opened!"
  }
  ```

---

### 3.5 Adoption Swipes (`/api/v1/swipes`)

#### Submit Swipe on a Pet
* **Method & URL:** `POST /api/v1/swipes`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "petId": "e76b25a8-8831-4c45-8225-86dfb51e68f1",
    "type": "LIKE"
  }
  ```
  *(Type: `LIKE` or `PASS`)*
* **Success Response (`200 OK`):**
  ```json
  {
    "match": true,
    "matchId": "91a2b3c4-...",
    "matchedPet": {
      "id": "e76b25a8-...",
      "name": "Luna",
      "species": "CAT"
    },
    "message": "Congratulations! You matched with Luna!"
  }
  ```

---

### 3.6 Conversations & Real-Time Chat (`/api/v1/matches`)

#### 1. List Active Conversations
* **Method & URL:** `GET /api/v1/matches`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (`200 OK`):**
  ```json
  [
    {
      "matchId": "91a2b3c4-...",
      "matchedUserId": "a11a22b3-...",
      "matchedUserName": "Austin Animal Haven",
      "matchedUserRole": "REHOMER",
      "pet": {
        "id": "e76b25a8-...",
        "name": "Luna",
        "species": "CAT"
      },
      "matchType": "ADOPTION",
      "lastMessage": "Hi! We'd love to schedule a visit to meet Luna.",
      "unreadCount": 1,
      "matchedAt": "2026-10-30T10:00:00Z"
    }
  ]
  ```

#### 2. Get Message History
* **Method & URL:** `GET /api/v1/matches/{matchId}/messages?page=0&size=50`
* **Headers:** `Authorization: Bearer <token>`

#### 3. Send Message via REST (Fallback)
* **Method & URL:** `POST /api/v1/matches/{matchId}/messages`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "content": "Hello! When would be a good time to meet Luna?"
  }
  ```

---

## 4. Real-Time STOMP WebSocket Protocol

* **WebSocket Handshake URL:** `http://<EC2_IP>:8080/ws` (using SockJS)
* **STOMP Connect Headers:**
  ```javascript
  const client = new Client({
    webSocketFactory: () => new SockJS('http://<EC2_IP>:8080/ws'),
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    reconnectDelay: 5000,
  });
  ```

### WebSocket Topics:
1. **Subscribe to a Conversation**:
   - Destination: `/topic/match.{matchId}`
   - Incoming payload: `ChatMessageResponse` object.
2. **Send a Message over WebSocket**:
   - Publish to destination: `/app/chat.sendMessage`
   - Payload:
     ```json
     {
       "matchId": "91a2b3c4-...",
       "content": "Is Luna good with children?"
     }
     ```
3. **Personal User Notifications**:
   - Destination: `/user/queue/notifications`
   - Receives instant alerts for adoption inquiries (`ADOPTION_INQUIRY`) and rescue responses (`RESCUE_RESPONSE`).
