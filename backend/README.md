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

1. Build the project:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## 📄 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Run linting and tests before submitting
