# Tilanet Frontend

React Native application built with Expo for the Tilanet SaaS platform.

## 🚀 Deployment

This frontend is automatically deployed to Azure Static Web Apps via GitHub Actions.

### Environment Variables

The following environment variables must be set in Azure Static Web Apps:

- `REACT_APP_API_BASE_URL`: Backend API URL (e.g., `https://tilanet-app.azurewebsites.net/api`)
- `REACT_APP_ENVIRONMENT`: Environment name (e.g., `production`)

### Current Deployment

- **URL**: https://nice-pebble-0fdb0841e.2.azurestaticapps.net
- **Backend API**: https://tilanet-app.azurewebsites.net/api
- **Status**: Production Ready

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for web
npm run web:build

# Run tests
npm test
```

## 📱 Features

- User authentication (signup/signin)
- OTP verification
- Language selection
- Idir setup
- Dashboard interface
- Responsive design for mobile and web

## 🔧 Configuration

The app uses environment variables for configuration. See `.env.example` for available options. 