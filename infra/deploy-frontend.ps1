#!/usr/bin/env pwsh

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "prod",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "tilanet-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "West US 2"
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "Deploying Tilanet Frontend to Azure Static Web Apps" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Yellow
Write-Host "Location: $Location" -ForegroundColor Yellow

# Check if Azure CLI is installed
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI is not installed. Please install it from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}

# Check if logged in to Azure
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "Logging in to Azure..." -ForegroundColor Yellow
    az login
}

# Set subscription if needed
$subscription = az account show --query "name" -o tsv
Write-Host "Using subscription: $subscription" -ForegroundColor Cyan

# Create resource group if it doesn't exist
Write-Host "Creating resource group if it doesn't exist..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none

# Deploy Static Web App
Write-Host "Deploying Static Web App..." -ForegroundColor Yellow

$deploymentName = "frontend-deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$templateFile = "frontend.bicep"
$parametersFile = if ($Environment -eq "prod") { "frontend.parameters.json" } else { "frontend.dev.parameters.json" }

# Validate the deployment
Write-Host "Validating deployment..." -ForegroundColor Yellow
try {
    $null = & az deployment group validate `
        --resource-group $ResourceGroup `
        --template-file $templateFile `
        --parameters $parametersFile `
        --output none 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Deployment validation failed"
        exit 1
    }
} catch {
    # Continue if validation passes (warning about Bicep version is not a failure)
}

# Deploy the resources
Write-Host "Starting deployment..." -ForegroundColor Yellow
az deployment group create `
    --resource-group $ResourceGroup `
    --template-file $templateFile `
    --parameters $parametersFile `
    --name $deploymentName `
    --verbose

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed"
    exit 1
}

# Get deployment outputs
Write-Host "Getting deployment outputs..." -ForegroundColor Yellow
$outputs = az deployment group show `
    --resource-group $ResourceGroup `
    --name $deploymentName `
    --query "properties.outputs" `
    --output json | ConvertFrom-Json

# Display results
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Deployment Summary:" -ForegroundColor Cyan
Write-Host "   Static Web App Name: $($outputs.staticWebAppName.value)" -ForegroundColor White
Write-Host "   Static Web App URL: https://$($outputs.staticWebAppUrl.value)" -ForegroundColor White
Write-Host "   Environment: $Environment" -ForegroundColor White
Write-Host ""

# Get deployment token for GitHub Actions
Write-Host "Getting deployment token for GitHub Actions..." -ForegroundColor Yellow
try {
    $deploymentToken = az staticwebapp secrets list `
        --name $($outputs.staticWebAppName.value) `
        --query "properties.apiKey" `
        --output tsv
    
    if (-not $deploymentToken) {
        Write-Warning "Could not retrieve deployment token. You may need to set it manually in the Azure portal."
        $deploymentToken = "TOKEN_NOT_AVAILABLE"
    }
} catch {
    Write-Warning "Could not retrieve deployment token. You may need to set it manually in the Azure portal."
    $deploymentToken = "TOKEN_NOT_AVAILABLE"
}

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Add the following secret to your GitHub repository:" -ForegroundColor White
Write-Host "   Name: AZURE_STATIC_WEB_APPS_API_TOKEN" -ForegroundColor Yellow
Write-Host "   Value: $deploymentToken" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Update the repository URL in the parameter files:" -ForegroundColor White
Write-Host "   - infra/frontend.parameters.json" -ForegroundColor Yellow
Write-Host "   - infra/frontend.dev.parameters.json" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Push to your repository to trigger automatic deployment" -ForegroundColor White
Write-Host ""

Write-Host "Frontend deployment completed!" -ForegroundColor Green 