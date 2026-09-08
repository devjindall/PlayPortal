# PlayPortal — Deployment Guide

This guide outlines deployment of PlayPortal to modern cloud hosts (Render / Railway for Backend, Vercel / Netlify for Frontend, and MongoDB Atlas for Database).

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
                      │        (Express Backend)       │
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

### Backend Environment Variables (Render / Railway)
| Variable | Example Production Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & hides stack traces |
| `PORT` | `5000` | Port assigned by hosting provider |
| `CLIENT_URL` | `https://playportal.vercel.app` | Production frontend URL for CORS whitelist |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.mongodb.net/playportal` | MongoDB Atlas cluster connection URI |
| `JWT_SECRET` | `prod_super_secret_key_change_in_production` | Strong cryptographic key for signing tokens |
| `JWT_EXPIRES_IN` | `7d` | Lifespan of user tokens |

### Frontend Environment Variables (Vercel / Netlify)
| Variable | Example Production Value | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://playportal-api.onrender.com/api` | Base URL for Axios and Socket.IO connection |

---

## 3. Step-by-Step Deployment Procedure

### Step 1: Deploy MongoDB on Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write privileges.
3. Whitelist Network Access to `0.0.0.0/0` (allow all connections with user auth).
4. Copy the SRV connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/playportal`.

### Step 2: Deploy Backend on Render / Railway
1. Connect your GitHub repository.
2. Select **Root Directory:** `server`.
3. Set **Build Command:** `npm install`.
4. Set **Start Command:** `npm start` (runs `node src/server.js`).
5. Add all Environment Variables listed above.
6. Optional: Run seed script on the deployment console: `npm run seed`.

### Step 3: Deploy Frontend on Vercel
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Select **Root Directory:** `client`.
3. Set **Framework Preset:** `Vite`.
4. Set **Build Command:** `npm run build`.
5. Set **Output Directory:** `dist`.
6. Add `VITE_API_URL` environment variable pointing to the Render backend URL.
7. Click **Deploy**.
