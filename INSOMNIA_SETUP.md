# Tilanet API - Insomnia Collection Setup Guide

This guide will help you set up and use the Insomnia API collection to test the Tilanet backend API in different environments.

## 📋 Table of Contents

- [Installation](#installation)
- [Importing the Collection](#importing-the-collection)
- [Environment Setup](#environment-setup)
- [API Endpoints Overview](#api-endpoints-overview)
- [Testing Workflow](#testing-workflow)
- [Authentication Flow](#authentication-flow)
- [Troubleshooting](#troubleshooting)

## 🚀 Installation

### Prerequisites
- [Insomnia](https://insomnia.rest/download) installed on your machine
- Access to the Tilanet API endpoints

### Import the Collection
1. Open Insomnia
2. Click **Create** → **Import from File**
3. Select the `Tilanet-API-Collection.json` file
4. The collection will be imported with all endpoints and environments

## 🌍 Environment Setup

The collection includes three pre-configured environments:

### 1. Production Environment
- **Base URL**: `https://tilanet-app.azurewebsites.net`
- **Use for**: Testing the live production API
- **Note**: Use real phone numbers and credentials

### 2. Staging Environment
- **Base URL**: `https://tilanet-app-staging.azurewebsites.net`
- **Use for**: Testing before production deployment
- **Note**: Safe for testing with sample data

### 3. Local Development
- **Base URL**: `http://localhost:3000`
- **Use for**: Testing local development server
- **Note**: Requires local server to be running

### Switching Environments
1. Click the environment dropdown in the top-right corner
2. Select your desired environment
3. All requests will automatically use the correct base URL

## 📚 API Endpoints Overview

### 🔍 Health Check
- **GET** `/api/health`
- **Purpose**: Verify API is running
- **Authentication**: None required
- **Use case**: Quick health check before testing other endpoints

### 🔐 Authentication Endpoints

#### Public Endpoints (No Auth Required)
- **GET** `/api/auth/countries` - Get supported countries
- **GET** `/api/auth/languages` - Get supported languages
- **POST** `/api/auth/signup` - Register new user
- **POST** `/api/auth/verify-otp` - Verify OTP and activate account
- **POST** `/api/auth/signin` - Login user
- **POST** `/api/auth/refresh-token` - Refresh access token
- **POST** `/api/auth/resend-otp` - Resend OTP

#### Protected Endpoints (Auth Required)
- **POST** `/api/auth/logout` - Logout user
- **PUT** `/api/auth/language` - Update language preference

### 📱 OTP Management Endpoints
- **POST** `/api/otp/send` - Send OTP to existing user
- **POST** `/api/otp/verify` - Verify OTP for existing user
- **POST** `/api/otp/resend` - Resend OTP to existing user

## 🧪 Testing Workflow

### Step 1: Health Check
1. Select your environment (Production/Staging/Local)
2. Run the **Health Check** request
3. Verify you get a 200 response with API status

### Step 2: Get Configuration Data
1. Run **Get Supported Countries** to see available countries
2. Run **Get Supported Languages** to see available languages
3. Note the country codes and language codes for signup

### Step 3: User Registration Flow
1. **User Signup**
   - Update the request body with your test data
   - Use a real phone number for production testing
   - Set appropriate country code and language preference
   - Send the request

2. **Verify OTP and Activate Account**
   - Check your phone for the OTP code
   - Update the request body with your phone number and OTP
   - Send the request to activate your account

### Step 4: Authentication Flow
1. **User Signin**
   - Use the phone number and password from signup
   - Send the request to get access and refresh tokens

2. **Store Tokens**
   - Copy the `access_token` from the response
   - Copy the `refresh_token` from the response
   - Update the environment variables with these values

### Step 5: Test Protected Endpoints
1. **Update Language Preference**
   - This request will automatically use the stored access token
   - Test changing language between 'en' and 'am'

2. **User Logout**
   - Test the logout functionality
   - This will invalidate the current session

### Step 6: OTP Management Testing
1. **Send OTP** - Test sending OTP to existing users
2. **Verify OTP** - Test OTP verification
3. **Resend OTP** - Test OTP resend functionality

## 🔑 Authentication Flow

### Token Management
The collection uses environment variables to store authentication tokens:

- `access_token`: JWT token for API access
- `refresh_token`: Token for refreshing access token
- `user_id`: User ID for reference
- `phone_number`: Phone number for testing

### Automatic Token Usage
Protected endpoints automatically include the `Authorization` header:
```
Authorization: Bearer {{ _.access_token }}
```

### Token Refresh
When your access token expires:
1. Use the **Refresh Access Token** endpoint
2. Update the environment variables with new tokens
3. Continue testing protected endpoints

## 📝 Request Examples

### User Signup
```json
{
  "phone": "+1234567890",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "countryCode": "US",
  "preferredLanguage": "en"
}
```

### User Signin
```json
{
  "phone": "+1234567890",
  "password": "Password123"
}
```

### Verify OTP
```json
{
  "phoneNumber": "+1234567890",
  "otpCode": "123456"
}
```

### Update Language
```json
{
  "language": "am"
}
```

## 🚨 Important Notes

### Production Testing
- Use real phone numbers for OTP testing
- Be aware of rate limiting on OTP endpoints
- Test with actual user scenarios

### Staging Testing
- Safe to use test phone numbers
- Good for integration testing
- Test all edge cases here

### Local Testing
- Requires local server to be running
- Use `npm run dev` in the backend directory
- Good for development and debugging

### Rate Limiting
- OTP endpoints have rate limiting
- Wait between OTP requests
- Check response headers for rate limit info

## 🔧 Troubleshooting

### Common Issues

#### 1. Connection Errors
- **Problem**: Cannot connect to API
- **Solution**: Check if the server is running and the base URL is correct

#### 2. Authentication Errors
- **Problem**: 401 Unauthorized errors
- **Solution**: Check if access token is valid and not expired

#### 3. OTP Issues
- **Problem**: OTP not received or invalid
- **Solution**: Check phone number format and wait for rate limiting

#### 4. Validation Errors
- **Problem**: 400 Bad Request with validation errors
- **Solution**: Check request body format and required fields

### Debug Tips

1. **Check Response Headers**: Look for rate limiting and CORS headers
2. **Validate JSON**: Ensure request body is valid JSON
3. **Check Environment**: Verify you're using the correct environment
4. **Token Expiry**: Refresh tokens when they expire
5. **Phone Format**: Use international format (+1234567890)

### Environment Variables
Make sure these are set correctly in your environment:
- `base_url`: API base URL
- `access_token`: Current JWT token
- `refresh_token`: Refresh token
- `phone_number`: Test phone number

## 📞 Support

If you encounter issues:
1. Check the API documentation
2. Verify environment configuration
3. Test with the health check endpoint first
4. Check server logs for detailed error information

## 🎯 Best Practices

1. **Start with Health Check**: Always verify API is running
2. **Use Staging First**: Test in staging before production
3. **Store Tokens**: Keep authentication tokens in environment variables
4. **Test Edge Cases**: Try invalid inputs and error scenarios
5. **Monitor Rate Limits**: Be aware of API rate limiting
6. **Clean Up**: Logout and clean up test data when done

---

**Happy Testing! 🚀** 