#!/bin/sh

# Install dependencies if node_modules doesn't exist in the zip folder
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Start the application.
echo "🚀 Starting application..."
node server.js
