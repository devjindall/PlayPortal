# PlayPortal — Project Overview

## 1. Project Title & Academic Context
- **Project Name:** PlayPortal (Web-Based HTML5 Gaming Platform with Built-in Real-Time Multiplayer, Leaderboards, and Moderated Publishing)
- **Academic Context:** Final-Year B.E. Computer Science & Engineering Capstone Project
- **Architecture Paradigm:** Modular Monolith (MERN Stack: MongoDB, Express 5, React 18 + Vite, Node.js + Socket.IO)

---

## 2. Motivation & Problem Statement
Traditional online gaming platforms often suffer from high entry barriers for indie developers, complex client installations for players, and heavy, convoluted infrastructure. 

**PlayPortal** addresses these challenges by offering:
1. **Zero-Installation Instant Play:** Direct in-browser gameplay powered by HTML5 Canvas and sandboxed iframe isolation.
2. **Accessible Developer Publishing:** Seamless ZIP packaging where developers upload games and thumbnail assets with automatic archive validation and Zip Slip security protection.
3. **Admin Moderation Workflow:** Dedicated administrative queue ensuring only approved, quality games are published to the public catalog.
4. **Game-Specific Leaderboards:** Competitive score tracking tied to individual games with personal best tracking.
5. **Real-Time Multiplayer:** Built-in 1v1 Tic-Tac-Toe using WebSocket (Socket.IO) technology with server-authoritative move validation and match history recording.

---

## 3. Target User Roles & Permissions (RBAC)

PlayPortal defines 3 strict role levels:

| Role | Permissions & Capabilities |
| :--- | :--- |
| **`PLAYER`** | • Browse published games catalog by category & search.<br>• Play HTML5 games in sandboxed player.<br>• Submit game high scores.<br>• View game-specific leaderboards & podium rankings.<br>• Track personal game history & multiplayer match stats.<br>• Create and join real-time multiplayer Tic-Tac-Toe rooms. |
| **`DEVELOPER`** | • All `PLAYER` permissions.<br>• Access Developer Portal & Dashboard.<br>• Upload HTML5 game ZIP packages and metadata.<br>• Track submission review status (`PENDING`, `APPROVED`, `REJECTED`).<br>• View admin rejection feedback and update game details. |
| **`ADMIN`** | • All `PLAYER` and `DEVELOPER` permissions.<br>• Access Admin Control Center.<br>• Review pending game submissions with live test preview.<br>• Approve submissions (instantly publishing games) or reject with reason.<br>• Manage all platform users and toggle account activation. |

---

## 4. Key Functional Modules

```
                    ┌──────────────────────────────────────────────┐
                    │               PlayPortal Client              │
                    │         (React 18 + Vite + Tailwind)         │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           │ HTTP REST / WebSockets
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                 Express API Server                                │
├─────────────────────────┬─────────────────────────┬───────────────────────────────┤
│    Auth & Security      │   Game & Leaderboard    │     Real-Time Multiplayer     │
│   (JWT, bcrypt, RBAC,   │ (Catalog, Sandboxing,   │ (Socket.IO, Authoritative     │
│    Helmet, Rate Limit)  │  Scores, Moderation)    │   Turn & Win Validation)      │
└─────────────────────────┴────────────┬────────────┴───────────────────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────────────────┐
                    │               MongoDB Database               │
                    │   (Users, Games, Submissions, Scores, Match) │
                    └──────────────────────────────────────────────┘
```

1. **Authentication & Session:** Stateless JWT tokens stored securely in client storage, verified on every API call, respecting account active status.
2. **Catalog Discovery:** Filter by 8 categories (`Action`, `Arcade`, `Puzzle`, `Strategy`, `Sports`, `Casual`, `Retro`, `Card`), search queries, and sorting.
3. **Sandboxed Game Execution:** Games execute inside isolated iframes (`sandbox="allow-scripts allow-same-origin allow-forms"`) communicating via HTML5 Web Messaging (`window.parent.postMessage`).
4. **Developer Upload Engine:** Multer disk storage, Zip Slip path traversal mitigation, `index.html` structure validation, and automated temp file cleanup.
5. **Real-Time Multiplayer Engine:** Socket.IO room management, turn orchestration, win/draw algorithmic detection across 8 combinations, and MongoDB match record persistence.
