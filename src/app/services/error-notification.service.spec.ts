import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ErrorNotificationService } from './error-notification.service';

describe('ErrorNotificationService', () => {
	let service: ErrorNotificationService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ErrorNotificationService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should start with empty notifications', () => {
		expect(service.notifications()).toEqual([]);
	});

	it('should add a notification on show()', () => {
		service.show('Test error', 'error');
		expect(service.notifications().length).toBe(1);
		expect(service.notifications()[0].message).toBe('Test error');
		expect(service.notifications()[0].severity).toBe('error');
	});

	it('should add multiple notifications', () => {
		service.show('Error 1', 'error');
		service.show('Warning 1', 'warning');
		service.show('Info 1', 'info');
		expect(service.notifications().length).toBe(3);
	});

	it('should dismiss a notification by id', () => {
		service.show('Test', 'error');
		const id = service.notifications()[0].id;
		service.dismiss(id);
		expect(service.notifications().length).toBe(0);
	});

	it('should auto-dismiss after 5 seconds', fakeAsync(() => {
		service.show('Auto dismiss', 'error');
		expect(service.notifications().length).toBe(1);
		tick(5000);
		expect(service.notifications().length).toBe(0);
	}));

	it('should default severity to error', () => {
		service.show('Default severity');
		expect(service.notifications()[0].severity).toBe('error');
	});
});
