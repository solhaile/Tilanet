#!/bin/bash

# Azure App Service Quick Setup Script for Idir Management Backend
# Prerequisites: Azure CLI installed and logged in (az login)

echo "🚀 Setting up Azure App Service for Idir Management Backend..."

# Configuration variables - UPDATE THESE
RESOURCE_GROUP="idir-management-rg"
APP_SERVICE_PLAN="idir-management-plan"
APP_NAME="idir-management-api"
LOCATION="East US"
DB_SERVER_NAME="idir-management-db"
DB_NAME="idir_management"
DB_ADMIN_USER="adminuser"
DB_ADMIN_PASSWORD="YourSecurePassword123!"

echo "📋 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  App Name: $APP_NAME"
echo "  Location: $LOCATION"
echo "  Database Server: $DB_SERVER_NAME"

read -p "Do you want to continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo "1️⃣ Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION"

echo "2️⃣ Creating App Service Plan..."
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux

echo "3️⃣ Creating Web App..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --name $APP_NAME \
    --runtime "NODE|18-lts"

echo "4️⃣ Creating PostgreSQL Server..."
az postgres server create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_SERVER_NAME \
    --location "$LOCATION" \
    --admin-user $DB_ADMIN_USER \
    --admin-password $DB_ADMIN_PASSWORD \
    --sku-name GP_Gen5_2

echo "5️⃣ Creating Database..."
az postgres db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $DB_SERVER_NAME \
    --name $DB_NAME

echo "6️⃣ Configuring Firewall..."
az postgres server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --server $DB_SERVER_NAME \
    --name AllowAllWindowsAzureIps \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0

echo "7️⃣ Setting up App Service Configuration..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
        NODE_ENV=production \
        PORT=8000 \
        WEBSITES_PORT=8000 \
        JWT_SECRET="$(openssl rand -base64 32)" \
        JWT_EXPIRES_IN=7d \
        DATABASE_URL="postgresql://${DB_ADMIN_USER}@${DB_SERVER_NAME}:${DB_ADMIN_PASSWORD}@${DB_SERVER_NAME}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require" \
        CORS_ORIGIN="https://${APP_NAME}.azurewebsites.net" \
        RATE_LIMIT_WINDOW_MS=900000 \
        RATE_LIMIT_MAX_REQUESTS=100 \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true

echo "8️⃣ Getting Publish Profile..."
az webapp deployment list-publishing-profiles \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --xml > publish-profile.xml

echo "✅ Azure Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy the content of 'publish-profile.xml' to GitHub Secret 'AZURE_WEBAPP_PUBLISH_PROFILE'"
echo "2. Update CORS_ORIGIN if you have a different frontend domain"
echo "3. Push your code to main branch to trigger deployment"
echo ""
echo "🌐 Your API will be available at: https://${APP_NAME}.azurewebsites.net"
echo "🔍 Health check: https://${APP_NAME}.azurewebsites.net/api/health"
echo "💾 Database: ${DB_SERVER_NAME}.postgres.database.azure.com"
echo ""
echo "🔑 Database Connection Details:"
echo "  Server: ${DB_SERVER_NAME}.postgres.database.azure.com"
echo "  Database: ${DB_NAME}"
echo "  Username: ${DB_ADMIN_USER}@${DB_SERVER_NAME}"
echo "  Password: ${DB_ADMIN_PASSWORD}"
echo ""
echo "⚠️  Remember to:"
echo "   - Add GitHub Secret: AZURE_WEBAPP_PUBLISH_PROFILE"
echo "   - Update your frontend to use the new API URL"
echo "   - Test the deployment after push to main branch"
