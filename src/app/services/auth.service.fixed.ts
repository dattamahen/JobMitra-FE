import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials extends LoginCredentials {
	username: string;
	first_name: string;
	last_name: string;
	phone: string;
	city: string;
	state: string;
}

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

export interface LoginResponse {
	access_token: string;
	token_type: string;
	user: User;
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private readonly API_URL = 'http://localhost:8000/api/v1/auth';
	private readonly TOKEN_KEY = 'access_token';
	private readonly USER_KEY = 'user';

	private currentUserSubject = new BehaviorSubject<User | null>(null);
	public currentUser$ = this.currentUserSubject.asObservable();

	private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
	public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

	constructor(
		private http: HttpClient,
		private router: Router
	) {
		this.initializeAuthState();
	}

	/**
	* Check if we're running in browser environment
	*/
	private isBrowser(): boolean {
		return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
	}

	/**
	* Initialize authentication state from localStorage
	*/
	private initializeAuthState(): void {
		if (this.isBrowser()) {
			const token = localStorage.getItem(this.TOKEN_KEY);
			const userStr = localStorage.getItem(this.USER_KEY);
			
			if (token && userStr) {
				try {
					const user = JSON.parse(userStr);
					this.currentUserSubject.next(user);
					this.isAuthenticatedSubject.next(true);
				} catch (error) {
					console.error('Error parsing stored user data:', error);
					this.clearAuthData();
				}
			}
		}
	}

	/**
	* Login user with credentials
	*/
	login(credentials: LoginCredentials): Observable<LoginResponse> {
		return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
			.pipe(
				tap(response => {
					if (this.isBrowser()) {
						localStorage.setItem(this.TOKEN_KEY, response.access_token);
						localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
					}
					this.currentUserSubject.next(response.user);
					this.isAuthenticatedSubject.next(true);
				}),
				catchError(error => {
					console.error('Login error:', error);
					return throwError(() => error);
				})
			);
	}

	/**
	* Register new user
	*/
	register(credentials: RegisterCredentials): Observable<User> {
		return this.http.post<User>(`${this.API_URL}/register`, credentials)
			.pipe(
				catchError(error => {
					console.error('Registration error:', error);
					return throwError(() => error);
				})
			);
	}

	/**
	* Logout current user
	*/
	logout(): Observable<any> {
		// Call backend logout endpoint
		return this.http.post(`${this.API_URL}/logout`, {})
			.pipe(
				tap(() => {
					this.clearAuthData();
					this.router.navigate(['/login']);
				}),
				catchError(error => {
					// Even if backend call fails, still clear local data
					console.error('Logout error:', error);
					this.clearAuthData();
					this.router.navigate(['/login']);
					return of({ message: 'Logged out locally' });
				})
			);
	}

	/**
	* Clear authentication data
	*/
	private clearAuthData(): void {
		if (this.isBrowser()) {
			localStorage.removeItem(this.TOKEN_KEY);
			localStorage.removeItem(this.USER_KEY);
		}
		this.currentUserSubject.next(null);
		this.isAuthenticatedSubject.next(false);
	}

	/**
	* Get current access token
	*/
	getToken(): string | null {
		if (this.isBrowser()) {
			return localStorage.getItem(this.TOKEN_KEY);
		}
		return null;
	}

	/**
	* Get current user
	*/
	getCurrentUser(): User | null {
		return this.currentUserSubject.value;
	}

	/**
	* Check if user is authenticated
	*/
	isAuthenticated(): boolean {
		return this.isAuthenticatedSubject.value;
	}

	/**
	* Get user profile from backend
	*/
	getProfile(): Observable<User> {
		return this.http.get<User>(`${this.API_URL}/me`)
			.pipe(
				tap(user => {
					if (this.isBrowser()) {
						localStorage.setItem(this.USER_KEY, JSON.stringify(user));
					}
					this.currentUserSubject.next(user);
				}),
				catchError(error => {
					console.error('Get profile error:', error);
					if (error.status === 401) {
						this.clearAuthData();
					}
					return throwError(() => error);
				})
			);
	}

	/**
	* Update user profile
	*/
	updateProfile(profileData: Partial<User>): Observable<User> {
		return this.http.put<User>(`${this.API_URL}/profile`, profileData)
			.pipe(
				tap(user => {
					if (this.isBrowser()) {
						localStorage.setItem(this.USER_KEY, JSON.stringify(user));
					}
					this.currentUserSubject.next(user);
				}),
				catchError(error => {
					console.error('Update profile error:', error);
					return throwError(() => error);
				})
			);
	}

	/**
	* Change password
	*/
	changePassword(currentPassword: string, newPassword: string): Observable<any> {
		const data = {
			current_password: currentPassword,
			new_password: newPassword
		};
		
		return this.http.post(`${this.API_URL}/change-password`, data)
			.pipe(
				catchError(error => {
					console.error('Change password error:', error);
					return throwError(() => error);
				})
			);
	}
}
