# PlayPortal — Comprehensive Viva Preparation Guide

This guide equips you with all architectural knowledge, technical justifications, and system flows necessary to confidently defend the PlayPortal project in your final-year B.E. Computer Science & Engineering capstone viva.

---

## 1. Project Synopsis & Objectives
- **Problem:** Existing game distribution systems require heavy local desktop installations, lack built-in real-time casual multiplayer, and present steep hosting overheads for student and indie developers.
- **Solution:** PlayPortal is an integrated web gaming portal featuring:
  1. Zero-install HTML5 Canvas browser gaming with sandboxed iframe isolation.
  2. Role-Based Access Control (RBAC) separating Players, Developers, and Admins.
  3. Safe developer ZIP uploads with automated Zip Slip path traversal mitigation.
  4. Admin moderation workflow ensuring high-quality published games.
  5. Game-specific high score tracking and dynamic podium leaderboards.
  6. Server-authoritative real-time 1v1 Tic-Tac-Toe multiplayer via Socket.IO.

---

## 2. Core System Flows

### A. Authentication & Session Flow
1. User submits email & password to `POST /api/auth/login`.
2. Backend queries MongoDB (`+passwordHash`), checks `isActive === true`, and executes `bcrypt.compare`.
3. If valid, server signs JWT payload `{ id, role }` using `JWT_SECRET` with 7-day validity.
4. Client stores JWT in `localStorage` and injects it via Axios request interceptors.
5. On page refresh, React `AuthProvider` queries `GET /api/auth/me` to restore the active user session.

### B. Developer Upload & Moderation Flow
1. Developer submits metadata, cover image, and game ZIP to `POST /api/developer/games` (guarded by `authorize('DEVELOPER', 'ADMIN')`).
2. Multer verifies MIME type and file size (max 25MB).
3. Storage service inspects ZIP entries, confirms `index.html` exists, validates that all paths remain inside the target extraction directory (Zip Slip defense), and extracts files to `uploads/games/<gameId>/`.
4. Game is created with status `PENDING`, and a `GameSubmission` record is placed in the moderation queue.
5. Admin opens Admin Panel (`GET /api/admin/submissions`), previews the playable game, and clicks **Approve** (`PATCH /api/admin/submissions/:id/approve`).
6. The game status is updated to `PUBLISHED`, making it instantly discoverable in the public game catalog.

### C. Score Submission & Leaderboard Flow
1. Player completes a game inside the iframe.
2. The game dispatches `window.parent.postMessage({ type: 'PLAYPORTAL_GAME_OVER', score: 1250 }, '*')`.
3. React application captures the event and displays the `ScoreSubmitModal`.
4. Player clicks **Submit to Leaderboard** (`POST /api/games/:id/scores`).
5. Backend verifies JWT, confirms the game is `PUBLISHED` and has `supportsScores === true`, then inserts a `Score` record.
6. The Leaderboard endpoint (`GET /api/games/:id/leaderboard`) runs an efficient MongoDB aggregation query grouping the highest score per user and assigning ranks #1, #2, #3...

### D. Multiplayer Synchronization Flow (Tic-Tac-Toe)
1. Host clicks **Create Private Room**; server generates 6-character room code `7X9K2P`, assigns Host as Player 'X', and enters `WAITING` status.
2. Opponent enters room code; server assigns Opponent as Player 'O', creates `Match` record in MongoDB, and emits `game_start` to both players.
3. Players alternate moves sending `make_move` with cell index (0–8).
4. Server validates turn, verifies cell is vacant, applies move to in-memory board, and checks 8 geometric winning combinations.
5. If a player wins or all cells fill (draw), server emits `game_over` and persists the result (`WIN`, `DRAW`) to MongoDB.

---

## 3. Key Technical Decisions & Justifications

| Technical Decision | Why it was Chosen | Why Alternatives Were Rejected |
| :--- | :--- | :--- |
| **MERN Stack (MongoDB, Express, React, Node.js)** | Unified JavaScript/JSON across frontend and backend; rapid prototyping, rich ecosystem. | Relational SQL/Java would add boilerplate for dynamic game metadata. |
| **Vite over Create-React-App** | Instant Hot Module Replacement (HMR) using native ES modules; builds in seconds. | CRA is deprecated and slow. |
| **Modular Monolith over Microservices** | Single unified codebase, easy local deployment, zero network latency between services, realistic for college project. | Microservices introduce distributed complexity, network latency, and deployment headaches. |
| **JWT over Stateful Sessions / Redis** | Stateless authentication eliminates session storage overhead on server memory. | Redis adds an external database dependency unnecessary for MVP scale. |
| **Iframe Sandboxing over Injected Scripts** | Protects parent application DOM and authentication tokens from malicious third-party game code. | Script injection gives untrusted code access to DOM and cookies/localStorage. |
| **Socket.IO over Raw WebSockets** | Automatic reconnection, room multiplexing, and HTTP long-polling fallback. | Raw WebSockets require custom room management and heartbeat ping/pong logic. |

---

## 4. Limitations & Future Scope
- **Limitations:** Single-player client-side scores can theoretically be spoofed via browser DevTools (mitigated in multiplayer where logic is server-authoritative). ZIP extraction currently uses local disk storage.
- **Future Scope:** Cloudflare R2 / AWS S3 cloud asset storage, global tournaments, Elo matchmaking ratings, and player chat.
