#!/bin/sh

# Install dependencies if node_modules doesn't exist in the zip folder
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "🗄️ Running database migrations..."
    NODE_ENV=production npm run db:migrate
    if [ $? -eq 0 ]; then
        echo "✅ Database migrations completed successfully"
    else
        echo "⚠️  Database migration failed, continuing with startup..."
    fi
else
    echo "⚠️  DATABASE_URL not set, skipping database migrations"
fi

# Start the application.
echo "🚀 Starting application..."
node dist/server.js
