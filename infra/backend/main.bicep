@description('Base name for all resources')
param baseName string = 'tilanet'

@description('Location for all resources')
param location string = 'Canada Central'

@description('PostgreSQL database location (West US required for B1ms SKU)')
param dbLocation string = 'West US'

@description('Environment (dev, staging, prod)')
param environment string = 'prod'

@description('App Service Plan SKU')
param sku string = 'B1'

@description('PostgreSQL admin username')
@secure()
param dbAdminLogin string

@description('PostgreSQL admin password')
@secure()
param dbAdminPassword string

// Resource names using consistent basename
var appServicePlanName = '${baseName}-plan'
var webAppName = '${baseName}-app'
var appInsightsName = '${baseName}-insights'
var logWorkspaceName = '${baseName}-logs'
var dbServerName = '${baseName}-pstgr-db'
var dbName = '${baseName}db'
var communicationServiceName = '${baseName}-comm'
var userManagedIdentityName = '${baseName}-identity'

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
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userManagedIdentity.id}': {}
    }
  }
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
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userManagedIdentity.id}': {}
    }
  }
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

// User Managed Identity
resource userManagedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: userManagedIdentityName
  location: location
  tags: {
    Environment: environment
    Project: baseName
  }
}

// PostgreSQL Flexible Server
resource dbServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: dbServerName
  location: dbLocation
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: dbAdminLogin
    administratorLoginPassword: dbAdminPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    version: '15'
    authConfig: {
      activeDirectoryAuth: 'Enabled'
      passwordAuth: 'Enabled'
    }
  }
  tags: {
    Environment: environment
    Project: baseName
  }
}

// PostgreSQL Database
resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-06-01-preview' = {
  parent: dbServer
  name: dbName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.UTF8'
  }
}

// PostgreSQL Firewall Rule for Azure Services
resource dbFirewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-06-01-preview' = {
  parent: dbServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Azure Communication Service
resource communicationService 'Microsoft.Communication/communicationServices@2023-04-01' = {
  name: communicationServiceName
  location: 'global'
  properties: {
    dataLocation: 'United States'
  }
  tags: {
    Environment: environment
    Project: baseName
  }
}

// Role Assignments for Managed Identity
// PostgreSQL Flexible Server Contributor role assignment
resource dbContributorRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(dbServer.id, userManagedIdentity.id, 'b24988ac-6180-42a0-ab88-20f7382dd24c')
  scope: dbServer
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c') // PostgreSQL Flexible Server Contributor
    principalId: userManagedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Communication Service Contributor role assignment
resource commContributorRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(communicationService.id, userManagedIdentity.id, 'b24988ac-6180-42a0-ab88-20f7382dd24c')
  scope: communicationService
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c') // Communication Service Contributor
    principalId: userManagedIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Production App Settings
resource productionAppSettings 'Microsoft.Web/sites/config@2023-01-01' = {
  parent: webApp
  name: 'appsettings'
  properties: {
    WEBSITE_NODE_DEFAULT_VERSION: '22-lts'
    NODE_ENV: 'production'
    PORT: '5000'
    WEBSITE_RUN_FROM_PACKAGE: '0'
    SCM_DO_BUILD_DURING_DEPLOYMENT: 'false'
    // Startup Configuration
    WEBSITE_STARTUP_FILE: 'startup.sh'
    // Database Configuration
    DATABASE_URL: 'postgresql://${dbAdminLogin}:${dbAdminPassword}@${dbServer.properties.fullyQualifiedDomainName}:5432/${dbName}?sslmode=require'
    // Communication Service Configuration
    COMMUNICATION_PROVIDER: 'azure'
    AZURE_COMMUNICATION_CONNECTION_STRING: communicationService.listKeys().primaryConnectionString
    // Application Insights
    APPINSIGHTS_INSTRUMENTATIONKEY: appInsights.properties.InstrumentationKey
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsights.properties.ConnectionString
    ApplicationInsightsAgent_EXTENSION_VERSION: '~3'
    // Managed Identity
    AZURE_CLIENT_ID: userManagedIdentity.properties.clientId
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
    // Startup Configuration  
    WEBSITE_STARTUP_FILE: 'startup.sh'
    // Database Configuration
    DATABASE_URL: 'postgresql://${dbAdminLogin}:${dbAdminPassword}@${dbServer.properties.fullyQualifiedDomainName}:5432/${dbName}?sslmode=require'
    // Communication Service Configuration
    COMMUNICATION_PROVIDER: 'azure'
    AZURE_COMMUNICATION_CONNECTION_STRING: communicationService.listKeys().primaryConnectionString
    // Application Insights
    APPINSIGHTS_INSTRUMENTATIONKEY: appInsights.properties.InstrumentationKey
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsights.properties.ConnectionString
    ApplicationInsightsAgent_EXTENSION_VERSION: '~3'
    // Managed Identity
    AZURE_CLIENT_ID: userManagedIdentity.properties.clientId
  }
}

// Outputs
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output stagingUrl string = 'https://${stagingSlot.properties.defaultHostName}'
output webAppName string = webApp.name
output appServicePlanName string = appServicePlan.name
output appInsightsName string = appInsights.name
output resourceGroupName string = resourceGroup().name
output dbServerName string = dbServer.name
output dbName string = dbName
output dbServerFqdn string = dbServer.properties.fullyQualifiedDomainName
output communicationServiceName string = communicationService.name
output userManagedIdentityName string = userManagedIdentity.name
output userManagedIdentityClientId string = userManagedIdentity.properties.clientId