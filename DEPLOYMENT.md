# KhataBook DigiLedger - Production Deployment Guide

This guide provides step-by-step instructions for deploying the **KhataBook DigiLedger** full-stack application (Vite React + Node/Express + Prisma PostgreSQL).

---

## 🛠️ Architecture & Deployment Options

You can deploy KhataBook DigiLedger using two main strategies:

1. **Option A (Recommended for Free Tier)**: 
   - **Frontend**: Vercel or Netlify (Fast global CDN)
   - **Backend**: Render or Railway (Node.js Web Service)
   - **Database**: Neon or Supabase (Managed PostgreSQL)

2. **Option B (Single Web Service)**:
   - **Full Stack**: Render Web Service (Express serves the built React frontend static files)
   - **Database**: Neon or Supabase PostgreSQL

---

## 🗄️ Step 1: Database Setup (Neon PostgreSQL)

1. Sign up at [Neon.tech](https://neon.tech) and create a PostgreSQL database instance (e.g. `neondb`).
2. Copy your Connection String from the Neon dashboard (it will look like: `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`).
3. Push your Prisma database schema:
   ```bash
   npm run prisma:push
   ```
   *(Or run `npx prisma db push` inside the `backend` directory)*

---

## 🌐 Step 2: Option A Deployment (Vercel + Render)

### 1. Deploy Backend API to Render.com
1. Log in to [Render.com](https://render.com) and click **New Web Service**.
2. Connect your GitHub repository.
3. Configure the Web Service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install` (or `npm run build`)
   - **Start Command**: `npm start`
4. Add **Environment Variables** in Render Dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection URL
   - `JWT_SECRET`: A strong secret key (e.g., generated with `openssl rand -hex 32`)
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: `https://your-frontend-app.vercel.app` (or `*`)
5. Click **Create Web Service**. Note your backend URL (e.g. `https://khatabook-backend.onrender.com`).

### 2. Deploy Frontend to Vercel
1. Log in to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel Dashboard:
   - `VITE_API_BASE_URL`: `https://khatabook-backend.onrender.com/api` (your backend URL + `/api`)
5. Click **Deploy**. Vercel will automatically build and publish your frontend.

---

## 🚀 Step 3: Option B Deployment (Single Render Web Service)

If you prefer deploying both frontend and backend together on one Render server:

1. Create a **New Web Service** on Render.
2. Root Directory: `.` (leave blank or project root).
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection URL
   - `JWT_SECRET`: Secret key
   - `NODE_ENV`: `production`

The Express backend will automatically serve API requests under `/api` and serve the built React frontend static pages for all other routes!

---

## 🔍 Verification & Health Checks

Once deployed, you can verify your service health at:
- **Backend Health Check**: `https://<your-backend-url>/health`
- **API Test**: `https://<your-backend-url>/api/transactions`
- **Frontend App**: `https://<your-frontend-url>`
