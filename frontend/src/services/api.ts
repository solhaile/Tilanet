import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { getToken, setTokens, removeTokens } from './storage';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Add logging utility
const log = (message: string, data?: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message, data);
  } else {
    // Integrate with remote logging service (e.g., Sentry, LogRocket)
  }
};

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use your deployed backend URL with fallback
    this.baseURL = API_BASE_URL;
    console.log('API Base URL:', this.baseURL);
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, remove tokens and redirect to login
          await removeTokens();
          // You can emit an event here to force logout in the app
        }
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      log('Attempting login', { phone: credentials.phone });
      log('Making request to:', `${this.baseURL}/auth/signin`);
      
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/signin', credentials);
      log('Login response received:', response.data);
      log('Response status:', response.status);
      log('Response headers:', response.headers);
      
      if (response.data.success) {
        // For now, we'll handle token storage differently
        // The backend might return tokens in headers or a different structure
        console.log('Login successful, but no token in response data');
      }
      
      return response.data;
    } catch (error: any) {
      log('Login failed', error);
      if (error.response) {
        log('Error response data:', error.response.data);
        log('Error response status:', error.response.status);
      }
      throw this.handleError(error);
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      log('Attempting registration', { phone: userData.phone });
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/signup', userData);
      log('Registration successful', response.data);
      
      if (response.data.success) {
        // For now, we'll handle token storage differently
        // The backend might return tokens in headers or a different structure
        console.log('Registration successful, but no token in response data');
      }
      
      return response.data;
    } catch (error: any) {
      log('Registration failed', error);
      if (error.response) {
        log('Error response data:', error.response.data);
        log('Error response status:', error.response.status);
        log('Error response headers:', error.response.headers);
      }
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if it exists
      await this.api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails, remove local tokens
      console.warn('Logout API call failed:', error);
    } finally {
      await removeTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<{ success: boolean; data: User }> = await this.api.get('/auth/me');
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export const apiService = new ApiService();
