# PlayPortal — Complete API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### Register User
- **Route:** `POST /api/auth/register`
- **Access:** Public
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Alice Player",
  "email": "alice@example.com",
  "password": "Password123!"
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6a9fd34cf654ffd8d05a67df",
    "name": "Alice Player",
    "email": "alice@example.com",
    "role": "PLAYER",
    "avatar": "",
    "isActive": true,
    "createdAt": "2026-09-08T09:20:12.886Z",
    "updatedAt": "2026-09-08T09:20:12.886Z"
  }
}
```

### Login User
- **Route:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "Password123!"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6a9fd34cf654ffd8d05a67df",
    "name": "Alice Player",
    "email": "alice@example.com",
    "role": "PLAYER",
    "avatar": "",
    "isActive": true
  }
}
```

### Get Authenticated User Profile
- **Route:** `GET /api/auth/me`
- **Access:** Authenticated (Bearer JWT Token)
- **Headers:** `Authorization: Bearer <token>`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "user": {
    "_id": "6a9fd34cf654ffd8d05a67df",
    "name": "Alice Player",
    "email": "alice@example.com",
    "role": "PLAYER",
    "avatar": "",
    "isActive": true
  }
}
```

---

## 2. User Profile & History Endpoints

### Update Profile
- **Route:** `PATCH /api/users/me`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "name": "Alice Champion",
  "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=Alice"
}
```
- **Response (`200 OK`):** Returns updated safe user object.

### Get Player Activity History
- **Route:** `GET /api/users/me/history`
- **Access:** Authenticated
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "recentScores": [
      {
        "_id": "score123",
        "score": 980,
        "createdAt": "2026-09-08T10:00:00.000Z",
        "game": { "_id": "game123", "title": "Cyber Dodger", "thumbnail": "/uploads/thumbnails/..." }
      }
    ],
    "personalBests": [
      {
        "_id": "game123",
        "bestScore": 980,
        "game": { "title": "Cyber Dodger", "category": "Action" }
      }
    ],
    "matches": [ ... ],
    "multiplayerStats": {
      "totalMatches": 12,
      "wins": 8,
      "draws": 2,
      "losses": 2
    }
  }
}
```

---

## 3. Game Discovery & Playing Endpoints

### List Published Games
- **Route:** `GET /api/games`
- **Access:** Public
- **Query Params:** `search`, `category`, `page` (default 1), `limit` (default 12), `sort` (`popular` | `newest` | `title`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "game123",
      "title": "Cyber Dodger",
      "description": "Fast-paced space arcade dodger...",
      "category": "Action",
      "thumbnail": "/uploads/thumbnails/thumb-cyber-dodger.svg",
      "gameUrl": "/uploads/games/game-cyber-dodger/index.html",
      "developer": { "_id": "dev123", "name": "Pixel Studio Dev" },
      "status": "PUBLISHED",
      "supportsScores": true,
      "playCount": 142
    }
  ],
  "pagination": { "total": 3, "page": 1, "limit": 12, "totalPages": 1, "hasMore": false }
}
```

### Get Game Details
- **Route:** `GET /api/games/:id`
- **Access:** Public
- **Response (`200 OK`):** Returns single game object with populated developer details.

---

## 4. Leaderboards & Scores Endpoints

### Get Game Leaderboard
- **Route:** `GET /api/games/:id/leaderboard`
- **Access:** Public
- **Query Params:** `limit` (default 20, max 100)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "_id": "score123",
      "userId": "user123",
      "score": 1850,
      "createdAt": "2026-09-08T09:30:00.000Z",
      "player": { "name": "Alex Player", "avatar": "..." }
    }
  ]
}
```

### Submit Game Score
- **Route:** `POST /api/games/:id/scores`
- **Access:** Authenticated
- **Request Body:**
```json
{ "score": 1250 }
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Score submitted successfully",
  "data": {
    "_id": "score456",
    "game": "game123",
    "user": "user123",
    "score": 1250,
    "createdAt": "2026-09-08T10:15:00.000Z"
  }
}
```

### Get User's Personal Scores for a Game
- **Route:** `GET /api/games/:id/scores/me`
- **Access:** Authenticated
- **Response (`200 OK`):** Returns `{ personalBest: { score, createdAt, rank }, recentScores: [...] }`.

---

## 5. Developer Portal Endpoints

### Upload HTML5 Game ZIP
- **Route:** `POST /api/developer/games`
- **Access:** `DEVELOPER` or `ADMIN` role
- **Headers:** `Content-Type: multipart/form-data`
- **Form Fields:** `title`, `description`, `category`, `supportsScores`, `thumbnail` (file), `gameFile` (ZIP file)
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Game uploaded and submitted for admin review successfully",
  "data": {
    "game": { "_id": "game789", "title": "...", "status": "PENDING" },
    "submission": { "_id": "sub789", "status": "PENDING" }
  }
}
```

### List Developer's Games
- **Route:** `GET /api/developer/games`
- **Access:** `DEVELOPER` or `ADMIN` role
- **Response (`200 OK`):** Array of games uploaded by developer with latest submission status.

---

## 6. Admin Panel Endpoints

### List Game Submissions Queue
- **Route:** `GET /api/admin/submissions`
- **Access:** `ADMIN` role
- **Query Params:** `status` (`PENDING`, `APPROVED`, `REJECTED`), `page`, `limit`
- **Response (`200 OK`):** Array of submissions with developer info and game preview URLs.

### Approve Game Submission
- **Route:** `PATCH /api/admin/submissions/:id/approve`
- **Access:** `ADMIN` role
- **Response (`200 OK`):** Marks submission `APPROVED` and Game `PUBLISHED`.

### Reject Game Submission
- **Route:** `PATCH /api/admin/submissions/:id/reject`
- **Access:** `ADMIN` role
- **Request Body:** `{ "rejectionReason": "Missing audio controls or broken canvas scaling" }`
- **Response (`200 OK`):** Marks submission `REJECTED` and records reason.

### List All Platform Users
- **Route:** `GET /api/admin/users`
- **Access:** `ADMIN` role
- **Query Params:** `search`, `role`, `page`, `limit`
- **Response (`200 OK`):** Paginated array of all user accounts.

### Toggle User Account Status
- **Route:** `PATCH /api/admin/users/:id/status`
- **Access:** `ADMIN` role
- **Request Body:** `{ "isActive": false }`
- **Response (`200 OK`):** Returns updated user with new active status.

### Remove Published Game
- **Route:** `DELETE /api/admin/games/:id`
- **Access:** `ADMIN` role
- **Response (`200 OK`):** Deletes the game, unlinks uploaded files, clears associated scores, and returns `{ success: true, message: "Game removed successfully" }`.

---

## 7. Health Check Endpoint
- **Route:** `GET /api/health`
- **Access:** Public
- **Response (`200 OK`):**
```json
{
  "status": "ok",
  "message": "PlayPortal API is running",
  "timestamp": "2026-09-08T09:11:58.548Z",
  "environment": "development",
  "database": "connected"
}
```
