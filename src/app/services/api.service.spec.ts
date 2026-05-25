import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

describe('ApiService', () => {
	let service: ApiService;
	let httpMock: HttpTestingController;
	const baseUrl = environment.apiUrl || 'http://localhost:8000';
	const apiBaseUrl = `${baseUrl}/api/v1`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [ApiService]
		});

		service = TestBed.inject(ApiService);
		httpMock = TestBed.inject(HttpTestingController);
		localStorage.clear();
	});

	afterEach(() => {
		httpMock.verify();
		localStorage.clear();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	// ─── GET Requests ────────────────────────────────────────────────────────

	describe('GET requests', () => {
		it('should make GET request with correct URL', () => {
			service.get('/health').subscribe(response => {
				expect(response).toBeTruthy();
			});

			const req = httpMock.expectOne(`${apiBaseUrl}/health`);
			expect(req.request.method).toBe('GET');
			req.flush({ status: 'healthy' });
		});

		it('should include auth token in headers when available', () => {
			localStorage.setItem('jobmitra_token', 'test_token');

			service.get('/users/me').subscribe();

			const req = httpMock.expectOne(`${apiBaseUrl}/users/me`);
			expect(req.request.headers.get('Authorization')).toBe('Bearer test_token');
			req.flush({});
		});

		it('should pass query params correctly', () => {
			service.get('/learning-resources', { skill: 'Python', level: 'beginner' }).subscribe();

			const req = httpMock.expectOne(r => r.url.includes('/learning-resources'));
			expect(req.request.params.get('skill')).toBe('Python');
			expect(req.request.params.get('level')).toBe('beginner');
			req.flush({ resources: [] });
		});

		it('should handle /api/v1 prefix in endpoint', () => {
			service.get('/api/v1/health').subscribe();

			const req = httpMock.expectOne(`${baseUrl}/api/v1/health`);
			expect(req.request.method).toBe('GET');
			req.flush({});
		});
	});

	// ─── POST Requests ───────────────────────────────────────────────────────

	describe('POST requests', () => {
		it('should make POST request with JSON body', () => {
			const body = { query: 'test query' };

			service.post('/jobs/search', body).subscribe(response => {
				expect(response).toBeTruthy();
			});

			const req = httpMock.expectOne(`${apiBaseUrl}/jobs/search`);
			expect(req.request.method).toBe('POST');
			expect(req.request.headers.get('Content-Type')).toBe('application/json');
			req.flush({ jobs: [] });
		});

		it('should retry POST request once on failure', () => {
			service.post('/ask', { query: 'test' }).subscribe();

			// First request fails
			const req1 = httpMock.expectOne(`${apiBaseUrl}/ask`);
			req1.flush({}, { status: 500, statusText: 'Server Error' });

			// Retry
			const req2 = httpMock.expectOne(`${apiBaseUrl}/ask`);
			req2.flush({ response: 'answer' });
		});
	});

	// ─── PUT Requests ────────────────────────────────────────────────────────

	describe('PUT requests', () => {
		it('should make PUT request', () => {
			service.put('/users/test_001', { first_name: 'Updated' }).subscribe();

			const req = httpMock.expectOne(`${apiBaseUrl}/users/test_001`);
			expect(req.request.method).toBe('PUT');
			req.flush({ message: 'Updated' });
		});
	});

	// ─── DELETE Requests ─────────────────────────────────────────────────────

	describe('DELETE requests', () => {
		it('should make DELETE request', () => {
			service.delete('/jobs/save/job_001').subscribe();

			const req = httpMock.expectOne(`${apiBaseUrl}/jobs/save/job_001`);
			expect(req.request.method).toBe('DELETE');
			req.flush({ message: 'Deleted' });
		});
	});

	// ─── AI Query ────────────────────────────────────────────────────────────

	describe('askAI', () => {
		it('should call /ask endpoint', () => {
			service.askAI('What is FastAPI?').subscribe(response => {
				expect(response.response).toBe('FastAPI is a framework');
			});

			const req = httpMock.expectOne(`${baseUrl}/ask`);
			expect(req.request.body).toEqual({ query: 'What is FastAPI?' });
			req.flush({ response: 'FastAPI is a framework', timestamp: '2024-01-01' });
		});
	});

	// ─── Health Check ────────────────────────────────────────────────────────

	describe('healthCheck', () => {
		it('should call root health endpoint', () => {
			service.healthCheck().subscribe(response => {
				expect(response.status).toBe('healthy');
			});

			const req = httpMock.expectOne(`${baseUrl}/`);
			req.flush({ status: 'healthy', version: '1.0.0' });
		});
	});

	// ─── Error Handling ──────────────────────────────────────────────────────

	describe('error handling', () => {
		it('should handle server connection error', () => {
			service.get('/health').subscribe({
				error: (error) => {
					expect(error.message).toContain('Cannot connect to server');
				}
			});

			const req = httpMock.expectOne(`${apiBaseUrl}/health`);
			req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
		});

		it('should handle 404 error', () => {
			service.get('/nonexistent').subscribe({
				error: (error) => {
					expect(error).toBeTruthy();
				}
			});

			const req = httpMock.expectOne(`${apiBaseUrl}/nonexistent`);
			req.flush({ detail: 'Not found' }, { status: 404, statusText: 'Not Found' });
		});

		it('should handle 500 error with detail message', () => {
			service.get('/broken').subscribe({
				error: (error) => {
					expect(error.message).toContain('Internal error');
				}
			});

			const req = httpMock.expectOne(`${apiBaseUrl}/broken`);
			req.flush({ detail: 'Internal error' }, { status: 500, statusText: 'Server Error' });
		});
	});
});
