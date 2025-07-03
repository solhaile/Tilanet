# Azure App Service Deployment Guide

## 🚀 Deploy Node.js Backend to Azure App Service

This guide will help you deploy your Idir Management backend API to Azure App Service using GitHub Actions.

### Prerequisites

1. **Azure Account** with an active subscription
2. **GitHub Repository** with your code
3. **Azure CLI** installed locally (optional)

### Step 1: Create Azure App Service

#### Option A: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"App Service"** and select it
4. Click **"Create"**
5. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `idir-management-api` (or your preferred name)
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Choose your preferred region
   - **App Service Plan**: Create new (B1 Basic or higher)

#### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name idir-management-rg --location "East US"

# Create App Service plan
az appservice plan create --name idir-management-plan --resource-group idir-management-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group idir-management-rg --plan idir-management-plan --name idir-management-api --runtime "NODE|18-lts"
```

### Step 2: Configure Environment Variables

In your Azure App Service, go to **Configuration** → **Application settings** and add:

```bash
NODE_ENV=production
PORT=8000
JWT_SECRET=your-super-secure-production-jwt-secret-key
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://username:password@server.postgres.database.azure.com:5432/database?sslmode=require
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
WEBSITES_PORT=8000
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### Step 3: Get Publish Profile

1. In Azure Portal, go to your App Service
2. Click **"Get publish profile"** in the Overview section
3. Download the `.publishsettings` file
4. Copy the entire content of this file

### Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Create a secret named: `AZURE_WEBAPP_PUBLISH_PROFILE`
5. Paste the publish profile content as the value

### Step 5: Update GitHub Actions Workflow

The workflow file is already created at `.github/workflows/deploy-backend.yml`. 

Update the environment variables in the workflow if needed:
- `AZURE_WEBAPP_NAME`: Your Azure App Service name
- `NODE_VERSION`: Node.js version (18.x)

### Step 6: Deploy

1. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Add Azure deployment configuration"
   git push origin main
   ```

2. **Monitor deployment**:
   - Go to GitHub → Actions tab
   - Watch the deployment progress
   - Check for any errors in the logs

### Step 7: Verify Deployment

Once deployed, your API will be available at:
- **Base URL**: `https://your-app-name.azurewebsites.net`
- **Health Check**: `https://your-app-name.azurewebsites.net/api/health`
- **Signup**: `POST https://your-app-name.azurewebsites.net/api/auth/signup`
- **Signin**: `POST https://your-app-name.azurewebsites.net/api/auth/signin`

### Step 8: Set up Database (PostgreSQL)

#### Create Azure Database for PostgreSQL

```bash
# Create PostgreSQL server
az postgres server create --resource-group idir-management-rg --name idir-management-db --location "East US" --admin-user adminuser --admin-password YourPassword123! --sku-name GP_Gen5_2

# Create database
az postgres db create --resource-group idir-management-rg --server-name idir-management-db --name idir_management

# Configure firewall to allow Azure services
az postgres server firewall-rule create --resource-group idir-management-rg --server idir-management-db --name AllowAllWindowsAzureIps --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

Update your `DATABASE_URL` in App Service configuration:
```
postgresql://adminuser@idir-management-db:YourPassword123!@idir-management-db.postgres.database.azure.com:5432/idir_management?sslmode=require
```

### 🔧 Troubleshooting

#### Common Issues:

1. **Build fails**: Check Node.js version compatibility
2. **Environment variables not set**: Verify App Service configuration
3. **Database connection fails**: Check connection string and firewall rules
4. **Port issues**: Ensure `WEBSITES_PORT=8000` is set

#### Debugging:

1. **View logs**: Azure Portal → App Service → Log stream
2. **SSH into container**: Azure Portal → Development Tools → SSH
3. **Monitor metrics**: Azure Portal → Monitoring → Metrics

### 🔐 Security Considerations

1. **Use strong JWT secrets** in production
2. **Enable HTTPS only** in App Service configuration
3. **Configure custom domains** with SSL certificates
4. **Set up Application Insights** for monitoring
5. **Enable backup** for your database

### 📊 Monitoring

Set up Application Insights:
1. Create Application Insights resource
2. Add instrumentation key to App Service
3. Monitor performance and errors

### 🚀 Advanced Configuration

#### Custom Domain
1. Purchase domain or use existing
2. Configure DNS records
3. Add custom domain in App Service
4. Enable SSL certificate

#### Scaling
- **Scale up**: Increase App Service plan size
- **Scale out**: Add more instances
- **Auto-scaling**: Configure based on metrics

### 💰 Cost Optimization

1. **Use appropriate tier**: Start with B1 Basic
2. **Monitor usage**: Set up billing alerts
3. **Use staging slots**: For testing before production
4. **Schedule scaling**: Scale down during low usage

Your backend API is now ready for production deployment on Azure! 🎉
