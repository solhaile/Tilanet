# OTP Verification Control Guide

## Overview

The OTP (One-Time Password) verification system can be controlled via environment variables, making it easy to switch between development and production modes without code changes.

## Environment Variable Control

### `SKIP_OTP_VERIFICATION`

**Values:**
- `true` - Skip OTP verification (Development/Testing)
- `false` - Require OTP verification (Production)

**Default:** `false` (OTP verification required)

## How It Works

### When `SKIP_OTP_VERIFICATION=true`:
1. **Registration:** Users are automatically marked as verified
2. **Signin:** Users can signin immediately after registration
3. **No OTP:** No SMS is sent, no OTP verification required

### When `SKIP_OTP_VERIFICATION=false`:
1. **Registration:** Users are created as unverified
2. **OTP Required:** SMS is sent with OTP code
3. **Verification:** Users must enter OTP to verify account
4. **Signin:** Only verified users can signin

## Configuration Examples

### Development Environment
```env
SKIP_OTP_VERIFICATION=true
NODE_ENV=development
```

### Testing Environment
```env
SKIP_OTP_VERIFICATION=true
NODE_ENV=test
```

### Production Environment
```env
SKIP_OTP_VERIFICATION=false
NODE_ENV=production
AZURE_COMMUNICATION_CONNECTION_STRING=your-azure-connection-string
AZURE_COMMUNICATION_PHONE_NUMBER=your-azure-phone-number
```

## Usage in Different Environments

### Development
```bash
# Set environment variable
export SKIP_OTP_VERIFICATION=true

# Start server
npm run dev
```

### Testing
```bash
# Set environment variable
export SKIP_OTP_VERIFICATION=true

# Run tests
npm test
```

### Production
```bash
# Set environment variable
export SKIP_OTP_VERIFICATION=false

# Start server
npm start
```

## VS Code Debugging

The VS Code launch configurations are pre-configured:

- **Debug Backend (Development):** `SKIP_OTP_VERIFICATION=true`
- **Debug Backend (Test):** `SKIP_OTP_VERIFICATION=true`
- **Debug Backend (Production):** `SKIP_OTP_VERIFICATION=false`

## Testing

### Test OTP Bypass
```bash
# Test with OTP bypass enabled
SKIP_OTP_VERIFICATION=true npx ts-node scripts/test-otp-bypass.ts
```

### Test OTP Verification
```bash
# Test with OTP verification enabled
SKIP_OTP_VERIFICATION=false npx ts-node scripts/test-otp-verification.ts
```

## API Endpoints

### Registration Flow

#### With OTP Bypass (`SKIP_OTP_VERIFICATION=true`)
```
POST /api/auth/signup
→ User created and verified
→ Can signin immediately
```

#### With OTP Verification (`SKIP_OTP_VERIFICATION=false`)
```
POST /api/auth/signup
→ User created (unverified)
→ OTP sent via SMS
→ User must verify with OTP
→ Then can signin
```

### Signin Flow

#### With OTP Bypass
```
POST /api/auth/signin
→ Success (if credentials correct)
```

#### With OTP Verification
```
POST /api/auth/signin
→ 403 if user not verified
→ Success only if verified
```

## Error Messages

### When OTP Bypass is Enabled
- **Unverified User:** "Account not verified. OTP verification is disabled but user is not verified. Check SKIP_OTP_VERIFICATION setting."

### When OTP Verification is Required
- **Unverified User:** "Account not verified. Please verify your phone number first."

## Production Checklist

Before deploying to production:

- [ ] Set `SKIP_OTP_VERIFICATION=false`
- [ ] Configure Azure Communication Services
- [ ] Test full OTP verification flow
- [ ] Verify SMS delivery works
- [ ] Test OTP expiration and retry limits
- [ ] Monitor OTP success rates

## Troubleshooting

### Common Issues

1. **Users can't signin after registration**
   - Check if `SKIP_OTP_VERIFICATION=false`
   - Verify user completed OTP verification

2. **OTP not being sent**
   - Check Azure Communication Services configuration
   - Verify `SKIP_OTP_VERIFICATION=false`

3. **Test failing**
   - Ensure correct environment variable is set
   - Check phone number format validation

### Debug Commands

```bash
# Check user verification status
npx ts-node scripts/check-users.ts

# Check OTP codes
npx ts-node scripts/check-otp.ts

# Manually verify user (development only)
npx ts-node scripts/verify-user.ts
```

## Security Notes

- **Never** set `SKIP_OTP_VERIFICATION=true` in production
- **Always** test OTP verification flow before production
- **Monitor** OTP delivery success rates
- **Implement** rate limiting for OTP requests
- **Use** secure SMS delivery service (Azure Communication Services)

---

*Last Updated: 2025-07-21* 