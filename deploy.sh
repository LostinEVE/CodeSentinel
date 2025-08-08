#!/bin/bash

# CodeSentinel Production Deployment Script

echo "🚀 Starting CodeSentinel deployment..."

# 1. Build Frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# 2. Prepare Backend
echo "🔧 Preparing backend..."
cd backend
npm run build

# 3. Database Migration
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# 4. Start Production Server
echo "🌟 Starting production server..."
npm start

echo "✅ CodeSentinel deployed successfully!"
echo "🌐 Backend running on port 3001"
echo "📊 Check logs: tail -f logs/combined.log"
