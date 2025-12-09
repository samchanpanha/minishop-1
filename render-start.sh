#!/bin/bash
# Exit immediately if a command exits with a non-zero status.
set -e

echo "=========================================="
echo "Starting Render deployment script..."
echo "=========================================="

# Ensure database directory exists
echo "Creating database directory..."
mkdir -p /app/data

# Show current environment for debugging
echo "DATABASE_URL: $DATABASE_URL"
echo "Current directory: $(pwd)"
echo "Contents of /app/data:"
ls -la /app/data || echo "Directory empty or doesn't exist yet"

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

# Verify tables exist
echo "Verifying database..."
echo "SELECT name FROM sqlite_master WHERE type='table';" | npx prisma db execute --stdin || echo "Could not verify tables"

# Start the application
echo "=========================================="
echo "Starting Next.js application..."
echo "=========================================="
npm start
