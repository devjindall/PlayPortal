# PlayPortal 🎮

> **Web-Based HTML5 Gaming Platform with Built-in Real-Time Multiplayer, Leaderboards, and Moderated Game Publishing.**  
> *Final-Year B.E. Computer Science & Engineering Capstone Project.*

---

## 📖 Synopsis
**PlayPortal** is a developer-friendly, web-based gaming platform that enables instant browser-based HTML5 gameplay, competitive game-specific leaderboards, moderated developer game publishing via ZIP packages, and real-time 1v1 Tic-Tac-Toe multiplayer powered by WebSockets.

---

## ✨ Key Features

- 🕹️ **Instant Browser Gameplay:** Play HTML5 Canvas games instantly in isolated, sandboxed iframes without local installations.
- 🔐 **Role-Based Access Control (RBAC):** Three distinct user roles (`PLAYER`, `DEVELOPER`, `ADMIN`) with server-enforced security boundaries.
- 📦 **Developer Game Publishing:** Developers upload game ZIP archives with automatic `index.html` detection and **Zip Slip** path traversal mitigation.
- 🛡️ **Admin Moderation Queue:** Administrators test playable submissions in preview and approve or reject with custom feedback.
- 🏆 **Game-Specific Leaderboards:** Competitive score tracking with top-3 podium visuals and personal best history.
- ⚔️ **Real-Time Multiplayer (Tic-Tac-Toe):** Private room creation, code sharing, server-authoritative move validation, and win/draw detection over Socket.IO.
- 📊 **Player History & Profile:** Personal dashboard displaying high scores, recent score submission timeline, and multiplayer battle win/loss stats.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Axios, Lucide Icons, Socket.IO Client |
| **Backend** | Node.js, Express 5, Socket.IO, Multer, AdmZip, Helmet, Express Rate Limit, Express Validator |
| **Database** | MongoDB, Mongoose ODM |
| **Security** | JWT (JSON Web Tokens), Bcrypt Password Hashing, Iframe Sandboxing, Zip Slip Protection |
| **Testing** | Node.js Integration & E2E Test Suite (43 tests, 100% passing) |

---

## 🏗️ Project Structure

```text
PlayPortal/
├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI components (GameCard, Modal, Spinner, etc.)
│   │   ├── context/            # React Context (AuthContext)
│   │   ├── layouts/            # Layout shells (RootLayout navigation)
│   │   ├── pages/              # View pages (Home, Games, Details, Play, Leaderboard, etc.)
│   │   ├── services/           # Axios API and Socket.IO client services
│   │   ├── App.jsx             # Main Router configuration
│   │   └── main.jsx            # React entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend API & Socket Server (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/             # MongoDB connection and environment variables
│   │   ├── controllers/        # Route controllers (Auth, Game, Score, Dev, Admin, User)
│   │   ├── middleware/         # Security, JWT auth, RBAC guards, and error handlers
│   │   ├── models/             # Mongoose schemas (User, Game, GameSubmission, Score, Match)
│   │   ├── routes/             # Express API route aggregation
│   │   ├── services/           # Business logic & Zip storage extraction service
│   │   ├── sockets/            # Socket.IO real-time multiplayer handler
│   │   ├── utils/              # Upload configuration & database seeder
│   │   ├── validators/         # express-validator schemas
│   │   ├── app.js              # Express app setup with Helmet & CORS
│   │   └── server.js           # HTTP + Socket.IO server entry point
│   ├── tests/                  # Automated integration & E2E test suites
│   ├── uploads/                # Uploaded game packages and thumbnails
│   └── package.json
│
├── docs/                       # Comprehensive technical documentation
├── viva/                       # Academic viva defense guides & Q&A
├── .env.example                # Template environment variables
├── CONTRIBUTING.md             # Contribution guidelines
├── PROJECT_STATUS.md           # Implementation status matrix
└── README.md
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18+ (tested on Node v24+)
- **npm**: v9+ (tested on npm v11+)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/playportal`) or MongoDB Atlas URI

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/devjindall/PlayPortal.git
cd PlayPortal

# Install dependencies across root, server, and client
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env` and `client/.env`:
```bash
# Server Environment (server/.env)
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/playportal
JWT_SECRET=playportal_development_jwt_secret_key_2026
JWT_EXPIRES_IN=7d

# Client Environment (client/.env)
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Demo Data
Populate the database with demo users, playable HTML5 games, sample submissions, scores, and matches:
```bash
npm run seed
```

### 4. Start Development Servers
```bash
# Run backend and frontend concurrently in two terminals:

# Terminal 1: Backend Server (http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend Client (http://localhost:5173)
npm run dev:client
```

---

## 🔑 Demo Accounts (For Viva Evaluation)

The login screen includes **1-Click Quick Demo Login buttons**:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@playportal.com` | `Admin123!` | Full control, moderation queue review, user management |
| **`DEVELOPER`** | `dev@playportal.com` | `Dev123!` | Developer portal, game uploads, submission status |
| **`PLAYER`** | `player@playportal.com` | `Player123!` | Game playing, score posting, leaderboards, multiplayer |

---

## 🧪 Testing

```bash
# Run all 43 backend integration & E2E tests
npm run test:server

# Run frontend production build check
npm run build:client
```

---

## 📚 Complete Technical Documentation

- **[System Architecture](docs/ARCHITECTURE.md):** Architectural design, component hierarchy, and middleware pipeline.
- **[REST API Documentation](docs/API_DOCUMENTATION.md):** Complete specifications for all HTTP endpoints.
- **[Database Design & ER Diagram](docs/DATABASE_DESIGN.md):** Mongoose schemas, relationships, and indexing strategies.
- **[Security & Threat Modeling](docs/SECURITY.md):** JWT security, Zip Slip mitigation, iframe sandboxing, and RBAC defense.
- **[Multiplayer Specification](docs/MULTIPLAYER.md):** Socket.IO event reference, room state machine, and win detection algorithm.
- **[Testing Report](docs/TESTING.md):** Automated test suite breakdown and verification logs.
- **[Deployment Guide](docs/DEPLOYMENT.md):** Step-by-step instructions for Vercel, Render, and MongoDB Atlas.

---

## 🎓 Academic Viva Study Material

- **[Viva Preparation Guide](viva/VIVA_PREPARATION.md):** Comprehensive breakdown of objectives, flows, and design decisions.
- **[Viva Questions & Answers](viva/VIVA_QUESTIONS_AND_ANSWERS.md):** 12 core defense questions and technical answers.
- **[Technical Concepts](viva/TECHNICAL_CONCEPTS.md):** Clear explanations of React, REST, Bcrypt, JWT, WebSockets, and Web Security.
- **[Demo Presentation Flow](viva/DEMO_FLOW.md):** Step-by-step presentation script for the live project demonstration.

---

## 📄 License
This project is developed as an academic capstone project for the Bachelor of Engineering (B.E.) in Computer Science & Engineering.
