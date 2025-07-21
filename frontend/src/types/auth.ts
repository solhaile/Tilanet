export interface User {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  preferredLanguage: 'en' | 'am';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  preferredLanguage: 'en' | 'am';
}

export interface OtpVerificationRequest {
  phoneNumber: string;
  otpCode: string;
}

export interface ResendOtpRequest {
  phoneNumber: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    requiresVerification?: boolean;
  };
}

export interface OtpResponse {
  success: boolean;
  message: string;
}

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export interface Language {
  code: 'en' | 'am';
  name: string;
  nativeName: string;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
}
