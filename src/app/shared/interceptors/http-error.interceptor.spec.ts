import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { httpErrorInterceptor } from './http-error.interceptor';
import { ErrorNotificationService } from '../../services/error-notification.service';
import { AuthService } from '../../services/auth.service';

describe('httpErrorInterceptor', () => {
	let httpClient: HttpClient;
	let httpMock: HttpTestingController;
	let notificationService: jasmine.SpyObj<ErrorNotificationService>;
	let authService: jasmine.SpyObj<AuthService>;
	let router: jasmine.SpyObj<Router>;

	beforeEach(() => {
		const notifSpy = jasmine.createSpyObj('ErrorNotificationService', ['show']);
		const authSpy = jasmine.createSpyObj('AuthService', ['clearAllAuthData']);
		const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(withInterceptors([httpErrorInterceptor])),
				provideHttpClientTesting(),
				{ provide: ErrorNotificationService, useValue: notifSpy },
				{ provide: AuthService, useValue: authSpy },
				{ provide: Router, useValue: routerSpy }
			]
		});

		httpClient = TestBed.inject(HttpClient);
		httpMock = TestBed.inject(HttpTestingController);
		notificationService = TestBed.inject(ErrorNotificationService) as jasmine.SpyObj<ErrorNotificationService>;
		authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
		router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should show warning on network error (status 0)', () => {
		httpClient.get('/api/v1/test').subscribe({ error: () => {} });
		const req = httpMock.expectOne('/api/v1/test');
		req.error(new ProgressEvent('error'), { status: 0 });

		expect(notificationService.show).toHaveBeenCalledWith(
			'Unable to connect to server. Check your network.', 'warning'
		);
	});

	it('should show error on 500', () => {
		httpClient.get('/api/v1/test').subscribe({ error: () => {} });
		const req = httpMock.expectOne('/api/v1/test');
		req.flush(null, { status: 500, statusText: 'Server Error' });

		expect(notificationService.show).toHaveBeenCalledWith(
			'Server error. Please try again later.', 'error'
		);
	});

	it('should show warning on 403', () => {
		httpClient.get('/api/v1/test').subscribe({ error: () => {} });
		const req = httpMock.expectOne('/api/v1/test');
		req.flush(null, { status: 403, statusText: 'Forbidden' });

		expect(notificationService.show).toHaveBeenCalledWith(
			'You do not have permission to perform this action.', 'warning'
		);
	});

	it('should show warning on 429', () => {
		httpClient.get('/api/v1/test').subscribe({ error: () => {} });
		const req = httpMock.expectOne('/api/v1/test');
		req.flush(null, { status: 429, statusText: 'Too Many Requests' });

		expect(notificationService.show).toHaveBeenCalledWith(
			'Too many requests. Please slow down.', 'warning'
		);
	});

	it('should skip toast for auth endpoints', () => {
		httpClient.post('/api/v1/auth/login', {}).subscribe({ error: () => {} });
		const req = httpMock.expectOne('/api/v1/auth/login');
		req.flush(null, { status: 401, statusText: 'Unauthorized' });

		expect(notificationService.show).not.toHaveBeenCalled();
	});

	it('should not show toast for 404 on non-auth endpoints', () => {
		httpClient.get('/api/v1/users/123').subscribe({ error: () => {} });
		const req = httpMock.expectOne('/api/v1/users/123');
		req.flush(null, { status: 404, statusText: 'Not Found' });

		// 404 is not handled in the interceptor (no case for it)
		expect(notificationService.show).not.toHaveBeenCalled();
	});
});
