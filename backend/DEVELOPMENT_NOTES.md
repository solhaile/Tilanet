# Development Notes & Production TODOs

## 🚨 CRITICAL: Production Security Requirements

### 1. OTP Verification Control (SET FOR PRODUCTION)

**Current Status:** ❌ **BYPASSED VIA ENVIRONMENT VARIABLE**

**Environment Variable:**
```env
SKIP_OTP_VERIFICATION=true  # Development/Testing
SKIP_OTP_VERIFICATION=false # Production
```

**What's Bypassed (when SKIP_OTP_VERIFICATION=true):**
- Users are automatically marked as verified during registration
- OTP verification step is skipped
- Users can signin immediately after registration

**Production Requirements:**
- [ ] Set `SKIP_OTP_VERIFICATION=false` in production
- [ ] Implement proper SMS OTP delivery (Azure Communication Services)
- [ ] Add OTP expiration and retry limits
- [ ] Add rate limiting for OTP requests
- [ ] Test full OTP verification flow

**Files to Update:**
- Environment variables - Set `SKIP_OTP_VERIFICATION=false`
- `src/services/authService.ts` - Already configured to use environment variable

---

### 2. Environment Variables (SET FOR PRODUCTION)

**Current Status:** ❌ **USING DEFAULT VALUES**

**Required Production Variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_ACCESS_TOKEN_EXPIRY=1h
JWT_REFRESH_TOKEN_EXPIRY=30d

# OTP Verification Control
SKIP_OTP_VERIFICATION=false  # MUST BE FALSE FOR PRODUCTION

# Azure Communication Services (for SMS OTP)
AZURE_COMMUNICATION_CONNECTION_STRING=your-azure-connection-string
AZURE_COMMUNICATION_PHONE_NUMBER=your-azure-phone-number

# Server Configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

### 3. Database Security (ENABLE FOR PRODUCTION)

**Current Status:** ❌ **DEVELOPMENT SETTINGS**

**Production Requirements:**
- [ ] Enable SSL connections
- [ ] Use connection pooling
- [ ] Set up database backups
- [ ] Implement database migrations safely
- [ ] Add database monitoring

---

### 4. API Security (ENABLE FOR PRODUCTION)

**Current Status:** ❌ **BASIC SECURITY**

**Production Requirements:**
- [ ] Enable HTTPS only
- [ ] Add API rate limiting
- [ ] Implement request validation
- [ ] Add security headers (HSTS, CSP, etc.)
- [ ] Enable CORS with specific origins
- [ ] Add request logging and monitoring
- [ ] Implement API versioning

---

### 5. Authentication Security (ENHANCE FOR PRODUCTION)

**Current Status:** ⚠️ **BASIC IMPLEMENTATION**

**Production Requirements:**
- [ ] Implement password complexity requirements
- [ ] Add account lockout after failed attempts
- [ ] Implement session management
- [ ] Add device fingerprinting
- [ ] Implement 2FA (optional)
- [ ] Add login attempt monitoring
- [ ] Implement secure password reset flow

---

## 🔧 Development Tools & Scripts

### Database Management Scripts
- `scripts/check-users.ts` - View registered users
- `scripts/check-otp.ts` - Check OTP codes for a user
- `scripts/verify-user.ts` - Manually verify a user (DEV ONLY)
- `scripts/debug-otp.ts` - Debug OTP issues

### Usage Examples
```bash
# Check registered users
npx ts-node scripts/check-users.ts

# Check OTP for specific user
npx ts-node scripts/check-otp.ts

# Manually verify user (DEV ONLY)
npx ts-node scripts/verify-user.ts

# Debug OTP issues
npx ts-node scripts/debug-otp.ts
```

---

## 🚀 Deployment Checklist

### Pre-Production
- [ ] Set `SKIP_OTP_VERIFICATION=false`
- [ ] Set all production environment variables
- [ ] Enable database SSL
- [ ] Configure Azure Communication Services
- [ ] Set up monitoring and logging
- [ ] Test OTP verification flow
- [ ] Security audit

### Production Deployment
- [ ] Database migrations
- [ ] Environment configuration
- [ ] SSL certificate setup
- [ ] Load balancer configuration
- [ ] Monitoring setup
- [ ] Backup configuration

---

## 📝 Notes

### OTP Verification Control Implementation
The OTP verification is controlled by the `SKIP_OTP_VERIFICATION` environment variable:
- **Development/Testing:** `SKIP_OTP_VERIFICATION=true` (auto-verify users)
- **Production:** `SKIP_OTP_VERIFICATION=false` (require OTP verification)

### Testing OTP Flow
To test the OTP flow in development:
1. Set `SKIP_OTP_VERIFICATION=false` in your environment
2. Use the OTP verification endpoints
3. Test with real phone numbers (Azure Communication Services)

---

## 🔒 Security Reminders

1. **Never commit sensitive data** (passwords, keys, etc.)
2. **Always use environment variables** for configuration
3. **Enable all security features** before production
4. **Regular security audits** and updates
5. **Monitor for suspicious activity**
6. **Keep dependencies updated**

---

*Last Updated: 2025-07-21*
*Next Review: Before Production Deployment* 