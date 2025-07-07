@description('Base name for all resources')
param baseName string = 'tilanet'

@description('Location for all resources')
param location string = 'Canada Central'

@description('Environment (dev, staging, prod)')
param environment string = 'prod'

@description('App Service Plan SKU')
param sku string = 'B1'

// Resource names using consistent basename
var appServicePlanName = '${baseName}-plan'
var webAppName = '${baseName}-app'
var appInsightsName = '${baseName}-insights'
var logWorkspaceName = '${baseName}-logs'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: sku
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
  tags: {
    Environment: environment
    Project: baseName
  }
}

// Web App
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      httpLoggingEnabled: true
      detailedErrorLoggingEnabled: true
      requestTracingEnabled: true
    }
    httpsOnly: true
    clientAffinityEnabled: false
  }
  tags: {
    Environment: environment
    Project: baseName
  }
}

// Staging Slot
resource stagingSlot 'Microsoft.Web/sites/slots@2023-01-01' = {
  parent: webApp
  name: 'staging'
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      httpLoggingEnabled: true
      detailedErrorLoggingEnabled: true
      requestTracingEnabled: true
    }
    httpsOnly: true
    clientAffinityEnabled: false
  }
  tags: {
    Environment: 'staging'
    Project: baseName
  }
}

// Log Analytics Workspace
resource logWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logWorkspaceName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: {
    Environment: environment
    Project: baseName
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Request_Source: 'rest'
    WorkspaceResourceId: logWorkspace.id
  }
  tags: {
    Environment: environment
    Project: baseName
  }
}

// Production App Settings
resource productionAppSettings 'Microsoft.Web/sites/config@2023-01-01' = {
  parent: webApp
  name: 'appsettings'
  properties: {
    WEBSITE_NODE_DEFAULT_VERSION: '22-lts'
    NODE_ENV: 'production'
    PORT: '3000'
    WEBSITE_RUN_FROM_PACKAGE: '0'
    SCM_DO_BUILD_DURING_DEPLOYMENT: 'false'
    APPINSIGHTS_INSTRUMENTATIONKEY: appInsights.properties.InstrumentationKey
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsights.properties.ConnectionString
    ApplicationInsightsAgent_EXTENSION_VERSION: '~3'
  }
}

// Staging App Settings
resource stagingAppSettings 'Microsoft.Web/sites/slots/config@2023-01-01' = {
  parent: stagingSlot
  name: 'appsettings'
  properties: {
    WEBSITE_NODE_DEFAULT_VERSION: '22-lts'
    NODE_ENV: 'staging'
    PORT: '3000'
    WEBSITE_RUN_FROM_PACKAGE: '0'
    SCM_DO_BUILD_DURING_DEPLOYMENT: 'false'
    APPINSIGHTS_INSTRUMENTATIONKEY: appInsights.properties.InstrumentationKey
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsights.properties.ConnectionString
    ApplicationInsightsAgent_EXTENSION_VERSION: '~3'
  }
}

// Outputs
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output stagingUrl string = 'https://${stagingSlot.properties.defaultHostName}'
output webAppName string = webApp.name
output appServicePlanName string = appServicePlan.name
output appInsightsName string = appInsights.name
output resourceGroupName string = resourceGroup().name
