# 🚀 Azure Deployment Checklist

## Pre-Deployment Setup

### ✅ Azure Resources
- [ ] Create Azure Account & Subscription
- [ ] Install Azure CLI locally
- [ ] Login to Azure CLI (`az login`)
- [ ] Create Resource Group
- [ ] Create App Service (Node.js 18 LTS, Linux)
- [ ] Create PostgreSQL Database (optional)

### ✅ GitHub Setup
- [ ] Push code to GitHub repository
- [ ] Get Azure App Service Publish Profile
- [ ] Add `AZURE_WEBAPP_PUBLISH_PROFILE` to GitHub Secrets
- [ ] Verify GitHub Actions workflow file exists

### ✅ Environment Configuration
- [ ] Set `NODE_ENV=production`
- [ ] Set `PORT=8000`
- [ ] Set `WEBSITES_PORT=8000`
- [ ] Generate secure `JWT_SECRET`
- [ ] Configure `DATABASE_URL` (if using database)
- [ ] Set `CORS_ORIGIN` to your frontend domain
- [ ] Enable `SCM_DO_BUILD_DURING_DEPLOYMENT=true`

## Deployment Process

### ✅ Automatic Deployment (Recommended)
- [ ] Push changes to `main` branch
- [ ] Monitor GitHub Actions workflow
- [ ] Check deployment logs for errors
- [ ] Verify API health endpoint

### ✅ Manual Deployment (Alternative)
- [ ] Build project locally (`npm run build`)
- [ ] Deploy using Azure CLI or VS Code extension
- [ ] Verify deployment in Azure Portal

## Post-Deployment Verification

### ✅ API Testing
- [ ] Test health endpoint: `GET /api/health`
- [ ] Test signup endpoint: `POST /api/auth/signup`
- [ ] Test signin endpoint: `POST /api/auth/signin`
- [ ] Verify CORS configuration
- [ ] Test rate limiting

### ✅ Monitoring & Security
- [ ] Enable Application Insights
- [ ] Set up log monitoring
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS only
- [ ] Set up backup strategy
- [ ] Configure scaling rules

### ✅ Database Setup (if applicable)
- [ ] Create PostgreSQL database
- [ ] Configure connection string
- [ ] Set up database migrations
- [ ] Test database connectivity
- [ ] Configure backup retention

## Quick Commands

### Azure CLI Setup
```bash
# Login to Azure
az login

# Run setup script (Linux/Mac)
./scripts/setup-azure.sh

# Run setup script (Windows PowerShell)
./scripts/setup-azure.ps1
```

### GitHub Actions
```bash
# Trigger deployment
git add .
git commit -m "Deploy to Azure"
git push origin main
```

### Environment Variables Template
```bash
NODE_ENV=production
PORT=8000
WEBSITES_PORT=8000
JWT_SECRET=your-secure-secret-here
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://user:pass@server:5432/db?sslmode=require
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

## Troubleshooting

### Common Issues
- [ ] **Build fails**: Check Node.js version in workflow
- [ ] **Environment vars missing**: Verify App Service configuration
- [ ] **Database connection fails**: Check connection string format
- [ ] **CORS errors**: Update CORS_ORIGIN setting
- [ ] **Port issues**: Ensure WEBSITES_PORT=8000

### Debugging Tools
- [ ] Azure Portal → Log Stream
- [ ] Application Insights
- [ ] GitHub Actions logs
- [ ] Azure CLI diagnostics

## Success Criteria

Your deployment is successful when:
- [ ] ✅ GitHub Actions workflow completes without errors
- [ ] ✅ Health endpoint returns 200 OK
- [ ] ✅ Authentication endpoints work correctly
- [ ] ✅ No console errors in browser
- [ ] ✅ Database connections are stable (if applicable)
- [ ] ✅ SSL certificate is valid
- [ ] ✅ Performance is acceptable

## Support & Resources

- 📚 [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- 📚 [GitHub Actions Documentation](https://docs.github.com/en/actions)
- 📚 [Node.js on Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- 📋 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- 🐛 [Troubleshooting Guide](./backend/README.md)
