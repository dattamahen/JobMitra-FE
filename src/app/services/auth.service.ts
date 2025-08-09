import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Interfaces for authentication
export interface User {
  user_id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  state: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  state: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8000/api/v1/auth';
  private readonly TOKEN_KEY = 'jobmitra_token';
  private readonly USER_KEY = 'jobmitra_user';

  // BehaviorSubject to track authentication state
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check for existing token and user on service initialization
    // Only in browser environment
    if (this.isBrowser()) {
      this.loadAuthState();
    }
  }

  /**
   * Check if running in browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Load authentication state from localStorage
   */
  private loadAuthState(): void {
    if (!this.isBrowser()) {
      return;
    }
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        this.authStateSubject.next({
          isAuthenticated: true,
          user: user,
          token: token
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Register a new user
   */
  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        map(response => {
          // Store token and user data only in browser
          if (this.isBrowser()) {
            localStorage.setItem(this.TOKEN_KEY, response.access_token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          }
          
          // Update auth state
          this.authStateSubject.next({
            isAuthenticated: true,
            user: response.user,
            token: response.access_token
          });
          
          return response;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Logout current user
   */
  logout(): void {
    this.clearAuthData();
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/profile`, profileData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(user => {
        // Update stored user data only in browser
        if (this.isBrowser()) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        
        // Update auth state
        const currentState = this.authStateSubject.value;
        this.authStateSubject.next({
          ...currentState,
          user: user
        });
        
        return user;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Change user password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const passwordData = {
      current_password: currentPassword,
      new_password: newPassword
    };
    
    return this.http.post(`${this.API_URL}/change-password`, passwordData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Seed users (development only)
   */
  seedUsers(): Observable<any> {
    return this.http.post(`${this.API_URL}/seed-users`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get all users (admin endpoint)
   */
  getAllUsers(): Observable<{users: User[], count: number}> {
    return this.http.get<{users: User[], count: number}>(`${this.API_URL}/users`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get authentication headers with token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authStateSubject.value.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any) {
    console.error('Auth service error:', error);
    
    // If unauthorized, clear auth data
    if (error.status === 401) {
      // Clear auth data but don't emit state change to avoid infinite loops
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
      }
    }
    
    return throwError(() => error);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUserValue(): User | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.authStateSubject.value.token;
  }
}
