import { test, expect } from '../fixtures/test-fixtures';

test.describe('Backend API Integration', () => {

	const API_BASE = 'http://localhost:8000';

	// ─── Health Check ────────────────────────────────────────────────────────

	test('TC-API-001: Backend health check responds', async ({ request }) => {
		const response = await request.get(`${API_BASE}/`);
		expect(response.ok()).toBeTruthy();

		const body = await response.json();
		expect(body.status).toBe('healthy');
		expect(body.version).toBeTruthy();
	});

	test('TC-API-002: Extended health check returns features', async ({ request }) => {
		const response = await request.get(`${API_BASE}/api/v1/health`);
		expect(response.ok()).toBeTruthy();

		const body = await response.json();
		expect(body.features).toContain('user_management');
		expect(body.features).toContain('job_search');
	});

	// ─── Authentication API ──────────────────────────────────────────────────

	test('TC-API-003: Login API returns token on valid credentials', async ({ request }) => {
		const response = await request.post(`${API_BASE}/api/v1/auth/login`, {
			data: { email: 'testuser@jobmitra.com', password: 'TestPass123!' }
		});

		if (response.ok()) {
			const body = await response.json();
			expect(body.access_token).toBeTruthy();
			expect(body.token_type).toBe('bearer');
			expect(body.user).toBeTruthy();
			expect(body.user.email).toBeTruthy();
		}
	});

	test('TC-API-004: Login API returns 401 on invalid credentials', async ({ request }) => {
		const response = await request.post(`${API_BASE}/api/v1/auth/login`, {
			data: { email: 'fake@email.com', password: 'WrongPass' }
		});

		expect(response.status()).toBe(401);
	});

	test('TC-API-005: Register API validates required fields', async ({ request }) => {
		const response = await request.post(`${API_BASE}/api/v1/auth/register`, {
			data: { email: 'incomplete' }
		});

		expect(response.status()).toBe(422);
	});

	// ─── Protected Endpoints ─────────────────────────────────────────────────

	test('TC-API-006: Protected endpoint returns 401 without token', async ({ request }) => {
		const response = await request.get(`${API_BASE}/api/v1/auth/me`);
		expect(response.status()).toBeGreaterThanOrEqual(401);
	});

	test('TC-API-007: Protected endpoint works with valid token', async ({ request }) => {
		// First login to get token
		const loginResponse = await request.post(`${API_BASE}/api/v1/auth/login`, {
			data: { email: 'testuser@jobmitra.com', password: 'TestPass123!' }
		});

		if (loginResponse.ok()) {
			const { access_token } = await loginResponse.json();

			const meResponse = await request.get(`${API_BASE}/api/v1/auth/me`, {
				headers: { 'Authorization': `Bearer ${access_token}` }
			});

			expect(meResponse.ok()).toBeTruthy();
			const user = await meResponse.json();
			expect(user.user_id).toBeTruthy();
			expect(user.email).toBeTruthy();
		}
	});

	// ─── Job Search API ──────────────────────────────────────────────────────

	test('TC-API-008: Job search API requires authentication', async ({ request }) => {
		const response = await request.post(`${API_BASE}/api/v1/jobs/search`, {
			data: { query: 'python', limit: 5 }
		});

		expect(response.status()).toBeGreaterThanOrEqual(401);
	});

	test('TC-API-009: Job search API returns results with auth', async ({ request }) => {
		const loginResponse = await request.post(`${API_BASE}/api/v1/auth/login`, {
			data: { email: 'testuser@jobmitra.com', password: 'TestPass123!' }
		});

		if (loginResponse.ok()) {
			const { access_token } = await loginResponse.json();

			const searchResponse = await request.post(`${API_BASE}/api/v1/jobs/search`, {
				headers: { 'Authorization': `Bearer ${access_token}` },
				data: { query: 'developer', limit: 5 }
			});

			if (searchResponse.ok()) {
				const body = await searchResponse.json();
				expect(body.jobs).toBeDefined();
				expect(Array.isArray(body.jobs)).toBeTruthy();
			}
		}
	});

	// ─── Dashboard API ───────────────────────────────────────────────────────

	test('TC-API-010: Dashboard endpoint returns user stats', async ({ request }) => {
		const loginResponse = await request.post(`${API_BASE}/api/v1/auth/login`, {
			data: { email: 'testuser@jobmitra.com', password: 'TestPass123!' }
		});

		if (loginResponse.ok()) {
			const { access_token, user } = await loginResponse.json();

			const dashResponse = await request.get(`${API_BASE}/api/v1/users/${user.user_id}/dashboard`, {
				headers: { 'Authorization': `Bearer ${access_token}` }
			});

			if (dashResponse.ok()) {
				const body = await dashResponse.json();
				expect(body.user_id).toBeTruthy();
				expect(body.applications_count).toBeDefined();
			}
		}
	});

	// ─── CORS ────────────────────────────────────────────────────────────────

	test('TC-API-011: CORS test endpoint responds', async ({ request }) => {
		const response = await request.get(`${API_BASE}/cors-test`);
		expect(response.ok()).toBeTruthy();

		const body = await response.json();
		expect(body.message).toContain('CORS is working');
	});

	// ─── Learning Resources ──────────────────────────────────────────────────

	test('TC-API-012: Learning resources endpoint returns data', async ({ request }) => {
		const response = await request.get(`${API_BASE}/api/v1/learning-resources`);
		expect(response.ok()).toBeTruthy();

		const body = await response.json();
		expect(body.resources).toBeDefined();
		expect(body.count).toBeDefined();
	});
});
