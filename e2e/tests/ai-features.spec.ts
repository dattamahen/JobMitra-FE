import { test, expect } from '@playwright/test';

test.describe('Global Error Handling', () => {
	test('should show toast on network error and not crash', async ({ page }) => {
		// Block API calls to simulate network failure
		await page.route('**/api/v1/**', route => route.abort());
		await page.goto('/dashboard');

		// Should show a toast notification
		const toast = page.locator('.toast, ion-toast');
		await expect(toast.first()).toBeVisible({ timeout: 5000 });
	});

	test('should redirect to login on 401', async ({ page }) => {
		// Mock 401 response
		await page.route('**/api/v1/**', route =>
			route.fulfill({ status: 401, body: JSON.stringify({ detail: 'Unauthorized' }) })
		);

		await page.goto('/dashboard');
		await page.waitForURL('**/login', { timeout: 5000 });
		expect(page.url()).toContain('/login');
	});

	test('should show error toast on 500', async ({ page }) => {
		await page.route('**/api/v1/auth/me', route =>
			route.fulfill({ status: 500, body: JSON.stringify({ detail: 'Server error' }) })
		);

		// Set fake auth token to bypass guard
		await page.evaluate(() => {
			localStorage.setItem('jobmitra_token', 'fake-token');
			localStorage.setItem('jobmitra_user', JSON.stringify({ user_id: 'test', email: 'test@test.com', user_type: 'candidate' }));
		});

		await page.goto('/dashboard');
		const toast = page.locator('.toast--error');
		await expect(toast.first()).toBeVisible({ timeout: 5000 });
	});
});

test.describe('Profile - AI Content Generation', () => {
	test.beforeEach(async ({ page }) => {
		// Mock auth
		await page.evaluate(() => {
			localStorage.setItem('jobmitra_token', 'fake-token');
			localStorage.setItem('jobmitra_user', JSON.stringify({
				user_id: 'test_user',
				email: 'test@test.com',
				first_name: 'Test',
				last_name: 'User',
				user_type: 'candidate'
			}));
		});

		// Mock profile API
		await page.route('**/api/v1/auth/me', route =>
			route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					user_id: 'test_user',
					email: 'test@test.com',
					first_name: 'Test',
					last_name: 'User',
					current_role: 'Software Engineer',
					skills: ['Python', 'React'],
					overall_experience_years: 3,
					professional_summary: '',
					work_experience: [{ company: 'Corp', position: 'Dev', description: '' }]
				})
			})
		);
	});

	test('should show Generate Summary with AI button', async ({ page }) => {
		await page.goto('/dashboard/profile');
		const aiButton = page.locator('button', { hasText: 'Generate Summary with AI' });
		await expect(aiButton).toBeVisible({ timeout: 10000 });
	});

	test('should generate professional summary on click', async ({ page }) => {
		// Mock AI endpoint
		await page.route('**/api/v1/profile/generate-ai-content', route =>
			route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ content: 'Generated professional summary for testing purposes.' })
			})
		);

		await page.goto('/dashboard/profile');
		const aiButton = page.locator('button', { hasText: 'Generate Summary with AI' });
		await aiButton.click();

		// Should populate the textarea
		const textarea = page.locator('textarea[formcontrolname="professional_summary"], textarea[ng-reflect-name="professional_summary"]');
		await expect(textarea).toHaveValue('Generated professional summary for testing purposes.', { timeout: 5000 });
	});

	test('should show Generate Roles and Responsibilities button for experience', async ({ page }) => {
		await page.goto('/dashboard/profile');
		const aiButton = page.locator('button', { hasText: /Generate Roles.*AI/ });
		await expect(aiButton).toBeVisible({ timeout: 10000 });
	});

	test('should show error toast when AI generation fails', async ({ page }) => {
		await page.route('**/api/v1/profile/generate-ai-content', route =>
			route.fulfill({ status: 500, body: JSON.stringify({ detail: 'LLM unavailable' }) })
		);

		await page.goto('/dashboard/profile');
		const aiButton = page.locator('button', { hasText: 'Generate Summary with AI' });
		await aiButton.click();

		// Should show error notification
		const toast = page.locator('.toast--error, [class*="error-snackbar"]');
		await expect(toast.first()).toBeVisible({ timeout: 5000 });
	});
});

test.describe('Login Page', () => {
	test('should display login page with brand styling', async ({ page }) => {
		await page.goto('/login');
		await expect(page.locator('.app-info-section')).toBeVisible();
		await expect(page.locator('.login-form-section')).toBeVisible();
	});

	test('should have Google Sign-In button', async ({ page }) => {
		await page.goto('/login');
		const googleBtn = page.locator('#google-signin-button');
		await expect(googleBtn).toBeVisible({ timeout: 5000 });
	});

	test('should show signup toggle', async ({ page }) => {
		await page.goto('/login');
		const toggleLink = page.locator('.toggle-link', { hasText: 'Create account' });
		await expect(toggleLink).toBeVisible();
		await toggleLink.click();

		// Should show signup form
		const signupBtn = page.locator('button', { hasText: 'Create Account' });
		await expect(signupBtn).toBeVisible();
	});
});
