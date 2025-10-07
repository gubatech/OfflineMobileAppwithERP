export interface LoginRequest {
  usr: string;
  pwd: string;
}

export interface KeyDetails {
  api_secret: string;
  api_key: string;
}

export interface User {
  full_name: string;
  user: string;
  employee_id: string;
  gender: string;
  key_details: KeyDetails;
}

export interface LoginResponse {
  message: string;
  home_page: string;
  full_name: string;
  user: string;
  key_details: KeyDetails;
  employee_id: string;
  gender: string;
  data: any[];
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}
