#!/bin/sh

# Install dependencies if node_modules doesn't exist in the zip folder
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Check if drizzle-kit is available
if ! npx drizzle-kit --version > /dev/null 2>&1; then
    echo "⚠️  drizzle-kit not found. Installing..."
    npm install drizzle-kit
fi

# Run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "🔗 Database URL: $(echo $DATABASE_URL | sed 's/:[^:@]*@/:***@/')"
    
    # Run Drizzle migrations (best practice)
    echo "🗄️ Running database migrations..."
    npm run db:migrate
    
    if [ $? -eq 0 ]; then
        echo "✅ Database is ready. Starting the app..."
    else
        echo "❌ Database migration failed. Exiting."
        exit 1
    fi
else
    echo "⚠️  DATABASE_URL not set, skipping database migrations"
fi

# Start the application.
echo "🚀 Starting application..."
node dist/server.js
