#!/bin/bash

# Tilanet Infrastructure Deployment Script
# This script deploys the Azure infrastructure using Bicep templates

set -e

# Configuration
RESOURCE_GROUP_NAME="tilanet-rg"
LOCATION="Canada Central"
DEPLOYMENT_NAME="tilanet-infra-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Azure CLI is installed
check_azure_cli() {
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed. Please install it first."
        echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    print_success "Azure CLI is installed"
}

# Function to check if user is logged in to Azure
check_azure_login() {
    if ! az account show &> /dev/null; then
        print_warning "You are not logged in to Azure. Please login first."
        az login
    fi
    
    SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
    print_success "Logged in to Azure subscription: $SUBSCRIPTION_NAME"
}

# Function to create resource group if it doesn't exist
create_resource_group() {
    print_status "Checking if resource group '$RESOURCE_GROUP_NAME' exists..."
    
    if az group show --name "$RESOURCE_GROUP_NAME" &> /dev/null; then
        print_success "Resource group '$RESOURCE_GROUP_NAME' already exists"
    else
        print_status "Creating resource group '$RESOURCE_GROUP_NAME'..."
        az group create --name "$RESOURCE_GROUP_NAME" --location "$LOCATION"
        print_success "Resource group '$RESOURCE_GROUP_NAME' created"
    fi
}

# Function to deploy infrastructure
deploy_infrastructure() {
    local environment=${1:-"prod"}
    local parameter_file="main.parameters.json"
    
    if [ "$environment" = "dev" ]; then
        parameter_file="main.dev.parameters.json"
    fi
    
    print_status "Deploying infrastructure for environment: $environment"
    print_status "Using parameter file: $parameter_file"
    print_status "Deployment name: $DEPLOYMENT_NAME"
    
    # Validate the deployment first
    print_status "Validating Bicep template..."
    az deployment group validate \
        --resource-group "$RESOURCE_GROUP_NAME" \
        --template-file main.bicep \
        --parameters "@$parameter_file"
    
    print_success "Template validation passed"
    
    # Deploy the infrastructure
    print_status "Deploying infrastructure..."
    az deployment group create \
        --resource-group "$RESOURCE_GROUP_NAME" \
        --name "$DEPLOYMENT_NAME" \
        --template-file main.bicep \
        --parameters "@$parameter_file" \
        --verbose
    
    print_success "Infrastructure deployment completed"
}

# Function to get deployment outputs
get_deployment_outputs() {
    print_status "Getting deployment outputs..."
    
    echo ""
    echo "=== Deployment Outputs ==="
    az deployment group show \
        --resource-group "$RESOURCE_GROUP_NAME" \
        --name "$DEPLOYMENT_NAME" \
        --query properties.outputs \
        --output table
    
    echo ""
    echo "=== URLs ==="
    WEB_APP_URL=$(az deployment group show --resource-group "$RESOURCE_GROUP_NAME" --name "$DEPLOYMENT_NAME" --query properties.outputs.webAppUrl.value -o tsv)
    STAGING_URL=$(az deployment group show --resource-group "$RESOURCE_GROUP_NAME" --name "$DEPLOYMENT_NAME" --query properties.outputs.stagingUrl.value -o tsv)
    
    echo "Production URL: $WEB_APP_URL"
    echo "Staging URL: $STAGING_URL"
    echo ""
}

# Function to show help
show_help() {
    echo "Usage: $0 [ENVIRONMENT]"
    echo ""
    echo "ENVIRONMENT: prod (default) | dev"
    echo ""
    echo "Examples:"
    echo "  $0           # Deploy production environment"
    echo "  $0 prod      # Deploy production environment"
    echo "  $0 dev       # Deploy development environment"
    echo ""
    echo "This script will:"
    echo "  1. Check Azure CLI installation and login status"
    echo "  2. Create resource group if it doesn't exist"
    echo "  3. Validate and deploy Bicep template"
    echo "  4. Show deployment outputs"
}

# Main script
main() {
    local environment=${1:-"prod"}
    
    # Show help if requested
    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_help
        exit 0
    fi
    
    # Validate environment parameter
    if [ "$environment" != "prod" ] && [ "$environment" != "dev" ]; then
        print_error "Invalid environment: $environment"
        print_error "Supported environments: prod, dev"
        exit 1
    fi
    
    print_status "Starting Tilanet infrastructure deployment..."
    print_status "Environment: $environment"
    print_status "Resource Group: $RESOURCE_GROUP_NAME"
    print_status "Location: $LOCATION"
    echo ""
    
    # Run deployment steps
    check_azure_cli
    check_azure_login
    create_resource_group
    deploy_infrastructure "$environment"
    get_deployment_outputs
    
    print_success "Deployment completed successfully! 🎉"
}

# Run main function with all arguments
main "$@"
