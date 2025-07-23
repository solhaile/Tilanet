# Infrastructure

This folder contains the Azure infrastructure as code using Bicep templates for the Tilanet application (both backend and frontend).

## 📁 Structure

```
infra/
├── main.bicep                    # Main Bicep template (Backend)
├── main.parameters.json          # Production parameters (Backend)
├── main.dev.parameters.json      # Development parameters (Backend)
├── deploy.sh                     # Bash deployment script (Backend)
├── deploy.ps1                    # PowerShell deployment script (Backend)
└── README.md                     # This file
```

## 🏗️ Resources Created

### Backend Infrastructure (Azure App Service)
The Bicep template creates:

#### Core Resources
- **App Service Plan**: `tilanet-plan` - Linux-based plan for hosting
- **Web App**: `tilanet-app` - Main production application
- **Staging Slot**: `staging` - Deployment slot for testing
- **Application Insights**: `tilanet-insights` - Application monitoring
- **Log Analytics Workspace**: `tilanet-logs` - Centralized logging

#### Configuration
- **Node.js Version**: 22-lts (latest stable)
- **Always On**: Enabled for non-free tiers
- **HTTPS Only**: Enforced for security
- **TLS Version**: Minimum 1.2
- **FTPS**: Disabled for security

### Frontend Infrastructure (Azure Static Web Apps)
The frontend is deployed using Azure Static Web Apps via GitHub Actions:

#### Core Resources
- **Static Web App**: `tilanet-frontend-prod` - Frontend application
- **GitHub Integration**: Automatic deployment from main branch
- **Global CDN**: Fast global content delivery
- **Built-in Authentication**: Ready for auth integration

#### Configuration
- **Framework**: React Native (Expo Web)
- **Build Tool**: Expo CLI
- **Deployment**: GitHub Actions workflow
- **Environment**: Production-ready with custom domain support

## 🌐 Current Deployment URLs

### Backend (Production)
- **API Base URL**: `https://tilanet-app.azurewebsites.net`
- **Health Check**: `https://tilanet-app.azurewebsites.net/api/health`
- **Staging**: `https://tilanet-app-staging.azurewebsites.net`

### Frontend (Production)
- **Application URL**: `https://ambitious-desert-044e6d01e-production.westus2.1.azurestaticapps.net`
- **GitHub Actions**: Automatic deployment from main branch

## 🚀 Deployment

### Backend Deployment

#### Prerequisites
- Azure CLI installed and configured
- Appropriate Azure permissions (Contributor role on subscription/resource group)

#### Using PowerShell (Windows)
```powershell
# Deploy to production
.\deploy.ps1

# Deploy to development
.\deploy.ps1 dev

# Show help
.\deploy.ps1 -Help
```

#### Using Bash (Linux/macOS/WSL)
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

#### Manual Backend Deployment

##### 1. Login to Azure
```bash
az login
```

##### 2. Create Resource Group (if needed)
```bash
az group create --name tilanet-rg --location "West US 2"
```

##### 3. Deploy Infrastructure
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

### Frontend Deployment

The frontend is automatically deployed via GitHub Actions when code is pushed to the main branch.

#### Manual Frontend Deployment (if needed)
```bash
# Navigate to frontend directory
cd ../Frontend

# Install dependencies
npm install

# Build for web
npm run web:build

# Deploy using Azure CLI (if you have the deployment token)
az staticwebapp deploy \
  --source-path dist \
  --deployment-token YOUR_DEPLOYMENT_TOKEN
```

## ⚙️ Parameters

### Backend Production (`main.parameters.json`)
- **Base Name**: `tilanet`
- **SKU**: `B1` (Basic tier with Always On)
- **Location**: `West US 2`
- **Environment**: `prod`

### Backend Development (`main.dev.parameters.json`)
- **Base Name**: `tilanet-dev`
- **SKU**: `F1` (Free tier for development)
- **Location**: `West US 2`
- **Environment**: `dev`

## 🔧 Resource Naming Convention

### Backend Resources (with `baseName = "tilanet"`)
- App Service Plan: `tilanet-plan`
- Web App: `tilanet-app`
- Application Insights: `tilanet-insights`
- Log Analytics: `tilanet-logs`
- Staging Slot: `staging` (under tilanet-app)

### Frontend Resources
- Static Web App: `tilanet-frontend-prod`
- Resource Group: `tilanet-rg`

## 🔧 Environment Variables

### Backend Environment Variables
Set these in Azure App Service → Configuration → Application settings:

```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
AZURE_COMMUNICATION_CONNECTION_STRING=your_azure_communication_connection
SKIP_OTP_VERIFICATION=false
```

### Frontend Environment Variables
Set these in Azure Static Web Apps → Configuration → Application settings:

```
REACT_APP_API_BASE_URL=https://tilanet-app.azurewebsites.net/api
REACT_APP_ENVIRONMENT=production
```

## 📊 Monitoring

### Backend Monitoring
The template includes Application Insights for monitoring:
- **Performance monitoring**
- **Error tracking**
- **Usage analytics**
- **Custom telemetry**

Access monitoring at:
- Azure Portal → Application Insights → `tilanet-insights`

### Frontend Monitoring
Azure Static Web Apps provides:
- **Built-in analytics**
- **Performance monitoring**
- **Error tracking**
- **Traffic analytics**

## 🔐 Security Features

### Backend Security
- **HTTPS Only**: All traffic redirected to HTTPS
- **TLS 1.2+**: Minimum TLS version enforced
- **FTPS Disabled**: No FTP access allowed
- **Client Affinity Disabled**: Better for stateless applications
- **CORS**: Configured for frontend domain
- **Rate Limiting**: Implemented on API endpoints

### Frontend Security
- **HTTPS Only**: All traffic over HTTPS
- **Global CDN**: DDoS protection
- **Built-in Security Headers**: Automatic security headers
- **Authentication Ready**: Built-in auth system available

## 🔄 Integration with CI/CD

### Backend CI/CD
GitHub Actions workflow (`.github/workflows/deploy-backend.yml`):
1. Runs tests with PostgreSQL service
2. Builds and deploys to staging slot
3. Runs health checks
4. Allows manual promotion to production via slot swap

### Frontend CI/CD
GitHub Actions workflow (`.github/workflows/azure-static-web-apps.yml`):
1. Builds React Native app for web
2. Deploys to Azure Static Web Apps
3. Automatic deployment on main branch pushes

## 🧪 Testing

### Backend Testing
```bash
# Run tests locally
cd backend
npm test

# Run tests in CI/CD
npm run test:ci
```

### Frontend Testing
```bash
# Run tests locally
cd Frontend
npm test

# Build for testing
npm run web:build
```

## 📝 Development Notes

### Backend Development
- Free tier (F1) doesn't support Always On or staging slots
- For production workloads, use B1 or higher
- Staging slots are only available in Standard tier and above
- Application Insights data retention is set to 30 days
- OTP verification can be bypassed for development using `SKIP_OTP_VERIFICATION=true`

### Frontend Development
- Built with React Native and Expo
- Supports both mobile and web platforms
- Uses AsyncStorage for local data persistence
- Implements authentication flow with OTP verification
- Responsive design for mobile and desktop

## 🚨 Troubleshooting

### Common Backend Issues
1. **Database Connection**: Ensure `DATABASE_URL` is set correctly
2. **Node.js Version**: App Service should use Node.js 22-lts
3. **Drizzle Migrations**: Check if `drizzle-kit` is available in production
4. **CORS Errors**: Verify frontend URL is in CORS configuration

### Common Frontend Issues
1. **API Calls to localhost**: Ensure `REACT_APP_API_BASE_URL` is set
2. **Build Failures**: Check Expo configuration and dependencies
3. **Deployment Failures**: Verify GitHub Actions workflow configuration
4. **Authentication Issues**: Check if backend is accessible from frontend

## 📞 Support

For infrastructure issues:
1. Check Azure Portal for resource status
2. Review GitHub Actions logs for deployment issues
3. Check Application Insights for backend errors
4. Verify environment variables are set correctly

## 🔄 Updates and Maintenance

### Infrastructure Updates
- Update Bicep templates for new resources
- Modify parameters for configuration changes
- Test deployments in development environment first

### Application Updates
- Backend: Push to main branch triggers automatic deployment
- Frontend: Push to main branch triggers automatic deployment
- Database: Use Drizzle migrations for schema changes
