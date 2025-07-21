import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'tilanet_access_token';
const REFRESH_TOKEN_KEY = 'tilanet_refresh_token';

// Platform-specific storage implementations
const isWeb = Platform.OS === 'web';

const webStorage = {
  setItem: (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getItem: (key: string): Promise<string | null> => {
    try {
      const value = localStorage.getItem(key);
      return Promise.resolve(value);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  removeItem: (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

export const setTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    console.log('Storing tokens:', { accessToken, refreshToken });
    if (isWeb) {
      await webStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      await webStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw new Error('Failed to store authentication tokens');
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = isWeb 
      ? await webStorage.getItem(ACCESS_TOKEN_KEY)
      : await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    console.log('Retrieved access token:', token);
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return isWeb 
      ? await webStorage.getItem(REFRESH_TOKEN_KEY)
      : await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

export const removeTokens = async (): Promise<void> => {
  try {
    if (isWeb) {
      await webStorage.removeItem(ACCESS_TOKEN_KEY);
      await webStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error removing tokens:', error);
  }
};

export const hasTokens = async (): Promise<boolean> => {
  try {
    const accessToken = await getToken();
    return !!accessToken;
  } catch (error) {
    return false;
  }
};
