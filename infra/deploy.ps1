# Tilanet Infrastructure Deployment Script (PowerShell)
# This script deploys the Azure infrastructure using Bicep templates

param(
    [Parameter(Position=0)]
    [ValidateSet("prod", "dev")]
    [string]$Environment = "prod",
    
    [Parameter()]
    [switch]$Help
)

# Configuration
$ResourceGroupName = "tilanet-rg"
$Location = "Canada Central"
$DeploymentName = "tilanet-infra-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Colors for output
function Write-Info($Message) {
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success($Message) {
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning($Message) {
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error($Message) {
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to show help
function Show-Help {
    Write-Host "Usage: .\deploy.ps1 [ENVIRONMENT]" -ForegroundColor White
    Write-Host ""
    Write-Host "ENVIRONMENT: prod (default) | dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\deploy.ps1           # Deploy production environment" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 prod      # Deploy production environment" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 dev       # Deploy development environment" -ForegroundColor Gray
    Write-Host ""
    Write-Host "This script will:" -ForegroundColor White
    Write-Host "  1. Check Azure CLI installation and login status" -ForegroundColor Gray
    Write-Host "  2. Create resource group if it doesn't exist" -ForegroundColor Gray
    Write-Host "  3. Validate and deploy Bicep template" -ForegroundColor Gray
    Write-Host "  4. Show deployment outputs" -ForegroundColor Gray
}

# Function to check if Azure CLI is installed
function Test-AzureCLI {
    try {
        $null = Get-Command az -ErrorAction Stop
        Write-Success "Azure CLI is installed"
        return $true
    }
    catch {
        Write-Error "Azure CLI is not installed. Please install it first."
        Write-Host "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
        return $false
    }
}

# Function to check if user is logged in to Azure
function Test-AzureLogin {
    try {
        $account = az account show 2>$null | ConvertFrom-Json
        if ($account) {
            Write-Success "Logged in to Azure subscription: $($account.name)"
            return $true
        }
    }
    catch {
        # Continue to login prompt
    }
    
    Write-Warning "You are not logged in to Azure. Please login first."
    az login
    
    $account = az account show | ConvertFrom-Json
    Write-Success "Logged in to Azure subscription: $($account.name)"
    return $true
}

# Function to create resource group if it doesn't exist
function New-ResourceGroupIfNotExists {
    Write-Info "Checking if resource group '$ResourceGroupName' exists..."
    
    try {
        $rg = az group show --name $ResourceGroupName 2>$null | ConvertFrom-Json
        if ($rg) {
            Write-Success "Resource group '$ResourceGroupName' already exists"
            return $true
        }
    }
    catch {
        # Resource group doesn't exist, continue to create
    }
    
    Write-Info "Creating resource group '$ResourceGroupName'..."
    az group create --name $ResourceGroupName --location $Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Resource group '$ResourceGroupName' created"
        return $true
    }
    else {
        Write-Error "Failed to create resource group"
        return $false
    }
}

# Function to deploy infrastructure
function Deploy-Infrastructure {
    param([string]$Env)
    
    $ParameterFile = "main.parameters.json"
    
    if ($Env -eq "dev") {
        $ParameterFile = "main.dev.parameters.json"
    }
    
    Write-Info "Deploying infrastructure for environment: $Env"
    Write-Info "Using parameter file: $ParameterFile"
    Write-Info "Deployment name: $DeploymentName"
    
    # Prompt for database admin password
    Write-Host ""
    Write-Warning "Database Configuration Required"
    Write-Host "PostgreSQL admin password requirements:"
    Write-Host "- Minimum 8 characters"
    Write-Host "- Must contain uppercase, lowercase, and number"
    Write-Host ""
    
    $SecurePassword = Read-Host "Enter PostgreSQL admin password" -AsSecureString
    $DbAdminPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword))
    
    # Validate password length
    if ($DbAdminPassword.Length -lt 8) {
        Write-Error "Password must be at least 8 characters long"
        return $false
    }
    
    # Validate the deployment first
    Write-Info "Validating Bicep template..."
    az deployment group validate `
        --resource-group $ResourceGroupName `
        --template-file main.bicep `
        --parameters "@$ParameterFile" `
        --parameters dbAdminPassword="$DbAdminPassword"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Template validation failed"
        return $false
    }
    
    Write-Success "Template validation passed"
    
    # Deploy the infrastructure
    Write-Info "Deploying infrastructure..."
    Write-Info "This may take 10-15 minutes to complete."
    az deployment group create `
        --resource-group $ResourceGroupName `
        --name $DeploymentName `
        --template-file main.bicep `
        --parameters "@$ParameterFile" `
        --parameters dbAdminPassword="$DbAdminPassword" `
        --verbose
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Infrastructure deployment completed"
        return $true
    }
    else {
        Write-Error "Infrastructure deployment failed"
        return $false
    }
}

# Function to get deployment outputs
function Get-DeploymentOutputs {
    Write-Info "Getting deployment outputs..."
    
    Write-Host ""
    Write-Host "=== Deployment Outputs ===" -ForegroundColor White
    az deployment group show `
        --resource-group $ResourceGroupName `
        --name $DeploymentName `
        --query properties.outputs `
        --output table
    
    Write-Host ""
    Write-Host "=== URLs ===" -ForegroundColor White
    
    $WebAppUrl = az deployment group show --resource-group $ResourceGroupName --name $DeploymentName --query properties.outputs.webAppUrl.value -o tsv
    $StagingUrl = az deployment group show --resource-group $ResourceGroupName --name $DeploymentName --query properties.outputs.stagingUrl.value -o tsv
    
    Write-Host "Production URL: $WebAppUrl" -ForegroundColor Green
    Write-Host "Staging URL: $StagingUrl" -ForegroundColor Yellow
    Write-Host ""
}

# Main script
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Write-Info "Starting Tilanet infrastructure deployment..."
    Write-Info "Environment: $Environment"
    Write-Info "Resource Group: $ResourceGroupName"
    Write-Info "Location: $Location"
    Write-Host ""
    
    # Check prerequisites
    if (-not (Test-AzureCLI)) {
        exit 1
    }
    
    if (-not (Test-AzureLogin)) {
        exit 1
    }
    
    # Deploy infrastructure
    if (-not (New-ResourceGroupIfNotExists)) {
        exit 1
    }
    
    if (-not (Deploy-Infrastructure $Environment)) {
        exit 1
    }
    
    Get-DeploymentOutputs
    
    Write-Success "Deployment completed successfully! 🎉"
}

# Run main function
Main