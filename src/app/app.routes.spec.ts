import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { routes } from './app.routes';

describe('App Routes', () => {
	let router: Router;
	let location: Location;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule.withRoutes(routes)]
		});

		router = TestBed.inject(Router);
		location = TestBed.inject(Location);
	});

	it('should have routes defined', () => {
		expect(routes.length).toBeGreaterThan(0);
	});

	it('should redirect empty path to /login', () => {
		const emptyRoute = routes.find(r => r.path === '');
		expect(emptyRoute).toBeTruthy();
		expect(emptyRoute?.redirectTo).toBe('/login');
	});

	it('should have login route', () => {
		const loginRoute = routes.find(r => r.path === 'login');
		expect(loginRoute).toBeTruthy();
	});

	it('should have signup route', () => {
		const signupRoute = routes.find(r => r.path === 'signup');
		expect(signupRoute).toBeTruthy();
	});

	it('should have dashboard route with AuthGuard', () => {
		const dashboardRoute = routes.find(r => r.path === 'dashboard');
		expect(dashboardRoute).toBeTruthy();
		expect(dashboardRoute?.canActivate).toBeTruthy();
	});

	it('should have job-applications route with AuthGuard', () => {
		const route = routes.find(r => r.path === 'job-applications/:jobId');
		expect(route).toBeTruthy();
		expect(route?.canActivate).toBeTruthy();
	});

	it('should redirect legacy routes to dashboard', () => {
		const legacyRoutes = ['hr-dashboard', 'admin-dashboard', 'hr', 'profile', 'job-search', 'applications'];
		legacyRoutes.forEach(path => {
			const route = routes.find(r => r.path === path);
			expect(route?.redirectTo).toBe('/dashboard');
		});
	});

	it('should have error route', () => {
		const errorRoute = routes.find(r => r.path === 'error');
		expect(errorRoute).toBeTruthy();
	});

	it('should have wildcard route redirecting to login', () => {
		const wildcardRoute = routes.find(r => r.path === '**');
		expect(wildcardRoute).toBeTruthy();
		expect(wildcardRoute?.redirectTo).toBe('/login');
	});
});
