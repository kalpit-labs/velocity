# Deployment Guide

This guide will help you deploy your MongoDB Dashboard to Vercel (frontend) and Render (backend).

## Prerequisites

1. **GitHub Account & Repository**
   - Push your code to GitHub first
   - See `GITHUB_SETUP.md` for detailed instructions

2. **MongoDB Atlas Account**
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get your connection string

3. **Vercel Account**
   - Sign up at [vercel.com](https://vercel.com)

4. **Render Account**
   - Sign up at [render.com](https://render.com)

---

## Step 0: Push to GitHub (If Not Done)

If you haven't pushed to GitHub yet:

```bash
# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

See `GITHUB_SETUP.md` for complete instructions.

---

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password
4. Whitelist IP addresses:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for deployment)
5. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

---

## Step 2: Deploy Backend to Render

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**
   - Connect your GitHub account
   - Select your repository

3. **Configure Service**
   - **Name**: `mongodb-dashboard-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   ```
   MONGODB_URI=<your-mongodb-connection-string>
   PORT=5001
   NODE_ENV=production
   ```

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL (e.g., `https://mongodb-dashboard-backend.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? (Select your account)
   - Link to existing project? `N`
   - Project name? `mongodb-dashboard` (or your choice)
   - In which directory is your code located? `./`
   - Want to override settings? `N`

5. **Set Environment Variable**
   After first deployment:
   ```bash
   vercel env add VITE_API_URL
   ```
   - Select "Production"
   - Enter value: `https://your-backend-url.onrender.com/api`
   - Redeploy: `vercel --prod`

### Option B: Using Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"

2. **Import Repository**
   - Connect your GitHub account
   - Select your repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add variable:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://your-backend-url.onrender.com/api`
     - **Environment**: Production

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Copy your frontend URL (e.g., `https://mongodb-dashboard.vercel.app`)

---

## Step 4: Update Backend CORS

1. **Go to Render Dashboard**
   - Select your backend service

2. **Add Frontend URL to Environment Variables**
   - Go to "Environment" tab
   - Add new variable:
     - **Key**: `FRONTEND_URL`
     - **Value**: `https://your-app.vercel.app` (your Vercel URL)
   - Click "Save Changes"

3. **Wait for Automatic Redeploy**
   - Render will automatically redeploy with new environment variable

---

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. You should see the MongoDB Dashboard
3. Try browsing databases and collections
4. Test all features:
   - Database listing
   - Collection browsing
   - Document viewing
   - Search functionality
   - CSV export
   - Analytics

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in Render
- Check that the URL doesn't have a trailing slash
- Verify CORS configuration in `backend/src/server.js`

### API Connection Errors
- Verify `VITE_API_URL` is set correctly in Vercel
- Ensure it includes `/api` at the end
- Check backend logs in Render dashboard

### MongoDB Connection Errors
- Verify connection string is correct
- Check MongoDB Atlas network access (whitelist 0.0.0.0/0)
- Ensure database user has proper permissions

### Build Failures

**Frontend:**
- Check that all dependencies are in `package.json`
- Verify build command is `npm run build`
- Check Vercel build logs

**Backend:**
- Ensure `start` script is in `package.json`
- Check Render build logs
- Verify all required environment variables are set

---

## Environment Variables Summary

### Backend (Render)
```
MONGODB_URI=<your-mongodb-atlas-connection-string>
PORT=5001
NODE_ENV=production
FRONTEND_URL=<your-vercel-url>
```

### Frontend (Vercel)
```
VITE_API_URL=<your-render-backend-url>/api
```

---

## Updating Your Deployment

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel will automatically redeploy.

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Render will automatically redeploy.

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Render
1. Go to Service Settings → Custom Domain
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Cost Information

- **MongoDB Atlas**: Free tier (512 MB storage)
- **Vercel**: Free tier (unlimited personal projects)
- **Render**: Free tier (750 hours/month, may spin down after inactivity)

**Note**: Render's free tier spins down after 15 minutes of inactivity. First request after spin-down may take 30-60 seconds.

---

## Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
