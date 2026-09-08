# PlayPortal — Deployment Guide

This guide outlines the deployment pathways for PlayPortal:
1. **Multi-Host Managed Cloud** (Vercel for Frontend + Render / Railway for Backend + MongoDB Atlas)
2. **Unified Single-Host Service** (Render Blueprint / Railway single web service serving full-stack)
3. **Containerized Deployment** (Docker & Docker Compose)

---

## 1. Cloud Architecture Overview

```
                      ┌────────────────────────────────┐
                      │        Vercel / Netlify        │
                      │        (React Frontend)        │
                      └───────────────┬────────────────┘
                                      │
                                      │ HTTPS / WSS
                                      ▼
                      ┌────────────────────────────────┐
                      │        Render / Railway        │
                      │    (Express + Socket.IO API)   │
                      └───────────────┬────────────────┘
                                      │
                                      │ Mongoose TLS
                                      ▼
                      ┌────────────────────────────────┐
                      │         MongoDB Atlas          │
                      │       (Managed Database)       │
                      └────────────────────────────────┘
```

---

## 2. Environment Variables Configuration

### Backend Environment Variables (`server/.env` or Render / Railway Dashboard)
| Variable | Required | Example Production Value | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables production optimizations & hides stack traces |
| `PORT` | Auto | `5000` | Port assigned by hosting provider |
| `CLIENT_URL` | Yes | `https://playportal.vercel.app` (or `*`) | Allowed frontend origins for CORS |
| `MONGODB_URI` | Yes | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/playportal` | MongoDB Atlas cluster connection URI |
| `JWT_SECRET` | Yes | `prod_super_secret_key_change_in_production` | Strong cryptographic key for signing JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | Lifespan of user authentication tokens |

### Frontend Environment Variables (`client/.env` or Vercel / Netlify Dashboard)
| Variable | Required | Example Production Value | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Yes | `https://playportal-api.onrender.com/api` | Base URL for Axios and Socket.IO connection |

---

## 3. Option A: Split Deployment (Vercel + Render + Atlas) [Recommended]

### Step 1: Set Up MongoDB Atlas (Free Cloud Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register/log in.
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g., `playportal_admin`) with a secure password.
4. Under **Network Access**, click **Add IP Address** -> select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Drivers** (Node.js) -> copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/playportal?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend to Render (Free Web Service)
1. Go to [Render.com](https://render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository: `https://github.com/devjindall/PlayPortal`.
3. Configure the service:
   - **Name**: `playportal-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas SRV URI>`
   - `JWT_SECRET`: `<A random 32+ character secure secret>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `*` (or your Vercel URL once created)
5. Click **Deploy Web Service**.
6. Once deployed, note your backend URL (e.g. `https://playportal-api.onrender.com`).
7. *(Optional)* Seed initial sample games and accounts: In Render Dashboard, open the **Shell** tab and run:
   ```bash
   node src/utils/seed.js
   ```

### Step 3: Deploy Frontend to Vercel (Free Edge Frontend)
1. Go to [Vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Import the GitHub repository: `devjindall/PlayPortal`.
3. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://playportal-api.onrender.com/api` (replace with your Render backend URL)
5. Click **Deploy**.
6. Vercel will build and assign a production URL (e.g., `https://playportal.vercel.app`).
7. Update Render backend's `CLIENT_URL` with this Vercel domain.

---

## 4. Option B: 1-Click Render Blueprint (Unified Full-Stack Deploy)

The repository includes `render.yaml`. To deploy both backend and frontend as a unified single service:
1. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
2. Select your repository `https://github.com/devjindall/PlayPortal`.
3. Render automatically detects `render.yaml`.
4. Fill in `MONGODB_URI` when prompted.
5. Click **Apply**. Render will build the React SPA and serve it directly alongside the Express API and Socket.IO server!

---

## 5. Option C: Docker Container Deployment

The repository includes a production-ready `Dockerfile` and `docker-compose.yml`.

### Running with Docker Compose locally or on any VPS (AWS EC2, DigitalOcean, Hetzner):
```bash
# Clone repository
git clone https://github.com/devjindall/PlayPortal.git
cd PlayPortal

# Start MongoDB and PlayPortal in isolated containers
docker-compose up -d --build
```
The full application will be live at `http://localhost:5000`.

---

## 6. Post-Deployment Verification Checklist

- [ ] Visit `https://<frontend-url>/` — Home page loads cleanly.
- [ ] Visit `https://<backend-url>/api/health` — Returns `{ "success": true, "status": "UP" }`.
- [ ] Register a new player account and log in.
- [ ] Play a built-in game (e.g. *Cyber Dodger*) and verify the game iframe loads and scores submit.
- [ ] Open two browser windows on `/multiplayer` and test real-time Tic-Tac-Toe matchmaking.
- [ ] Log in as Admin (`admin@playportal.com` / `Admin@123`) and verify user management & submissions.

