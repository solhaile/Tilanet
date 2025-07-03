# PowerShell script for Windows users
# Azure App Service Quick Setup Script for Idir Management Backend
# Prerequisites: Azure CLI installed and logged in (az login)

Write-Host "🚀 Setting up Azure App Service for Idir Management Backend..." -ForegroundColor Green

# Configuration variables - UPDATE THESE
$RESOURCE_GROUP = "idir-management-rg"
$APP_SERVICE_PLAN = "idir-management-plan"
$APP_NAME = "idir-management-api"
$LOCATION = "East US"
$DB_SERVER_NAME = "idir-management-db"
$DB_NAME = "idir_management"
$DB_ADMIN_USER = "adminuser"
$DB_ADMIN_PASSWORD = "YourSecurePassword123!"

Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  App Name: $APP_NAME"
Write-Host "  Location: $LOCATION"
Write-Host "  Database Server: $DB_SERVER_NAME"

$confirmation = Read-Host "Do you want to continue? (y/n)"
if ($confirmation -ne 'y') {
    exit
}

Write-Host "1️⃣ Creating Resource Group..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION

Write-Host "2️⃣ Creating App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
    --name $APP_SERVICE_PLAN `
    --resource-group $RESOURCE_GROUP `
    --sku B1 `
    --is-linux

Write-Host "3️⃣ Creating Web App..." -ForegroundColor Yellow
az webapp create `
    --resource-group $RESOURCE_GROUP `
    --plan $APP_SERVICE_PLAN `
    --name $APP_NAME `
    --runtime "NODE|18-lts"

Write-Host "4️⃣ Creating PostgreSQL Server..." -ForegroundColor Yellow
az postgres server create `
    --resource-group $RESOURCE_GROUP `
    --name $DB_SERVER_NAME `
    --location $LOCATION `
    --admin-user $DB_ADMIN_USER `
    --admin-password $DB_ADMIN_PASSWORD `
    --sku-name GP_Gen5_2

Write-Host "5️⃣ Creating Database..." -ForegroundColor Yellow
az postgres db create `
    --resource-group $RESOURCE_GROUP `
    --server-name $DB_SERVER_NAME `
    --name $DB_NAME

Write-Host "6️⃣ Configuring Firewall..." -ForegroundColor Yellow
az postgres server firewall-rule create `
    --resource-group $RESOURCE_GROUP `
    --server $DB_SERVER_NAME `
    --name AllowAllWindowsAzureIps `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0

Write-Host "7️⃣ Setting up App Service Configuration..." -ForegroundColor Yellow
$JWT_SECRET = [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
az webapp config appsettings set `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --settings `
        NODE_ENV=production `
        PORT=8000 `
        WEBSITES_PORT=8000 `
        "JWT_SECRET=$JWT_SECRET" `
        JWT_EXPIRES_IN=7d `
        "DATABASE_URL=postgresql://${DB_ADMIN_USER}@${DB_SERVER_NAME}:${DB_ADMIN_PASSWORD}@${DB_SERVER_NAME}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require" `
        "CORS_ORIGIN=https://${APP_NAME}.azurewebsites.net" `
        RATE_LIMIT_WINDOW_MS=900000 `
        RATE_LIMIT_MAX_REQUESTS=100 `
        SCM_DO_BUILD_DURING_DEPLOYMENT=true

Write-Host "8️⃣ Getting Publish Profile..." -ForegroundColor Yellow
az webapp deployment list-publishing-profiles `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --xml | Out-File -FilePath "publish-profile.xml"

Write-Host "✅ Azure Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy the content of 'publish-profile.xml' to GitHub Secret 'AZURE_WEBAPP_PUBLISH_PROFILE'"
Write-Host "2. Update CORS_ORIGIN if you have a different frontend domain"
Write-Host "3. Push your code to main branch to trigger deployment"
Write-Host ""
Write-Host "🌐 Your API will be available at: https://${APP_NAME}.azurewebsites.net" -ForegroundColor Green
Write-Host "🔍 Health check: https://${APP_NAME}.azurewebsites.net/api/health" -ForegroundColor Green
Write-Host "💾 Database: ${DB_SERVER_NAME}.postgres.database.azure.com" -ForegroundColor Green
Write-Host ""
Write-Host "🔑 Database Connection Details:" -ForegroundColor Cyan
Write-Host "  Server: ${DB_SERVER_NAME}.postgres.database.azure.com"
Write-Host "  Database: ${DB_NAME}"
Write-Host "  Username: ${DB_ADMIN_USER}@${DB_SERVER_NAME}"
Write-Host "  Password: ${DB_ADMIN_PASSWORD}"
Write-Host ""
Write-Host "⚠️  Remember to:" -ForegroundColor Yellow
Write-Host "   - Add GitHub Secret: AZURE_WEBAPP_PUBLISH_PROFILE"
Write-Host "   - Update your frontend to use the new API URL"
Write-Host "   - Test the deployment after push to main branch"
