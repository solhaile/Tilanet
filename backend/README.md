# Idir Management Backend

A Node.js backend API built with Express.js and TypeScript for the Idir Management SaaS platform.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (for production)

### Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   - `JWT_SECRET`: Your JWT secret key
   - `DATABASE_URL`: PostgreSQL connection string
   - `PORT`: Server port (default: 3000)

4. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | `{ phone, password, firstName, lastName }` |
| POST | `/api/auth/signin` | Login user | `{ phone, password }` |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health status |

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📁 Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── validators/     # Input validation
├── app.ts          # Express app configuration
└── server.ts       # Server entry point
```

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Request rate limiting
- CORS protection
- Helmet security headers
- Input validation

## 🧪 Testing

Run the test suite:
```bash
npm test
```

For watch mode:
```bash
npm run test:watch
```

## 🚀 Deployment

### Local Development
1. Build the project:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

### Azure App Service Deployment

This project is configured for automatic deployment to Azure App Service using GitHub Actions.

#### Quick Deploy Steps:
1. **Create Azure App Service** (Node.js 18 LTS, Linux)
2. **Set environment variables** in Azure App Service Configuration
3. **Add publish profile** to GitHub Secrets as `AZURE_WEBAPP_PUBLISH_PROFILE`
4. **Push to main branch** - automatic deployment will trigger

#### Required Azure Environment Variables:
```bash
NODE_ENV=production
PORT=8000
JWT_SECRET=your-production-secret
DATABASE_URL=your-postgresql-connection-string
CORS_ORIGIN=https://your-frontend-domain.com
WEBSITES_PORT=8000
```

📋 **See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for detailed deployment instructions.**

### GitHub Actions Workflow

The deployment workflow (`.github/workflows/deploy-backend.yml`) automatically:
- ✅ Installs dependencies
- ✅ Runs tests and linting
- ✅ Builds the TypeScript project
- ✅ Deploys to Azure App Service on main branch push

## 📄 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `3000` | No |
| `JWT_SECRET` | JWT signing secret | - | **Yes** |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` | No |
| `DATABASE_URL` | PostgreSQL connection string | - | **Yes** |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` | No |
| `WEBSITES_PORT` | Azure App Service port | `8000` | Azure only |

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Run linting and tests before submitting
