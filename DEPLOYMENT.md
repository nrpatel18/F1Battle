# Deployment Guide

This guide will help you deploy the F1 Telemetry Battle application to production.

## Prerequisites

- GitHub account with the repository pushed
- Railway account (for backend) - [Sign up here](https://railway.app)
- Vercel account (for frontend) - [Sign up here](https://vercel.com)

## Step 1: Deploy Backend (Railway)

### Option A: Deploy via Railway Dashboard

1. **Go to Railway**: Visit [railway.app](https://railway.app) and sign in with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `F1Battle` repository
   - Select the `backend` folder as the root directory

3. **Configure Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Railway will auto-detect Python and use the Procfile

4. **Set Environment Variables**:
   - Go to the "Variables" tab
   - Add:
     ```
     F1_CACHE_DIR=/app/cache
     CORS_ORIGINS=https://your-frontend-url.vercel.app
     ```
   - **Important**: 
     - Railway automatically sets `PORT` - don't add it manually
     - **For now, use the placeholder URL above** - you'll update this in Step 3 after deploying the frontend

5. **Enable Persistent Storage** (Optional but Recommended):
   - **Note**: Volumes may not be available on Railway's free tier or may be in a different location
   - **Without volumes**: The app will still work, but FastF1 cache will be lost on each restart (slower first loads)
   - **With volumes**: Cache persists between restarts (faster subsequent loads)
   - If available: Go to "Settings" → "Volumes" → Create volume at `/app/cache`
   - **You can skip this step** - the app works fine without it, just slower on first requests

6. **Get Your Backend URL**:
   - Railway will provide a URL like `https://your-app.railway.app`
   - Copy this URL - you'll need it for the frontend

### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up
```

## Step 2: Deploy Frontend (Vercel)

### Option A: Deploy via Vercel Dashboard

1. **Go to Vercel**: Visit [vercel.com](https://vercel.com) and sign in with GitHub

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your `F1Battle` repository
   - Select the `frontend` folder as the root directory

3. **Configure Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Set Environment Variables**:
   - Go to "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.railway.app
     ```
   - Replace with your actual Railway backend URL

5. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a URL like `https://f1-battle.vercel.app`

6. **Update Backend CORS**:
   - Go back to Railway
   - Update `CORS_ORIGINS` to include your Vercel URL:
     ```
     CORS_ORIGINS=https://f1-battle.vercel.app,https://your-custom-domain.com
     ```
   - Redeploy the backend

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-backend.railway.app

# Deploy to production
vercel --prod
```

## Step 3: Update CORS Settings (CRITICAL!)

After both backend and frontend are deployed:

1. **Get your actual Vercel frontend URL** (e.g., `https://f1-battle-abc123.vercel.app`)
2. **Go back to Railway backend service** → "Variables" tab
3. **Update `CORS_ORIGINS`**:
   - Replace `https://your-frontend-url.vercel.app` 
   - With your actual Vercel URL: `https://f1-battle-abc123.vercel.app`
4. **Save** - Railway will automatically redeploy the backend
5. **Test**: Your frontend should now be able to connect to the backend!

**Note**: If you have a custom domain on Vercel, use that instead (e.g., `https://f1battle.com`)

## Alternative: Render (Backend)

If you prefer Render over Railway:

1. **Go to Render**: [render.com](https://render.com)

2. **Create New Web Service**:
   - Connect your GitHub repo
   - Select the `backend` folder
   - Choose "Python 3" environment

3. **Configure**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     - `F1_CACHE_DIR=/opt/render/project/src/cache`
     - `CORS_ORIGINS=https://your-frontend.vercel.app`

4. **Enable Persistent Disk** (for cache):
   - Go to "Settings" → "Persistent Disk"
   - Mount at `/opt/render/project/src/cache`

## Troubleshooting

### Backend Issues

- **Cache not persisting**: Ensure persistent storage/volumes are enabled
- **CORS errors**: Check that `CORS_ORIGINS` includes your frontend URL
- **Slow first load**: Normal - FastF1 downloads data on first session load

### Frontend Issues

- **API connection errors**: Verify `NEXT_PUBLIC_API_URL` is set correctly
- **Build failures**: Check that all dependencies are in `package.json`

## Custom Domain (Optional)

### Vercel Custom Domain
1. Go to your project settings
2. Add your domain in "Domains"
3. Follow DNS configuration instructions

### Railway Custom Domain
1. Go to your service settings
2. Add custom domain
3. Configure DNS records

## Monitoring

- **Railway**: Check logs in the dashboard
- **Vercel**: View analytics and logs in the dashboard
- Both platforms provide monitoring and error tracking

## Cost Estimates

- **Railway**: Free tier available, ~$5-20/month for production
- **Vercel**: Free tier for hobby projects, Pro plan for production
- **Render**: Free tier available, similar pricing to Railway

