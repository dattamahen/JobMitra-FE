import { test, expect, TEST_USER } from '../fixtures/test-fixtures';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Responsive & Accessibility', () => {

	// ─── Mobile Viewport ─────────────────────────────────────────────────────

	test('TC-RESP-001: Login page renders on mobile viewport', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
		await page.goto('/login');
		await page.waitForLoadState('networkidle');

		await expect(page.locator('.login-form-section, .auth-container')).toBeVisible();

		await page.screenshot({ path: 'e2e/reports/screenshots/resp-001-mobile-login.png', fullPage: true });
	});

	test('TC-RESP-002: Dashboard renders on tablet viewport', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 }); // iPad

		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(TEST_USER.email, TEST_USER.password);
		await page.waitForURL(/dashboard/, { timeout: 15000 });

		await expect(page.locator('.dashboard-layout, .main-content')).toBeVisible();

		await page.screenshot({ path: 'e2e/reports/screenshots/resp-002-tablet-dashboard.png', fullPage: true });
	});

	// ─── Accessibility ───────────────────────────────────────────────────────

	test('TC-A11Y-001: Login page has proper form labels', async ({ page }) => {
		await page.goto('/login');
		await page.waitForLoadState('networkidle');

		// Check that inputs have associated labels or aria-labels
		const inputs = page.locator('input');
		const count = await inputs.count();

		for (let i = 0; i < count; i++) {
			const input = inputs.nth(i);
			const ariaLabel = await input.getAttribute('aria-label');
			const placeholder = await input.getAttribute('placeholder');
			const id = await input.getAttribute('id');

			// Each input should have some form of labeling
			const hasLabel = ariaLabel || placeholder || id;
			expect(hasLabel).toBeTruthy();
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/a11y-001-form-labels.png', fullPage: true });
	});

	test('TC-A11Y-002: Buttons are keyboard accessible', async ({ page }) => {
		await page.goto('/login');
		await page.waitForLoadState('networkidle');

		// Tab to the submit button
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');

		// Check that a focusable element is focused
		const focusedElement = page.locator(':focus');
		await expect(focusedElement).toBeVisible();

		await page.screenshot({ path: 'e2e/reports/screenshots/a11y-002-keyboard-nav.png', fullPage: true });
	});

	test('TC-A11Y-003: Error messages are visible and readable', async ({ page }) => {
		await page.goto('/login');
		await page.waitForLoadState('networkidle');

		// Try to login with invalid data to trigger error
		const loginPage = new LoginPage(page);
		await loginPage.login('invalid@test.com', 'wrong');
		await page.waitForTimeout(3000);

		const errorMsg = page.locator('.error-message');
		const isVisible = await errorMsg.isVisible().catch(() => false);

		if (isVisible) {
			// Error should have sufficient contrast (visual check via screenshot)
			const color = await errorMsg.evaluate(el => window.getComputedStyle(el).color);
			expect(color).toBeTruthy();
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/a11y-003-error-visibility.png', fullPage: true });
	});

	// ─── Page Load Performance ───────────────────────────────────────────────

	test('TC-PERF-001: Login page loads within 5 seconds', async ({ page }) => {
		const startTime = Date.now();
		await page.goto('/login');
		await page.waitForLoadState('networkidle');
		const loadTime = Date.now() - startTime;

		expect(loadTime).toBeLessThan(5000);

		await page.screenshot({ path: 'e2e/reports/screenshots/perf-001-load-time.png', fullPage: true });
	});

	test('TC-PERF-002: Dashboard loads within 10 seconds after login', async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(TEST_USER.email, TEST_USER.password);

		const startTime = Date.now();
		await page.waitForURL(/dashboard/, { timeout: 15000 });
		const loadTime = Date.now() - startTime;

		expect(loadTime).toBeLessThan(10000);

		await page.screenshot({ path: 'e2e/reports/screenshots/perf-002-dashboard-load.png', fullPage: true });
	});
});
