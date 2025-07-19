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
   - `AZURE_COMMUNICATION_CONNECTION_STRING`: For SMS OTP (optional for development)
   - `AZURE_COMMUNICATION_PHONE_NUMBER`: Azure phone number for SMS

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user (requires OTP verification) | `{ phone, password, firstName, lastName, countryCode, preferredLanguage }` |
| POST | `/api/auth/verify-otp` | Verify OTP and activate account | `{ phoneNumber, otpCode }` |
| POST | `/api/auth/signin` | Login user (requires verified account) | `{ phone, password }` |
| POST | `/api/auth/refresh-token` | Refresh access token | `{ refreshToken }` |
| POST | `/api/auth/logout` | Logout user | `{ sessionId? }` (optional) |
| GET | `/api/auth/countries` | Get supported countries | - |
| GET | `/api/auth/languages` | Get supported languages | - |
| PUT | `/api/auth/language` | Update user language preference | `{ language }` |
| POST | `/api/auth/resend-otp` | Resend OTP to phone number | `{ phoneNumber }` |

### OTP Management

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/otp/send` | Send OTP to user | `{ phoneNumber }` |
| POST | `/api/otp/verify` | Verify OTP code | `{ phoneNumber, otpCode }` |
| POST | `/api/otp/resend` | Resend OTP | `{ phoneNumber }` |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health status |

## 🔐 Authentication Flow

### 1. User Registration
1. User submits signup form with phone, password, name, country, and language
2. System validates input and creates unverified user account
3. OTP is automatically sent to user's phone number
4. User receives response indicating verification is required

### 2. Phone Verification
1. User enters OTP code received via SMS
2. System verifies OTP and activates user account
3. User receives access token and refresh token
4. User is redirected to Idir setup

### 3. User Login
1. User provides phone number and password
2. System validates credentials and verification status
3. If verified, user receives new access token and refresh token
4. If not verified, user receives error message

### 4. Token Management
- **Access Token**: Valid for 1 hour, contains user ID and language preference
- **Refresh Token**: Valid for 30 days, used to get new access tokens
- **Session Management**: Tracks device info and IP address for security

## 🌍 Language Support

The API supports two languages:
- **English (en)**: Default language
- **Amharic (am)**: Ethiopian language support

Users can:
- Set language preference during signup
- Update language preference via API
- Receive responses in their preferred language

## 🏳️ Country Support

Supported countries include:
- Ethiopia (ET) - +251
- United States (US) - +1
- Canada (CA) - +1
- United Kingdom (GB) - +44
- Germany (DE) - +49
- France (FR) - +33
- Australia (AU) - +61
- Sweden (SE) - +46
- Norway (NO) - +47
- Denmark (DK) - +45

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database

## 📁 Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── repositories/    # Data access layer
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── validators/     # Input validation
├── app.ts          # Express app configuration
└── server.ts       # Server entry point
```

## 🔒 Security Features

- JWT authentication with secure secrets
- Password hashing with bcrypt
- OTP verification via SMS
- Refresh token mechanism
- Session management
- Request rate limiting
- CORS protection
- Input validation
- Secure headers with Helmet
- Country-specific phone validation
- Device and IP tracking

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run specific test categories:
```bash
npm run test:unit    # Unit tests
npm run test:api     # API integration tests
```

## 📊 Database Schema

### Users Table
- `id`: UUID primary key
- `phone_number`: Unique phone number
- `country_code`: Country code (e.g., ET, US)
- `password`: Hashed password
- `first_name`: User's first name
- `last_name`: User's last name
- `preferred_language`: Language preference (en/am)
- `is_verified`: Account verification status
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Sessions Table
- `id`: UUID primary key
- `user_id`: Foreign key to users table
- `refresh_token`: Secure refresh token
- `device_info`: Device information
- `ip_address`: IP address
- `is_active`: Session status
- `expires_at`: Session expiration
- `created_at`: Session creation timestamp
- `updated_at`: Last update timestamp

### OTP Codes Table
- `id`: UUID primary key
- `user_id`: Foreign key to users table
- `code`: 6-digit OTP code
- `type`: OTP type (sms/voice)
- `phone_number`: Target phone number
- `expires_at`: OTP expiration
- `is_used`: Usage status
- `attempts`: Attempt counter
- `created_at`: Creation timestamp
