import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponse, User, AuthState } from '../types/auth';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export class AuthService {
  // Login user (bypass API for now)
  static async login(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string; data?: LoginResponse }> {
    try {
      // For now, allow any login without API call
      // TODO: Implement real API call when backend is ready

      // Simulate successful login
      const mockUser: User = {
        full_name: identifier === 'sewunet' ? 'Sewunet Abebaw' : 'Demo User',
        user: identifier === 'sewunet' ? 'sewunet.abebaw@gubatech.com' : `${identifier}@demo.com`,
        employee_id: identifier === 'sewunet' ? 'HR-EMP-00016' : 'HR-EMP-00001',
        gender: 'Male',
        key_details: {
          api_secret: 'mock_api_secret',
          api_key: 'mock_api_key',
        },
      };

      // Store mock token and user data
      await this.storeAuthData('mock_token_' + Date.now(), mockUser);

      const mockResponse: LoginResponse = {
        message: 'Logged In',
        home_page: '/app',
        full_name: mockUser.full_name,
        user: mockUser.user,
        key_details: mockUser.key_details,
        employee_id: mockUser.employee_id,
        gender: mockUser.gender,
        data: [],
      };

      return { success: true, data: mockResponse };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
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
