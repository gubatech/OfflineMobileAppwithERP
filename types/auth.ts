export interface LoginRequest {
  identifier: string;
  passwordm: string;
}

export interface User {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  user_name: string;
  emailm: string;
  doctype: string;
}

export interface LoginResponse {
  message: {
    status: string;
    message: string;
    token: string;
    user: User;
  };
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

