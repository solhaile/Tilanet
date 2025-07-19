# Setup script for test database
# This script creates the test database if it doesn't exist

Write-Host "Setting up test database..." -ForegroundColor Green

# Check if psql is available
try {
    psql --version | Out-Null
    Write-Host "PostgreSQL client found" -ForegroundColor Green
} catch {
    Write-Host "Error: PostgreSQL client (psql) not found in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools" -ForegroundColor Red
    exit 1
}

# Create test database
Write-Host "Creating test database..." -ForegroundColor Yellow

# Use environment variables or defaults
$env:PGPASSWORD = "Test@2025!"
$dbHost = "localhost"
$dbPort = "5432"
$dbUser = "postgres"

# Check if test database exists
$dbExists = psql -h $dbHost -p $dbPort -U $dbUser -lqt | Select-String "tilanet_test"

if ($dbExists) {
    Write-Host "Test database already exists" -ForegroundColor Green
} else {
    Write-Host "Creating test database..." -ForegroundColor Yellow
    
    # Create database
    psql -h $dbHost -p $dbPort -U $dbUser -d postgres -c "CREATE DATABASE tilanet_test;"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Test database created successfully" -ForegroundColor Green
    } else {
        Write-Host "Error creating test database" -ForegroundColor Red
        exit 1
    }
}

# Enable uuid extension
Write-Host "Enabling UUID extension..." -ForegroundColor Yellow
psql -h $dbHost -p $dbPort -U $dbUser -d tilanet_test -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Test database setup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Warning: Could not enable UUID extension" -ForegroundColor Yellow
}

Write-Host "You can now run tests with: npm test" -ForegroundColor Cyan
