#!/bin/bash

# Production Deployment Script for MiniShop

echo "🚀 Starting Production Deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create one before deploying."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Database setup
echo "🗄️  Setting up database..."
npm run db:push
npm run db:generate

# Build application
echo "🏗️  Building application..."
npm run build

# Start production server
echo "🌟 Starting production server..."
npm start
