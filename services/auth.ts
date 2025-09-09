import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRequest, LoginResponse, User, AuthState } from '../types/auth';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const API_BASE_URL =
  'https://tourism.ettelerp.com/api/method/scope.mfun.doctype.dfun.dfun.login_dfun';

export class AuthService {
  // Login user
  static async login(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string; data?: LoginResponse }> {
    try {
      const payload: LoginRequest = {
        identifier,
        passwordm: password,
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data: LoginResponse = await response.json();

      if (data.message.status === 'success') {
        // Store token and user data
        await this.storeAuthData(data.message.token, data.message.user);
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.message.message || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Store authentication data
  static async storeAuthData(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  }

  // Get stored token
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Get stored user data
  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return token !== null;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }

  // Get current auth state
  static async getAuthState(): Promise<AuthState> {
    try {
      const token = await this.getToken();
      const user = await this.getUser();

      return {
        isAuthenticated: token !== null,
        token,
        user,
        isLoading: false,
      };
    } catch (error) {
      console.error('Error getting auth state:', error);
      return {
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false,
      };
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  // Validate token (optional - for future use)
  static async validateToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // You could make an API call here to validate the token
      // For now, we'll just check if it exists
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
}
