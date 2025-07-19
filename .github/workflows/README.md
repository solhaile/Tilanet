# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the Tilanet backend deployment and CI/CD pipeline.

## Workflows

### 1. `ci.yml` - Continuous Integration
- **Triggers**: Pull requests and pushes to main/master branches
- **Purpose**: Runs tests with PostgreSQL database
- **Features**:
  - PostgreSQL 15 service container setup
  - Database migrations
  - Linting
  - Test execution with coverage
  - Application build verification
  - Test coverage upload to Codecov

### 2. `deploy-backend.yml` - Deployment Pipeline
- **Triggers**: Pushes to main/master branches
- **Purpose**: Full CI/CD pipeline with Azure deployment
- **Features**:
  - All CI features from `ci.yml`
  - Azure App Service deployment (staging + production)
  - Database migrations on staging and production
  - Health checks and smoke tests
  - Blue-green deployment with slot swapping

## Required GitHub Secrets

### Azure Credentials
```bash
AZURE_CREDENTIALS                    # Service principal credentials for Azure
AZURE_RESOURCE_GROUP                 # Azure resource group name (e.g., tilanet-rg)
AZURE_WEBAPP_PUBLISH_PROFILE_STAGING # Publish profile for staging slot
```

### Database URLs
```bash
STAGING_DATABASE_URL                 # PostgreSQL connection string for staging
PRODUCTION_DATABASE_URL              # PostgreSQL connection string for production
```

### Application Secrets
```bash
JWT_SECRET                           # Secret key for JWT token signing
AZURE_COMMUNICATION_CONNECTION_STRING # Azure Communication Services connection string
```

## Environment Variables

### Test Environment
- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/tilanet_test`
- `NODE_ENV`: `test`
- `JWT_SECRET`: `test-secret-key-for-ci`
- `USE_MOCK_OTP`: `true`
- `AZURE_COMMUNICATION_CONNECTION_STRING`: `test-connection-string`

### Staging Environment
- `NODE_ENV`: `staging`
- `DATABASE_URL`: From `STAGING_DATABASE_URL` secret
- `JWT_SECRET`: From `JWT_SECRET` secret
- `AZURE_COMMUNICATION_CONNECTION_STRING`: From secret

### Production Environment
- `NODE_ENV`: `production`
- `DATABASE_URL`: From `PRODUCTION_DATABASE_URL` secret
- `JWT_SECRET`: From `JWT_SECRET` secret
- `AZURE_COMMUNICATION_CONNECTION_STRING`: From secret

## Setup Instructions

### 1. Azure Service Principal
Create a service principal with the following permissions:
- Contributor access to the resource group
- App Service Contributor role

```bash
az ad sp create-for-rbac --name "tilanet-github-actions" --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group} \
  --sdk-auth
```

### 2. Publish Profile
Download the publish profile from Azure App Service:
1. Go to Azure Portal → App Service → Your App
2. Click "Get publish profile"
3. Download the file and extract the content for staging slot

### 3. Database Setup
Ensure your PostgreSQL databases are accessible from Azure App Service:
- Use Azure Database for PostgreSQL (recommended)
- Configure firewall rules to allow Azure services
- Use connection pooling for production

### 4. Secrets Configuration
Add all required secrets in GitHub:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Add each secret with the appropriate value

## Workflow Execution

### Pull Request Flow
1. `ci.yml` runs automatically
2. Tests execute with PostgreSQL container
3. Coverage report uploaded to Codecov
4. Build verification completed

### Main Branch Deployment Flow
1. `ci.yml` runs first (same as PR)
2. `deploy-backend.yml` executes if CI passes
3. Application deployed to staging slot
4. Database migrations run on staging
5. Health checks performed
6. If successful, staging swapped to production
7. Database migrations run on production
8. Final health checks performed

## Monitoring

### Azure App Service Logs
- Application logs: `/home/LogFiles/Application`
- Deployment logs: Available in Azure Portal
- SSH access: `az webapp ssh --name {app-name} --resource-group {rg}`

### GitHub Actions Logs
- Detailed logs available in Actions tab
- Artifacts preserved for debugging
- Test coverage reports in Codecov

## Troubleshooting

### Common Issues

1. **Database Connection Failures**
   - Verify connection strings in secrets
   - Check firewall rules for Azure services
   - Ensure database is running and accessible

2. **Migration Failures**
   - Check database permissions
   - Verify migration scripts are up to date
   - Review migration logs in Azure

3. **Health Check Failures**
   - Verify application startup command
   - Check environment variables
   - Review application logs in Azure

4. **Deployment Failures**
   - Verify Azure credentials
   - Check resource group permissions
   - Ensure App Service plan has sufficient resources

### Debug Commands

```bash
# Check Azure App Service status
az webapp show --name {app-name} --resource-group {rg}

# View application logs
az webapp log tail --name {app-name} --resource-group {rg}

# SSH into App Service
az webapp ssh --name {app-name} --resource-group {rg}

# Check environment variables
az webapp config appsettings list --name {app-name} --resource-group {rg}
```

## Security Considerations

1. **Secrets Management**
   - Never commit secrets to repository
   - Use GitHub Secrets for sensitive data
   - Rotate secrets regularly

2. **Database Security**
   - Use SSL connections
   - Implement connection pooling
   - Regular security updates

3. **Network Security**
   - Configure firewall rules appropriately
   - Use private endpoints when possible
   - Monitor network access

4. **Application Security**
   - Keep dependencies updated
   - Implement proper authentication
   - Use HTTPS in production 