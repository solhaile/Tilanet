#!/bin/bash

# Azure App Service Staging Slots Setup Script
# This script creates staging slots and configures deployment slots

echo "🎭 Setting up Azure App Service Staging Slots..."

# Configuration variables - UPDATE THESE
RESOURCE_GROUP="idir-management-rg"
APP_NAME="tilanet-idir-app"
STAGING_SLOT_NAME="staging"

echo "📋 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  App Name: $APP_NAME"
echo "  Staging Slot: $STAGING_SLOT_NAME"

read -p "Do you want to continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo "1️⃣ Creating staging slot..."
az webapp deployment slot create \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --slot $STAGING_SLOT_NAME

echo "2️⃣ Configuring staging slot settings..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --slot $STAGING_SLOT_NAME \
    --settings \
        NODE_ENV=staging \
        PORT=8000 \
        WEBSITES_PORT=8000 \
        JWT_SECRET="$(openssl rand -base64 32)" \
        JWT_EXPIRES_IN=7d \
        CORS_ORIGIN="https://${APP_NAME}-${STAGING_SLOT_NAME}.azurewebsites.net" \
        RATE_LIMIT_WINDOW_MS=900000 \
        RATE_LIMIT_MAX_REQUESTS=100 \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true

echo "3️⃣ Configuring slot-specific settings (settings that don't swap)..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --slot $STAGING_SLOT_NAME \
    --slot-settings \
        NODE_ENV \
        JWT_SECRET \
        CORS_ORIGIN

echo "4️⃣ Setting up auto-swap (optional - uncomment if needed)..."
# Uncomment the following lines if you want auto-swap from staging to production
# az webapp deployment slot auto-swap \
#     --resource-group $RESOURCE_GROUP \
#     --name $APP_NAME \
#     --slot $STAGING_SLOT_NAME \
#     --target-slot production \
#     --enable

echo "5️⃣ Getting staging slot publish profile..."
az webapp deployment list-publishing-profiles \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --slot $STAGING_SLOT_NAME \
    --xml > staging-publish-profile.xml

echo "6️⃣ Setting up production slot configuration..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
        NODE_ENV=production \
        PORT=8000 \
        WEBSITES_PORT=8000 \
        JWT_SECRET="$(openssl rand -base64 32)" \
        JWT_EXPIRES_IN=7d \
        CORS_ORIGIN="https://${APP_NAME}.azurewebsites.net" \
        RATE_LIMIT_WINDOW_MS=900000 \
        RATE_LIMIT_MAX_REQUESTS=100 \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true

echo "7️⃣ Configuring slot settings for production..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --slot-settings \
        NODE_ENV \
        JWT_SECRET \
        CORS_ORIGIN

echo "✅ Staging Slots Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy 'staging-publish-profile.xml' content to GitHub Secret 'AZURE_WEBAPP_STAGING_PUBLISH_PROFILE'"
echo "2. Update your GitHub workflow to use staging deployment"
echo "3. Configure GitHub Environment protection rules:"
echo "   - Go to GitHub Settings > Environments"
echo "   - Create 'staging' environment"
echo "   - Create 'production-approval' environment with:"
echo "     - Required reviewers"
echo "     - Wait timer (24 hours)"
echo "   - Create 'production' environment with required reviewers"
echo ""
echo "🌐 URLs:"
echo "  Staging: https://${APP_NAME}-${STAGING_SLOT_NAME}.azurewebsites.net"
echo "  Production: https://${APP_NAME}.azurewebsites.net"
echo ""
echo "🔧 Useful Commands:"
echo "  # Swap slots:"
echo "  az webapp deployment slot swap -g $RESOURCE_GROUP -n $APP_NAME -s $STAGING_SLOT_NAME"
echo ""
echo "  # Check slot status:"
echo "  az webapp deployment slot list -g $RESOURCE_GROUP -n $APP_NAME"
echo ""
echo "  # Configure auto-swap:"
echo "  az webapp deployment slot auto-swap -g $RESOURCE_GROUP -n $APP_NAME -s $STAGING_SLOT_NAME --target-slot production --enable"
