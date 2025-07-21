# Azure Frontend Deployment Guide

## Overview

This guide covers deploying the Tilanet React Native/Expo frontend to Azure using **Azure Static Web Apps** - the recommended solution for React Native Web applications.

## 🎯 Deployment Options

### Option 1: Azure Static Web Apps (Recommended) ⭐

**Best for:** React Native Web apps, cost-effective, automatic deployments
- ✅ **Free tier available**
- ✅ **Automatic CI/CD from GitHub**
- ✅ **Global CDN**
- ✅ **Built-in authentication**
- ✅ **API integration**

### Option 2: Azure App Service

**Best for:** Full control, custom configurations
- ⚠️ More expensive
- ⚠️ Manual deployment setup
- ✅ Full control over environment

### Option 3: Azure Container Instances

**Best for:** Containerized applications
- ⚠️ More complex setup
- ✅ Scalable and flexible

## 🚀 Quick Start: Azure Static Web Apps

### Prerequisites

1. **Azure CLI** installed
2. **GitHub repository** with your code
3. **Azure subscription** with billing enabled

### Step 1: Deploy Infrastructure

```powershell
# Navigate to infra directory
cd infra

# Deploy frontend infrastructure
.\deploy-frontend.ps1 -Environment dev
```

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secret:
   - **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value:** (Get from deployment output)

### Step 3: Update Repository URL

Update the repository URL in:
- `infra/frontend.parameters.json`
- `infra/frontend.dev.parameters.json`

```json
{
  "repositoryUrl": {
    "value": "https://github.com/YOUR_USERNAME/YOUR_REPO"
  }
}
```

### Step 4: Push to Deploy

```bash
# Push to main branch for production
git push origin main

# Push to develop branch for staging
git push origin develop
```

## 📁 Project Structure

```
Frontend/
├── azure-static-web-apps.yml    # GitHub Actions workflow
├── package.json                 # Build scripts added
├── app.json                     # Expo web configuration
└── AZURE_DEPLOYMENT_GUIDE.md    # This guide

infra/
├── frontend.bicep               # Azure infrastructure template
├── frontend.parameters.json     # Production parameters
├── frontend.dev.parameters.json # Development parameters
└── deploy-frontend.ps1          # Deployment script
```

## 🔧 Configuration

### Environment Variables

The frontend will automatically receive these environment variables:

```javascript
// Available in your React app
const apiUrl = process.env.REACT_APP_API_URL || 'https://tilanet-app-prod.azurewebsites.net';
const environment = process.env.REACT_APP_ENVIRONMENT || 'production';
```

### Build Configuration

The build process:
1. **Installs dependencies:** `npm ci`
2. **Builds web app:** `npm run web:build`
3. **Deploys to Azure:** Automatic via GitHub Actions

### Custom Domains

To add a custom domain:

1. **Update parameters:**
```json
{
  "customDomain": {
    "value": "app.yourdomain.com"
  }
}
```

2. **Deploy infrastructure:**
```powershell
.\deploy-frontend.ps1 -Environment prod
```

3. **Configure DNS:**
   - Add CNAME record pointing to your Static Web App
   - Wait for DNS propagation

## 🌍 Environment Management

### Development Environment
- **Branch:** `develop`
- **URL:** `https://tilanet-frontend-dev.azurestaticapps.net`
- **Auto-deploy:** On push to `develop`

### Production Environment
- **Branch:** `main`
- **URL:** `https://tilanet-frontend-prod.azurestaticapps.net`
- **Auto-deploy:** On push to `main`

### Preview Environments
- **Branch:** Any feature branch
- **URL:** `https://tilanet-frontend-prod.azurestaticapps.net`
- **Auto-deploy:** On pull request to `main`

## 🔍 Monitoring & Logs

### Azure Portal
1. Go to **Static Web Apps** in Azure Portal
2. Select your app
3. View **Overview**, **Functions**, **Configuration**

### GitHub Actions
1. Go to your repository
2. Click **Actions** tab
3. View deployment logs

### Application Logs
```javascript
// In your React app
console.log('Environment:', process.env.REACT_APP_ENVIRONMENT);
console.log('API URL:', process.env.REACT_APP_API_URL);
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Fails
```bash
# Check build locally
cd Frontend
npm run web:build
```

#### 2. Environment Variables Not Available
- Ensure variables are set in Azure Static Web App configuration
- Check GitHub Actions workflow

#### 3. API Connection Issues
- Verify backend URL is correct
- Check CORS configuration in backend
- Ensure backend is deployed and running

#### 4. Deployment Token Issues
```powershell
# Regenerate deployment token
az staticwebapp secrets set --name "tilanet-frontend-prod" --secret-name "deployment-token" --secret-value "new-token"
```

### Debug Commands

```bash
# Test build locally
cd Frontend
npm run web:build

# Test deployment locally
npm run web:deploy

# Check Azure CLI
az account show
az staticwebapp list --resource-group tilanet-rg
```

## 💰 Cost Optimization

### Free Tier (Recommended for MVP)
- **Static Web Apps:** Free tier includes:
  - 2 GB bandwidth/month
  - 100 GB storage
  - 2 custom domains
  - 2 staging environments

### Standard Tier (For Production)
- **Static Web Apps:** $0.20/GB bandwidth
- **Custom domains:** $0.10/month per domain
- **Additional features:** Advanced routing, authentication

## 🔒 Security

### HTTPS
- **Automatic:** All Static Web Apps use HTTPS
- **Custom domains:** SSL certificates managed automatically

### Authentication
- **Built-in:** Azure Static Web Apps provide authentication
- **Custom:** Can integrate with Azure AD, social logins

### Environment Variables
- **Secure:** Variables stored encrypted in Azure
- **Access:** Only available to your application

## 📈 Scaling

### Automatic Scaling
- **Static Web Apps:** Automatically scale based on traffic
- **CDN:** Global content delivery network
- **No configuration needed**

### Manual Scaling
- **Standard tier:** Configure custom scaling rules
- **Monitoring:** Use Azure Monitor for insights

## 🚀 Advanced Features

### API Integration
```javascript
// Backend API integration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});
```

### Custom Routing
```json
// staticwebapp.config.json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    }
  ]
}
```

### Authentication
```javascript
// Azure Static Web Apps authentication
import { useAuth } from '@azure/static-web-apps-auth';

function App() {
  const { user, login, logout } = useAuth();
  // ...
}
```

## 📞 Support

### Azure Support
- **Documentation:** [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- **Community:** [Azure Community](https://techcommunity.microsoft.com/t5/azure/ct-p/Azure)

### GitHub Actions Support
- **Documentation:** [GitHub Actions](https://docs.github.com/en/actions)
- **Marketplace:** [Azure Static Web Apps Action](https://github.com/marketplace/actions/azure-static-web-apps-deploy)

---

## 🎉 Next Steps

1. **Deploy infrastructure:** Run `deploy-frontend.ps1`
2. **Configure GitHub:** Add deployment token
3. **Update repository URL:** In parameter files
4. **Push code:** Trigger automatic deployment
5. **Test:** Verify deployment works
6. **Monitor:** Set up monitoring and alerts

---

*Last Updated: 2025-07-21* 