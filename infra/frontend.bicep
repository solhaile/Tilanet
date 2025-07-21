@description('Base name for all resources')
param baseName string = 'tilanet'

@description('Location for all resources')
param location string = 'West US 2'

@description('Environment (dev, staging, prod)')
param environment string = 'prod'

@description('Static Web App SKU')
@allowed(['Free', 'Standard'])
param sku string = 'Free'

@description('GitHub repository URL')
param repositoryUrl string = 'https://github.com/your-username/tilanet'

@description('GitHub branch to deploy')
param branch string = 'main'

@description('Build configuration')
param buildConfig object = {
  appLocation: 'Frontend'
  apiLocation: ''
  outputLocation: 'web-build'
  appBuildCommand: 'npm run web:build'
  apiBuildCommand: ''
}

// Resource names
var staticWebAppName = '${baseName}-frontend-${environment}'

// Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: sku
  }
  properties: {
    repositoryUrl: repositoryUrl
    branch: branch
    buildProperties: {
      appLocation: buildConfig.appLocation
      apiLocation: buildConfig.apiLocation
      outputLocation: buildConfig.outputLocation
      appBuildCommand: buildConfig.appBuildCommand
      apiBuildCommand: buildConfig.apiBuildCommand
    }
  }
  tags: {
    Environment: environment
    Project: baseName
    Component: 'frontend'
  }
}

// Note: App settings for Static Web Apps are configured through the Azure portal
// or via Azure CLI after deployment. The configuration is stored in the
// staticwebapp.config.json file in your repository.

// Outputs
output staticWebAppName string = staticWebApp.name
output staticWebAppUrl string = staticWebApp.properties.defaultHostname 