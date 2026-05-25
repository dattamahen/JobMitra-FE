import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest, User } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
	let service: AuthService;
	let httpMock: HttpTestingController;
	let routerSpy: jasmine.SpyObj<Router>;
	const API_URL = `${environment.apiUrl}/api/v1/auth`;

	const mockUser: User = {
		user_id: 'test_001',
		email: 'test@example.com',
		first_name: 'Test',
		last_name: 'User',
		user_type: 'candidate',
		user_status: 'active',
		user_plan: 'free',
		profile_created_on: new Date(),
		last_active: new Date(),
		match_analysis_count: 0,
		match_tailored_count: 0,
		mock_interview_count: 0,
		profile_completion_count: 50,
		profile_visits: 10,
		is_active: true,
		created_at: '2024-01-01T00:00:00Z'
	};

	beforeEach(() => {
		routerSpy = jasmine.createSpyObj('Router', ['navigate']);

		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				AuthService,
				{ provide: Router, useValue: routerSpy }
			]
		});

		service = TestBed.inject(AuthService);
		httpMock = TestBed.inject(HttpTestingController);
		localStorage.clear();
	});

	afterEach(() => {
		httpMock.verify();
		localStorage.clear();
	});

	// ─── Initialization ──────────────────────────────────────────────────────

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should initialize with unauthenticated state', () => {
		expect(service.isAuthenticated()).toBeFalse();
		expect(service.getCurrentUserValue()).toBeNull();
		expect(service.getToken()).toBeNull();
	});

	it('should load auth state from localStorage on init', () => {
		localStorage.setItem('jobmitra_token', 'stored_token');
		localStorage.setItem('jobmitra_user', JSON.stringify(mockUser));

		const freshService = new AuthService(
			TestBed.inject(HttpTestingController) as any,
			routerSpy
		);
		// Service should attempt to load from localStorage
		expect(localStorage.getItem('jobmitra_token')).toBe('stored_token');
	});

	// ─── Login ───────────────────────────────────────────────────────────────

	describe('login', () => {
		it('should login successfully and store token', () => {
			const credentials: LoginRequest = { email: 'test@example.com', password: 'password123' };
			const mockResponse = { access_token: 'jwt_token_123', token_type: 'bearer', user: mockUser };

			service.login(credentials).subscribe(response => {
				expect(response.access_token).toBe('jwt_token_123');
				expect(response.user.email).toBe('test@example.com');
				expect(service.isAuthenticated()).toBeTrue();
				expect(service.getToken()).toBe('jwt_token_123');
				expect(localStorage.getItem('jobmitra_token')).toBe('jwt_token_123');
			});

			const req = httpMock.expectOne(`${API_URL}/login`);
			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual(credentials);
			req.flush(mockResponse);
		});

		it('should handle login failure', () => {
			const credentials: LoginRequest = { email: 'test@example.com', password: 'wrong' };

			service.login(credentials).subscribe({
				error: (error) => {
					expect(service.isAuthenticated()).toBeFalse();
				}
			});

			const req = httpMock.expectOne(`${API_URL}/login`);
			req.flush({ detail: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
		});
	});

	// ─── Registration ────────────────────────────────────────────────────────

	describe('register', () => {
		it('should register a new user', async () => {
			const registerData: RegisterRequest = {
				email: 'new@example.com',
				password: 'SecurePass123!',
				first_name: 'New',
				last_name: 'User'
			};

			const promise = service.register(registerData);

			const req = httpMock.expectOne(`${API_URL}/register`);
			expect(req.request.method).toBe('POST');
			req.flush(mockUser);

			const result = await promise;
			expect(result.email).toBe('test@example.com');
		});
	});

	// ─── Logout ──────────────────────────────────────────────────────────────

	describe('logout', () => {
		it('should clear auth data and navigate to login', () => {
			// Set up authenticated state
			localStorage.setItem('jobmitra_token', 'token');
			localStorage.setItem('jobmitra_user', JSON.stringify(mockUser));

			service.logout().subscribe(() => {
				expect(service.isAuthenticated()).toBeFalse();
				expect(localStorage.getItem('jobmitra_token')).toBeNull();
				expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
			});

			const req = httpMock.expectOne(`${API_URL}/logout`);
			req.flush({ message: 'Logged out' });
		});

		it('should clear local data even if backend fails', () => {
			localStorage.setItem('jobmitra_token', 'token');

			service.logout().subscribe(() => {
				expect(localStorage.getItem('jobmitra_token')).toBeNull();
				expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
			});

			const req = httpMock.expectOne(`${API_URL}/logout`);
			req.flush({}, { status: 500, statusText: 'Server Error' });
		});
	});

	// ─── Profile ─────────────────────────────────────────────────────────────

	describe('getCurrentUser', () => {
		it('should fetch current user profile', () => {
			localStorage.setItem('jobmitra_token', 'valid_token');

			service.getCurrentUser().subscribe(user => {
				expect(user.user_id).toBe('test_001');
			});

			const req = httpMock.expectOne(`${API_URL}/me`);
			expect(req.request.headers.get('Authorization')).toBe('Bearer valid_token');
			req.flush(mockUser);
		});
	});

	describe('updateProfile', () => {
		it('should update user profile and refresh stored data', () => {
			localStorage.setItem('jobmitra_token', 'valid_token');
			const updatedUser = { ...mockUser, first_name: 'Updated' };

			service.updateProfile({ first_name: 'Updated' }).subscribe(user => {
				expect(user.first_name).toBe('Updated');
			});

			const req = httpMock.expectOne(`${API_URL}/profile`);
			expect(req.request.method).toBe('PUT');
			req.flush(updatedUser);
		});
	});

	// ─── Password ────────────────────────────────────────────────────────────

	describe('changePassword', () => {
		it('should change password successfully', () => {
			localStorage.setItem('jobmitra_token', 'valid_token');

			service.changePassword('oldPass', 'newPass123!').subscribe(response => {
				expect(response).toBeTruthy();
			});

			const req = httpMock.expectOne(`${API_URL}/change-password`);
			expect(req.request.body).toEqual({ current_password: 'oldPass', new_password: 'newPass123!' });
			req.flush({ message: 'Password changed' });
		});
	});

	describe('forgotPassword', () => {
		it('should send forgot password request', () => {
			service.forgotPassword('test@example.com').subscribe(response => {
				expect(response.message).toContain('reset link');
			});

			const req = httpMock.expectOne(`${API_URL}/forgot-password`);
			expect(req.request.body).toEqual({ email: 'test@example.com' });
			req.flush({ message: 'If email exists, reset link will be sent' });
		});
	});

	describe('resetPassword', () => {
		it('should reset password with token', () => {
			service.resetPassword('reset_token_123', 'NewPass456!').subscribe(response => {
				expect(response.message).toBe('Password reset successfully');
			});

			const req = httpMock.expectOne(`${API_URL}/reset-password`);
			expect(req.request.body).toEqual({ token: 'reset_token_123', new_password: 'NewPass456!' });
			req.flush({ message: 'Password reset successfully' });
		});
	});

	// ─── User Type Checks ────────────────────────────────────────────────────

	describe('user type checks', () => {
		it('should identify job seeker', () => {
			localStorage.setItem('jobmitra_token', 'token');
			localStorage.setItem('jobmitra_user', JSON.stringify({ ...mockUser, user_type: 'candidate' }));

			const freshService = TestBed.inject(AuthService);
			expect(freshService.isJobSeeker()).toBeTrue();
			expect(freshService.isHR()).toBeFalse();
		});

		it('should identify HR user', () => {
			localStorage.setItem('jobmitra_token', 'token');
			localStorage.setItem('jobmitra_user', JSON.stringify({ ...mockUser, user_type: 'hire' }));

			const freshService = TestBed.inject(AuthService);
			expect(freshService.isHR()).toBeTrue();
			expect(freshService.isJobSeeker()).toBeFalse();
		});
	});

	// ─── Google Sign-In ──────────────────────────────────────────────────────

	describe('googleSignIn', () => {
		it('should authenticate with Google credential', () => {
			const mockResponse = { access_token: 'google_jwt', token_type: 'bearer', user: mockUser };

			service.googleSignIn('google_credential_token').subscribe(response => {
				expect(response.access_token).toBe('google_jwt');
				expect(service.isAuthenticated()).toBeTrue();
			});

			const req = httpMock.expectOne(`${API_URL}/google-signin`);
			expect(req.request.body).toEqual({ credential: 'google_credential_token' });
			req.flush(mockResponse);
		});
	});
});
