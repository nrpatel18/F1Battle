# Single Platform Deployment Guide

Deploy both backend and frontend on **Render** for a single-platform solution.

## Deploy on Render (Free Tier Available)

### Step 1: Deploy Backend

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repository `nrpatel18/F1Battle`
4. Configure:
   - **Name**: `f1-battle-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or Starter for better performance)

5. **Environment Variables**:
   ```
   F1_CACHE_DIR=/opt/render/project/src/cache
   CORS_ORIGINS=https://f1-battle-frontend.onrender.com
   ```
   (Update CORS after frontend deploys)

6. **Enable Persistent Disk** (for FastF1 cache):
   - Go to "Settings" → "Persistent Disk"
   - Mount at `/opt/render/project/src/cache`
   - Size: 1GB (free tier) or more

7. Click "Create Web Service"
8. Copy your backend URL (e.g., `https://f1-battle-backend.onrender.com`)

### Step 2: Deploy Frontend

1. In Render, click "New +" → "Static Site"
2. Configure:
   - **Name**: `f1-battle-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `frontend/.next`
   - **Plan**: Free

3. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://f1-battle-backend.onrender.com
   ```

4. Click "Create Static Site"
5. Copy your frontend URL (e.g., `https://f1-battle-frontend.onrender.com`)

### Step 3: Update CORS

1. Go back to backend service
2. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://f1-battle-frontend.onrender.com
   ```
3. Save (auto-redeploys)

### Step 4: Custom Domain (Optional)

Both services can use the same custom domain with subdomains:
- `api.yourdomain.com` → Backend
- `yourdomain.com` → Frontend

## Alternative: Railway (Also Single Platform)

Railway can also host both:
1. Create two services from the same repo
2. One for `backend/`, one for `frontend/`
3. Both on the same project

## Cost

- **Render Free Tier**: 
  - Backend: Free (spins down after 15 min inactivity)
  - Frontend: Free (always on)
- **Render Starter**: $7/month per service (always-on backend)

