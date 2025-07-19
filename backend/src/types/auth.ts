export interface User {
  id: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  preferredLanguage: 'en' | 'am';
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface OtpVerificationRequest {
  phoneNumber: string;
  otpCode: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    preferredLanguage: string;
    isVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  id: string;
  phoneNumber: string;
  preferredLanguage: string;
  iat?: number;
  exp?: number;
}

export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export interface LanguageOption {
  code: 'en' | 'am';
  name: string;
  nativeName: string;
  flag: string;
}
