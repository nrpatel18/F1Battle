# Troubleshooting "No Sessions Available"

## Issue: Frontend shows "No sessions available" after deployment

### Step 1: Verify Backend is Working
Test your backend API directly:
```bash
curl "https://f1battle-production.up.railway.app/api/sessions?year=2024"
```
If this returns JSON data, your backend is working ✅

### Step 2: Check Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Verify `NEXT_PUBLIC_API_URL` is set to:
   ```
   https://f1battle-production.up.railway.app
   ```
4. **Important**: Make sure it's set for **Production** environment
5. If you just added/updated it, **redeploy** your frontend:
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select **Redeploy**

### Step 3: Check Browser Console

1. Open your deployed Vercel site
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Look for errors like:
   - `Failed to fetch`
   - `CORS policy`
   - `NetworkError`
   - `Failed to fetch sessions: ...`

### Step 4: Verify CORS Settings

1. Go to Railway → Your backend service → **Variables**
2. Check `CORS_ORIGINS` includes your Vercel URL:
   ```
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   ```
3. If you just updated it, Railway will auto-redeploy

### Step 5: Test API from Browser

Open your browser console and run:
```javascript
fetch('https://f1battle-production.up.railway.app/api/sessions?year=2024')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

If this works, the backend is accessible. If not, check CORS settings.

### Common Issues:

1. **Environment variable not set**: `NEXT_PUBLIC_API_URL` must be set in Vercel
2. **Wrong environment**: Make sure it's set for Production, not just Preview
3. **Not redeployed**: After adding env vars, you must redeploy
4. **CORS mismatch**: Vercel URL must be in Railway's `CORS_ORIGINS`
5. **HTTPS/HTTP mismatch**: Both should use HTTPS

### Quick Fix Checklist:

- [ ] Backend API works (test with curl)
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel (Production)
- [ ] Frontend redeployed after setting env var
- [ ] `CORS_ORIGINS` in Railway includes Vercel URL
- [ ] Check browser console for specific errors

