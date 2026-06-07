import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalErrorHandler } from './global-error-handler.service';
import { ErrorNotificationService } from './error-notification.service';

describe('GlobalErrorHandler', () => {
	let handler: GlobalErrorHandler;
	let notificationService: jasmine.SpyObj<ErrorNotificationService>;
	let router: jasmine.SpyObj<Router>;

	beforeEach(() => {
		const notifSpy = jasmine.createSpyObj('ErrorNotificationService', ['show']);
		const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

		TestBed.configureTestingModule({
			providers: [
				GlobalErrorHandler,
				{ provide: ErrorNotificationService, useValue: notifSpy },
				{ provide: Router, useValue: routerSpy }
			]
		});

		handler = TestBed.inject(GlobalErrorHandler);
		notificationService = TestBed.inject(ErrorNotificationService) as jasmine.SpyObj<ErrorNotificationService>;
		router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
	});

	it('should be created', () => {
		expect(handler).toBeTruthy();
	});

	it('should ignore HttpErrorResponse (handled by interceptor)', () => {
		const httpError = new HttpErrorResponse({ status: 500 });
		handler.handleError(httpError);
		expect(notificationService.show).not.toHaveBeenCalled();
	});

	it('should show toast for runtime Error', () => {
		handler.handleError(new Error('Something broke'));
		expect(notificationService.show).toHaveBeenCalledWith('Something broke', 'error');
	});

	it('should show generic message for non-Error objects', () => {
		handler.handleError('string error');
		expect(notificationService.show).toHaveBeenCalledWith('An unexpected error occurred', 'error');
	});

	it('should handle chunk load errors with reload', () => {
		spyOn(window.location, 'reload');
		const chunkError = new Error('Loading chunk 123 failed');
		handler.handleError(chunkError);
		expect(notificationService.show).toHaveBeenCalledWith('A new version is available. Reloading...', 'info');
	});

	it('should unwrap rejection errors', () => {
		const wrappedError = { rejection: new Error('Promise rejected') };
		handler.handleError(wrappedError);
		expect(notificationService.show).toHaveBeenCalledWith('Promise rejected', 'error');
	});
});
