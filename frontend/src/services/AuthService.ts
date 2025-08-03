export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer' | 'compliance_officer';
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

class AuthService {
  private baseUrl = '/api/auth';
  private tokenKey = 'codesentinel_token';
  private refreshTokenKey = 'codesentinel_refresh_token';
  private userKey = 'codesentinel_user';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const loginResponse: LoginResponse = await response.json();
      
      // Store tokens and user info
      this.setToken(loginResponse.token);
      this.setRefreshToken(loginResponse.refreshToken);
      this.setUser(loginResponse.user);

      return loginResponse;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local storage
      this.clearTokens();
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { token, refreshToken: newRefreshToken } = await response.json();
      
      this.setToken(token);
      this.setRefreshToken(newRefreshToken);

      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          await this.refreshToken();
          return this.getCurrentUser();
        }
        throw new Error('Failed to get current user');
      }

      const user: User = await response.json();
      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.clearTokens();
      return null;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${this.baseUrl}/change-password`, {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/forgot-password`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset request failed');
      }
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  // User management
  getUser(): User | null {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Auth state
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // HTTP interceptor helper
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    const headers = {
      ...options.headers,
      ...(token && { 'authorization': `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401 && token) {
      try {
        await this.refreshToken();
        // Retry request with new token
        const newToken = this.getToken();
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'authorization': `Bearer ${newToken}`,
          },
        });
      } catch (refreshError) {
        this.clearTokens();
        throw new Error('Authentication failed');
      }
    }

    return response;
  }

  // Role-based access control
  hasPermission(requiredRole: User['role']): boolean {
    const user = this.getUser();
    if (!user) {return false;}

    const roleHierarchy: Record<User['role'], number> = {
      'viewer': 1,
      'developer': 2,
      'compliance_officer': 3,
      'admin': 4,
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }

  canManageTeam(): boolean {
    return this.hasPermission('admin');
  }

  canRunScans(): boolean {
    return this.hasPermission('developer');
  }

  canViewReports(): boolean {
    return this.hasPermission('viewer');
  }
}

export const authService = new AuthService();
