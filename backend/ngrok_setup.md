# Ngrok Setup Guide for Backend Deployment

## Step 1: Install Ngrok

### Windows:
1. Download ngrok from https://ngrok.com/download
2. Extract the `ngrok.exe` file to a folder (e.g., `C:\ngrok\`)
3. Add ngrok to your PATH, or use the full path

### Alternative: Using Chocolatey
```powershell
choco install ngrok
```

### Alternative: Using Scoop
```powershell
scoop install ngrok
```

## Step 2: Sign up for Ngrok (Free)

1. Go to https://dashboard.ngrok.com/signup
2. Create a free account
3. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
4. Run: `ngrok config add-authtoken YOUR_AUTH_TOKEN`

## Step 3: Start Your Backend Server

Make sure your backend is running on port 8000:
```powershell
cd backend
.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Step 4: Start Ngrok Tunnel

In a **new terminal window**, run:
```powershell
ngrok http 8000
```

This will give you output like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:8000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

## Step 5: Update Frontend Configuration

### Option A: Update .env file (Recommended)
Create `frontend/.env`:
```
VITE_BACKEND_URL=https://abc123.ngrok-free.app
```

### Option B: Update directly in code
Edit `frontend/src/components/RwaScoringFrontend.jsx`:
```javascript
const backendBase = "https://abc123.ngrok-free.app";
```

## Step 6: Restart Frontend

After updating the backend URL, restart your frontend dev server:
```powershell
cd frontend
npm run dev
```

## Important Notes:

1. **Free ngrok URLs change every time** - You'll need to update the frontend URL each time you restart ngrok
2. **Ngrok free tier limitations:**
   - URLs expire after 2 hours
   - Limited requests per minute
   - Random subdomain each time

3. **For persistent URLs (paid):**
   - Sign up for ngrok paid plan
   - Use: `ngrok http 8000 --domain=your-custom-domain.ngrok-free.app`

4. **Ngrok browser warning:**
   - Free ngrok shows a warning page on first visit
   - Users need to click "Visit Site" button
   - This is normal for free tier

## Troubleshooting:

- **"ngrok: command not found"** - Add ngrok to PATH or use full path
- **"tunnel session failed"** - Check if backend is running on port 8000
- **CORS errors** - Backend CORS is already configured to allow all origins
- **Connection refused** - Make sure backend is running with `--host 0.0.0.0`



