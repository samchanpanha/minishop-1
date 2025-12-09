#!/bin/bash

# Local Deployment Script for MiniShop

echo "🚀 Starting Local Deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    if [ -f .env.example ]; then
        echo "📝 Creating .env from .env.example..."
        cp .env.example .env
        echo "✅ .env created. Please update it with your credentials."
    else
        echo "❌ .env.example not found. Cannot create .env."
        exit 1
    fi
fi

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Database setup
echo "🗄️  Setting up database..."
npm run db:push
npm run db:generate

# Start development server
echo "🌟 Starting development server..."
npm run dev
