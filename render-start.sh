#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting deployment script..."

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting Next.js application..."
npm start
