#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

echo "=========================================="
echo "Starting Render deployment script..."
echo "=========================================="

# Show current environment for debugging
echo "DATABASE_URL is configured: $(if [ -n "$DATABASE_URL" ]; then echo 'Yes'; else echo 'No'; fi)"

# Generate Prisma client (in case it wasn't generated during build)
echo "Generating Prisma client..."
npx prisma generate

# Apply database schema
echo "Applying database schema..."
# Try migrate deploy first (for existing migrations)
# If it fails (e.g., fresh database), use db push to create tables
if npx prisma migrate deploy; then
    echo "Migrations applied successfully!"
else
    echo "Migration deploy failed, using db push to create tables..."
    npx prisma db push --accept-data-loss
    echo "Database schema pushed successfully!"
fi

# Start the application
echo "=========================================="
echo "Starting Next.js application..."
echo "=========================================="
npm start
