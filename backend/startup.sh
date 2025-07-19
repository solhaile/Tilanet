#!/bin/sh

# Install dependencies if node_modules doesn't exist in the zip folder
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "🗄️ Running database migrations..."
    echo "📊 Environment: $NODE_ENV"
    echo "🔗 Database URL: $(echo $DATABASE_URL | sed 's/:[^:@]*@/:***@/')"
    
    # Use production-specific setup for production environment
    if [ "$NODE_ENV" = "production" ]; then
        echo "🏭 Production environment detected. Running production database setup..."
        npm run db:setup-production
    else
        echo "🔍 Checking database status..."
        npm run db:check
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Database setup completed successfully"
    else
        echo "❌ Database setup failed"
        echo "⚠️  Attempting to continue with startup..."
    fi
else
    echo "⚠️  DATABASE_URL not set, skipping database migrations"
fi

# Start the application.
echo "🚀 Starting application..."
node dist/server.js
