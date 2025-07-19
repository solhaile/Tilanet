# Quick Start Guide - AUTH-01 Implementation

## 🚀 Getting Started

### 1. Set up Environment Variables

Run the setup script to create your `.env` file:

```bash
npm run setup
```

This will create a `.env` file with development defaults. You'll need to update the `DATABASE_URL` with your PostgreSQL connection string.

### 2. Database Setup

You have two options for the database:

#### Option A: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database: `createdb tilanet_dev`
3. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/tilanet_dev
   ```

#### Option B: Use a Cloud Database
- **Supabase** (Free tier available)
- **Neon** (Free tier available)
- **Railway** (Free tier available)

### 3. Run Database Migrations

```bash
npm run db:migrate
```

This will create the new tables and add the `preferred_language` field to the users table.

### 4. Start the Development Server

```bash
npm run dev
```

The server should now start successfully on `http://localhost:3000`

## 🧪 Testing the New Features

### Test the Authentication Flow

1. **Get supported countries and languages:**
   ```bash
   curl http://localhost:3000/api/auth/countries
   curl http://localhost:3000/api/auth/languages
   ```

2. **Sign up a new user:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "phone": "+251912345678",
       "password": "password123",
       "firstName": "John",
       "lastName": "Doe",
       "countryCode": "ET",
       "preferredLanguage": "en"
     }'
   ```

3. **Verify OTP (check logs for the code):**
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{
       "phoneNumber": "+251912345678",
       "otpCode": "123456"
     }'
   ```

4. **Sign in:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{
       "phone": "+251912345678",
       "password": "password123"
     }'
   ```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `USE_MOCK_OTP` | Use mock OTP for development | `true` |
| `AZURE_COMMUNICATION_*` | Azure SMS credentials | Not required for dev |

## 🐛 Troubleshooting

### "DATABASE_URL environment variable is required"

1. Make sure you've run `npm run setup`
2. Check that your `.env` file exists and has the correct `DATABASE_URL`
3. Verify your PostgreSQL server is running
4. Test the connection string manually

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # On Windows
   net start postgresql-x64-15
   
   # On macOS/Linux
   sudo service postgresql start
   ```

2. **Test connection:**
   ```bash
   psql "postgresql://username:password@localhost:5432/tilanet_dev"
   ```

3. **Create database if it doesn't exist:**
   ```bash
   createdb tilanet_dev
   ```

### Migration Issues

If you get errors during migration:

1. **Check database permissions**
2. **Ensure PostgreSQL extensions are available:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

## 📚 Next Steps

1. **Run the comprehensive tests:**
   ```bash
   npm test
   ```

2. **Explore the API documentation** in the README.md

3. **Test the frontend integration** with the new authentication flow

4. **Set up Azure Communication Services** for production SMS (optional for development)

## 🆘 Need Help?

- Check the main README.md for detailed documentation
- Review the test files for usage examples
- Check the logs for detailed error messages 