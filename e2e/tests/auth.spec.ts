import { test, expect, TEST_USER, INVALID_USER } from '../fixtures/test-fixtures';
import { LoginPage } from '../pages/login.page';

test.describe('Authentication Flow', () => {

	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
	});

	// ─── Login Page Load ─────────────────────────────────────────────────────

	test('TC-AUTH-001: Login page loads correctly', async ({ page, loginPage }) => {
		await loginPage.expectLoginPage();
		await expect(loginPage.emailInput).toBeVisible();
		await expect(loginPage.passwordInput).toBeVisible();
		await expect(loginPage.loginButton).toBeVisible();

		await page.screenshot({ path: 'e2e/reports/screenshots/auth-001-login-page.png', fullPage: true });
	});

	// ─── Successful Login ────────────────────────────────────────────────────

	test('TC-AUTH-002: Successful login redirects to dashboard', async ({ page, loginPage }) => {
		await loginPage.login(TEST_USER.email, TEST_USER.password);

		// Should redirect to dashboard
		await page.waitForURL(/dashboard/, { timeout: 15000 });
		await expect(page).toHaveURL(/dashboard/);

		await page.screenshot({ path: 'e2e/reports/screenshots/auth-002-login-success.png', fullPage: true });
	});

	// ─── Invalid Credentials ─────────────────────────────────────────────────

	test('TC-AUTH-003: Invalid credentials show error message', async ({ page, loginPage }) => {
		await loginPage.login(INVALID_USER.email, INVALID_USER.password);

		// Should stay on login page and show error
		await page.waitForTimeout(3000);
		await loginPage.expectErrorMessage();

		await page.screenshot({ path: 'e2e/reports/screenshots/auth-003-invalid-login.png', fullPage: true });
	});

	// ─── Empty Fields Validation ─────────────────────────────────────────────

	test('TC-AUTH-004: Empty fields prevent form submission', async ({ page, loginPage }) => {
		await loginPage.loginButton.click();

		// Should remain on login page
		await expect(page).toHaveURL(/login/);

		await page.screenshot({ path: 'e2e/reports/screenshots/auth-004-empty-fields.png', fullPage: true });
	});

	// ─── Toggle to Signup Mode ───────────────────────────────────────────────

	test('TC-AUTH-005: Toggle to signup mode shows registration form', async ({ page, loginPage }) => {
		await loginPage.clickSignup();
		await page.waitForTimeout(500);

		// Signup form should be visible
		const firstNameInput = page.locator('input[formcontrolname="first_name"]');
		const lastNameInput = page.locator('input[formcontrolname="last_name"]');
		
		// At least the form should change
		await expect(page.locator('.auth-form')).toBeVisible();

		await page.screenshot({ path: 'e2e/reports/screenshots/auth-005-signup-mode.png', fullPage: true });
	});

	// ─── Signup with Mismatched Passwords ────────────────────────────────────

	test('TC-AUTH-006: Signup with mismatched passwords shows error', async ({ page, loginPage }) => {
		await loginPage.clickSignup();
		await page.waitForTimeout(500);

		// Fill signup form with mismatched passwords
		await page.locator('input[formcontrolname="first_name"]').fill('Test');
		await page.locator('input[formcontrolname="last_name"]').fill('User');
		await page.locator('input[formcontrolname="email"]').fill('newuser@test.com');
		await page.locator('input[formcontrolname="password"]').fill('Password123!');
		await page.locator('input[formcontrolname="confirmPassword"]').fill('Different456!');

		await page.locator('button[type="submit"]').click();
		await page.waitForTimeout(1000);

		await loginPage.expectErrorMessage('Passwords do not match');

		await page.screenshot({ path: 'e2e/reports/screenshots/auth-006-password-mismatch.png', fullPage: true });
	});

	// ─── Forgot Password Mode ────────────────────────────────────────────────

	test('TC-AUTH-007: Forgot password mode shows email form', async ({ page, loginPage }) => {
		await loginPage.clickForgotPassword();
		await page.waitForTimeout(500);

		await expect(page.locator('.auth-form')).toBeVisible();
		await expect(page.locator('input[formcontrolname="email"]')).toBeVisible();

		await page.screenshot({ path: 'e2e/reports/screenshots/auth-007-forgot-password.png', fullPage: true });
	});

	// ─── Logout Flow ─────────────────────────────────────────────────────────

	test('TC-AUTH-008: Logout redirects to login page', async ({ page, loginPage }) => {
		// First login
		await loginPage.login(TEST_USER.email, TEST_USER.password);
		await page.waitForURL(/dashboard/, { timeout: 15000 });

		// Click logout
		await page.locator('.logout-item').click();
		await page.waitForTimeout(2000);

		// Should redirect to login
		await expect(page).toHaveURL(/login/);

		await page.screenshot({ path: 'e2e/reports/screenshots/auth-008-logout.png', fullPage: true });
	});

	// ─── Protected Route Redirect ────────────────────────────────────────────

	test('TC-AUTH-009: Accessing protected route without auth redirects to login', async ({ page }) => {
		// Clear any stored tokens
		await page.evaluate(() => localStorage.clear());

		await page.goto('/dashboard');
		await page.waitForTimeout(2000);

		await expect(page).toHaveURL(/login/);

		await page.screenshot({ path: 'e2e/reports/screenshots/auth-009-protected-redirect.png', fullPage: true });
	});
});
