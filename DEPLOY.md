# 🚀 Deployment Guide for LogicLoom (CodeCrypt)

This guide explains how to deploy the **Frontend** and **Backend** for production.

---

## 1. Prerequisites
- A **GitHub Account** (Push your code to a repository).
- A **Supabase** Project (You already have this).
- Accounts on **Render.com** (for Backend) and **Vercel** (for Frontend).

---

## 2. Deploy Backend (Render.com)
The backend runs the API, Game Logic, and Email Service.

1. **Log in to [Render.com](https://render.com)**.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. **Configure Settings**:
   - **Name**: `codecrypt-backend`
   - **Root Directory**: `backend` (Important!)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   Add the following variables (copy values from your local `.env`):
   - `DATABASE_URL`: (Your Supabase connection string, use port 5432 or 6543)
   - `SMTP_USER`: (Your email)
   - `SMTP_PASS`: (Your email password)
   - `EVENT_NAME`: `INTELLECT '26`
6. Click **Create Web Service**.
7. **Copy the URL**: Once deployed, copy your backend URL (e.g., `https://codecrypt-backend.onrender.com`).

---

## 3. Deploy Frontend (Vercel)
The frontend is the React application.

1. **Log in to [Vercel](https://vercel.com)**.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. **Configure Project**:
   - **Framework**: Vite (will be detected automatically).
   - **Root Directory**: `./` (Default).
5. **Environment Variables**:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Render Backend URL + `/api` (e.g., `https://codecrypt-backend.onrender.com/api`)
     > ⚠️ **CRITICAL**: Do not forget the `/api` at the end!
6. Click **Deploy**.

---

## 4. Final Validation
1. Open your **Vercel Frontend URL**.
2. Try to **Login** with `admin` / `admin123`.
3. If it logs in successfully, the Frontend is talking to the Backend!
4. Check the **Leaderboard** (Admin Panel -> View Leaderboard) to ensure database connection.

---

## 🌩️ Troubleshooting

### CORS Errors
If you see "CORS error" in the browser console:
1. Go to your **Backend Code** (`backend/server.js`).
2. Update the `cors` configuration to allow your Vercel domain.
   ```javascript
   app.use(cors({
       origin: ['http://localhost:5173', 'https://your-vercel-app.vercel.app'],
       credentials: true
   }));
   ```
3. Commit and Push. Render will auto-redeploy.

### Database Connection Fails
- Ensure your `DATABASE_URL` in Render Env Vars is correct.
- If using Supabase Transaction Pooler, use port `6543`.
- If using Session Pooler, use port `5432`.

---
**Deployment Complete! 🚀**
