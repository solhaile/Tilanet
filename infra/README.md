# Infrastructure

This folder contains the Azure infrastructure as code using Bicep templates for the Tilanet application.

## 📁 Structure

```
infra/
├── main.bicep                    # Main Bicep template
├── main.parameters.json          # Production parameters
├── main.dev.parameters.json      # Development parameters
├── deploy.sh                     # Bash deployment script
├── deploy.ps1                    # PowerShell deployment script
└── README.md                     # This file
```

## 🏗️ Resources Created

The simplified Bicep template creates:

### Core Resources
- **App Service Plan**: `tilanet-plan` - Linux-based plan for hosting
- **Web App**: `tilanet-app` - Main production application
- **Staging Slot**: `staging` - Deployment slot for testing
- **Application Insights**: `tilanet-insights` - Application monitoring
- **Log Analytics Workspace**: `tilanet-logs` - Centralized logging

### Configuration
- **Node.js Version**: 22-lts (latest stable)
- **Always On**: Enabled for non-free tiers
- **HTTPS Only**: Enforced for security
- **TLS Version**: Minimum 1.2
- **FTPS**: Disabled for security

## 🚀 Deployment

### Prerequisites
- Azure CLI installed and configured
- Appropriate Azure permissions (Contributor role on subscription/resource group)

### Using PowerShell (Windows)
```powershell
# Deploy to production
.\deploy.ps1

# Deploy to development
.\deploy.ps1 dev

# Show help
.\deploy.ps1 -Help
```

### Using Bash (Linux/macOS/WSL)
```bash
# Make script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh

# Deploy to development
./deploy.sh dev

# Show help
./deploy.sh --help
```

### Manual Deployment

#### 1. Login to Azure
```bash
az login
```

#### 2. Create Resource Group (if needed)
```bash
az group create --name tilanet-rg --location "Canada Central"
```

#### 3. Deploy Infrastructure
```bash
# Production
az deployment group create \
  --resource-group tilanet-rg \
  --template-file main.bicep \
  --parameters @main.parameters.json

# Development
az deployment group create \
  --resource-group tilanet-rg \
  --template-file main.bicep \
  --parameters @main.dev.parameters.json
```

## ⚙️ Parameters

### Production (`main.parameters.json`)
- **Base Name**: `tilanet`
- **SKU**: `B1` (Basic tier with Always On)
- **Location**: `Canada Central` (matches your existing setup)
- **Environment**: `prod`

### Development (`main.dev.parameters.json`)
- **Base Name**: `tilanet-dev`
- **SKU**: `F1` (Free tier for development)
- **Location**: `Canada Central`
- **Environment**: `dev`

## 🔧 Resource Naming Convention

With `baseName = "tilanet"`, resources are named:
- App Service Plan: `tilanet-plan`
- Web App: `tilanet-app`
- Application Insights: `tilanet-insights`
- Log Analytics: `tilanet-logs`
- Staging Slot: `staging` (under tilanet-app)

## 🔧 Customization

### Changing Parameters
Edit the parameter files to customize:
- App name
- SKU/pricing tier
- Location
- Node.js version

### Modifying Resources
Edit `main.bicep` to:
- Add new resources (databases, storage, etc.)
- Modify app settings
- Change security configurations
- Add custom domains

## 📊 Monitoring

The template includes Application Insights for monitoring:
- **Performance monitoring**
- **Error tracking**
- **Usage analytics**
- **Custom telemetry**

Access monitoring at:
- Azure Portal → Application Insights → `{app-name}-insights-{env}`

## 🔐 Security Features

- **HTTPS Only**: All traffic redirected to HTTPS
- **TLS 1.2+**: Minimum TLS version enforced
- **FTPS Disabled**: No FTP access allowed
- **Client Affinity Disabled**: Better for stateless applications

## 🌐 URLs

After deployment, your application will be available at:
- **Production**: `https://{webAppName}.azurewebsites.net`
- **Staging**: `https://{webAppName}-staging.azurewebsites.net`

## 🔄 Integration with CI/CD

This infrastructure works seamlessly with the GitHub Actions workflow in `.github/workflows/deploy-backend.yml`, which:
1. Deploys to the staging slot
2. Runs health checks
3. Allows manual promotion to production via slot swap

## 📝 Notes

- Free tier (F1) doesn't support Always On or staging slots
- For production workloads, use B1 or higher
- Staging slots are only available in Standard tier and above
- Application Insights data retention is set to 30 days
