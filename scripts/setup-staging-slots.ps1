# PowerShell script for Windows users
# Azure App Service Staging Slots Setup Script

Write-Host "🎭 Setting up Azure App Service Staging Slots..." -ForegroundColor Green

# Configuration variables - UPDATE THESE
$RESOURCE_GROUP = "idir-management-rg"
$APP_NAME = "tilanet-idir-app"
$STAGING_SLOT_NAME = "staging"

Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  App Name: $APP_NAME"
Write-Host "  Staging Slot: $STAGING_SLOT_NAME"

$confirmation = Read-Host "Do you want to continue? (y/n)"
if ($confirmation -ne 'y') {
    exit
}

Write-Host "1️⃣ Creating staging slot..." -ForegroundColor Yellow
az webapp deployment slot create `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --slot $STAGING_SLOT_NAME

Write-Host "2️⃣ Configuring staging slot settings..." -ForegroundColor Yellow
$STAGING_JWT_SECRET = [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
az webapp config appsettings set `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --slot $STAGING_SLOT_NAME `
    --settings `
        NODE_ENV=staging `
        PORT=8000 `
        WEBSITES_PORT=8000 `
        "JWT_SECRET=$STAGING_JWT_SECRET" `
        JWT_EXPIRES_IN=7d `
        "CORS_ORIGIN=https://${APP_NAME}-${STAGING_SLOT_NAME}.azurewebsites.net" `
        RATE_LIMIT_WINDOW_MS=900000 `
        RATE_LIMIT_MAX_REQUESTS=100 `
        SCM_DO_BUILD_DURING_DEPLOYMENT=true

Write-Host "3️⃣ Configuring slot-specific settings..." -ForegroundColor Yellow
az webapp config appsettings set `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --slot $STAGING_SLOT_NAME `
    --slot-settings `
        NODE_ENV `
        JWT_SECRET `
        CORS_ORIGIN

Write-Host "4️⃣ Getting staging slot publish profile..." -ForegroundColor Yellow
az webapp deployment list-publishing-profiles `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --slot $STAGING_SLOT_NAME `
    --xml | Out-File -FilePath "staging-publish-profile.xml"

Write-Host "5️⃣ Setting up production slot configuration..." -ForegroundColor Yellow
$PROD_JWT_SECRET = [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
az webapp config appsettings set `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --settings `
        NODE_ENV=production `
        PORT=8000 `
        WEBSITES_PORT=8000 `
        "JWT_SECRET=$PROD_JWT_SECRET" `
        JWT_EXPIRES_IN=7d `
        "CORS_ORIGIN=https://${APP_NAME}.azurewebsites.net" `
        RATE_LIMIT_WINDOW_MS=900000 `
        RATE_LIMIT_MAX_REQUESTS=100 `
        SCM_DO_BUILD_DURING_DEPLOYMENT=true

Write-Host "6️⃣ Configuring slot settings for production..." -ForegroundColor Yellow
az webapp config appsettings set `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --slot-settings `
        NODE_ENV `
        JWT_SECRET `
        CORS_ORIGIN

Write-Host "✅ Staging Slots Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy 'staging-publish-profile.xml' content to GitHub Secret 'AZURE_WEBAPP_STAGING_PUBLISH_PROFILE'"
Write-Host "2. Update your GitHub workflow to use staging deployment"
Write-Host "3. Configure GitHub Environment protection rules:"
Write-Host "   - Go to GitHub Settings > Environments"
Write-Host "   - Create 'staging' environment"
Write-Host "   - Create 'production-approval' environment with:"
Write-Host "     - Required reviewers"
Write-Host "     - Wait timer (24 hours)"
Write-Host "   - Create 'production' environment with required reviewers"
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Green
Write-Host "  Staging: https://${APP_NAME}-${STAGING_SLOT_NAME}.azurewebsites.net"
Write-Host "  Production: https://${APP_NAME}.azurewebsites.net"
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Yellow
Write-Host "  # Swap slots:"
Write-Host "  az webapp deployment slot swap -g $RESOURCE_GROUP -n $APP_NAME -s $STAGING_SLOT_NAME"
Write-Host ""
Write-Host "  # Check slot status:"
Write-Host "  az webapp deployment slot list -g $RESOURCE_GROUP -n $APP_NAME"
Write-Host ""
Write-Host "  # Configure auto-swap:"
Write-Host "  az webapp deployment slot auto-swap -g $RESOURCE_GROUP -n $APP_NAME -s $STAGING_SLOT_NAME --target-slot production --enable"
