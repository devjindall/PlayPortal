# PlayPortal — Practical Viva Demonstration Flow

Follow this sequence to showcase every feature of PlayPortal smoothly to project evaluators.

---

## Pre-Requisite: Quick Setup
Ensure both frontend and backend servers are running:
```bash
# Terminal 1: Backend Server (starts on http://localhost:5000)
cd server
npm run dev

# Terminal 2: Frontend Client (starts on http://localhost:5173)
cd client
npm run dev
```

---

## Step-by-Step Presentation Script

### 1. Landing Page & Platform Health (0:00 - 1:00)
- Navigate to `http://localhost:5173/`.
- **Explain:** Show the hero banner, platform pillars, featured game cards, and the live backend health badge confirming real-time connectivity with Express and MongoDB.

### 2. Player Experience & Game Play (1:00 - 2:30)
- Click **Explore Games** (`/games`) or select **Cyber Dodger** / **Neon Flap**.
- Demonstrate category filtering (`Action`, `Arcade`, `Puzzle`) and the search bar.
- Click **Details** on *Cyber Dodger* (`/games/:id`) to view game description and leaderboard preview.
- Click **Play Game Now** (`/games/:id/play`).
- Play the game inside the sandboxed iframe using arrow keys.
- Let the game end: observe the score popup modal (`ScoreSubmitModal`).
- Click **Quick Demo Login -> Player** to sign in as `Alex Player` (`player@playportal.com`), then submit your high score!

### 3. Game-Specific Leaderboard & Player History (2:30 - 3:30)
- Click **Leaderboard** (`/games/:id/leaderboard`).
- **Explain:** Point out the top-3 podium visualizer (Gold, Silver, Bronze) and the full rankings table.
- Click User Avatar -> **Game History** (`/profile/history`).
- **Explain:** Highlight the personal high scores, recent score submission timeline, and multiplayer statistics.

### 4. Developer Game Upload Workflow (3:30 - 5:00)
- Log out, then click **Quick Demo Login -> Developer** (`dev@playportal.com`).
- Click **Developer Portal** in the navigation header (`/developer`).
- Show the Developer Dashboard overview stats (`Total Games`, `Published`, `In Review`).
- Click **Upload New HTML5 Game** (`/developer/games/upload`).
- Enter title "Laser Quest", category "Arcade", pick a thumbnail, and choose a `.zip` archive.
- Click **Submit Game Package**.
- **Explain:** Highlight how the backend uses `AdmZip` to inspect the package, verifies `index.html`, protects against Zip Slip attacks, extracts assets, and places the submission into the `PENDING` moderation queue.

### 5. Admin Moderation & User Management (5:00 - 6:30)
- Log out, then click **Quick Demo Login -> Admin** (`admin@playportal.com`).
- Click **Admin Panel** in the navigation header (`/admin`).
- Show overview metrics: Pending Submissions, Published Games, Total Users.
- Click **Game Submissions Queue** (`/admin/submissions`).
- Click **Inspect & Review** on the pending game. Click **Open Playable Preview** to test it in a new tab, then click **Approve & Publish**.
- Navigate to **Games Catalog**: notice the newly approved game is now instantly published and playable!
- Navigate to **User Accounts Management** (`/admin/users`).
- Demonstrate filtering by role (`PLAYER`, `DEVELOPER`, `ADMIN`) and toggle a user's status (`Active` <-> `Deactivated`).

### 6. Real-Time Multiplayer (Tic-Tac-Toe) (6:30 - 8:00)
- Open a second browser window (or Incognito tab).
- In Window 1: Navigate to `/multiplayer` and click **Create Match Room**. Copy the 6-character room code (e.g. `7X9K2P`).
- In Window 2: Navigate to `/multiplayer`, paste the room code, and click **Join Match**.
- **Demonstrate:**
  - Real-time synchronization as Player 1 ('X') and Player 2 ('O') alternate moves.
  - Server validation preventing moving out of turn or clicking occupied cells.
  - Victory celebration screen with winning line highlighted.
  - Rematch ("Play Again") synchronization.
- **Explain:** The match outcome is permanently recorded to MongoDB (`matches` collection) with server-side authoritative victory detection.
