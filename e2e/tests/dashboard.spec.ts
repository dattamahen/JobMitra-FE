import { test, expect, TEST_USER } from '../fixtures/test-fixtures';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Dashboard & Navigation', () => {

	test.beforeEach(async ({ page }) => {
		// Login before each test
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(TEST_USER.email, TEST_USER.password);
		await page.waitForURL(/dashboard/, { timeout: 15000 });
	});

	// ─── Dashboard Load ──────────────────────────────────────────────────────

	test('TC-DASH-001: Dashboard loads with side navigation', async ({ page, dashboardPage }) => {
		await dashboardPage.expectDashboardLoaded();
		await expect(dashboardPage.sideNav).toBeVisible();
		await expect(dashboardPage.userName).toBeVisible();

		await page.screenshot({ path: 'e2e/reports/screenshots/dash-001-dashboard-loaded.png', fullPage: true });
	});

	// ─── User Info Display ───────────────────────────────────────────────────

	test('TC-DASH-002: User info displayed in sidebar', async ({ page, dashboardPage }) => {
		await expect(dashboardPage.userName).toBeVisible();
		await expect(dashboardPage.userEmail).toBeVisible();

		await page.screenshot({ path: 'e2e/reports/screenshots/dash-002-user-info.png', fullPage: true });
	});

	// ─── Navigate to Profile ─────────────────────────────────────────────────

	test('TC-DASH-003: Navigate to Profile page', async ({ page, dashboardPage }) => {
		await dashboardPage.navigateTo('Profile');
		await dashboardPage.waitForContentLoad();

		// Profile content should be visible
		await expect(page.locator('.profile-layout, .page-container')).toBeVisible({ timeout: 10000 });

		await page.screenshot({ path: 'e2e/reports/screenshots/dash-003-profile-nav.png', fullPage: true });
	});

	// ─── Navigate to Job Search ──────────────────────────────────────────────

	test('TC-DASH-004: Navigate to Job Search page', async ({ page, dashboardPage }) => {
		await dashboardPage.navigateTo('Job Search');
		await dashboardPage.waitForContentLoad();

		await expect(page.locator('.page-container, .job-listings')).toBeVisible({ timeout: 10000 });

		await page.screenshot({ path: 'e2e/reports/screenshots/dash-004-job-search-nav.png', fullPage: true });
	});

	// ─── Navigate to Applications ────────────────────────────────────────────

	test('TC-DASH-005: Navigate to Applications page', async ({ page, dashboardPage }) => {
		await dashboardPage.navigateTo('Applications');
		await dashboardPage.waitForContentLoad();

		await expect(page.locator('.page-container, app-empty-state, .applications')).toBeVisible({ timeout: 10000 });

		await page.screenshot({ path: 'e2e/reports/screenshots/dash-005-applications-nav.png', fullPage: true });
	});

	// ─── Navigate to Mock Interviews ─────────────────────────────────────────

	test('TC-DASH-006: Navigate to Mock Interviews page', async ({ page, dashboardPage }) => {
		await dashboardPage.navigateTo('Mock Interview');
		await dashboardPage.waitForContentLoad();

		await expect(page.locator('.page-container')).toBeVisible({ timeout: 10000 });

		await page.screenshot({ path: 'e2e/reports/screenshots/dash-006-mock-interviews-nav.png', fullPage: true });
	});

	// ─── Navigate to Resume Builder ──────────────────────────────────────────

	test('TC-DASH-007: Navigate to Resume Builder page', async ({ page, dashboardPage }) => {
		await dashboardPage.navigateTo('Resume');
		await dashboardPage.waitForContentLoad();

		await expect(page.locator('.page-container')).toBeVisible({ timeout: 10000 });

		await page.screenshot({ path: 'e2e/reports/screenshots/dash-007-resume-nav.png', fullPage: true });
	});

	// ─── Navigate to Settings ────────────────────────────────────────────────

	test('TC-DASH-008: Navigate to Settings page', async ({ page, dashboardPage }) => {
		await dashboardPage.navigateTo('Settings');
		await dashboardPage.waitForContentLoad();

		await expect(page.locator('.page-container')).toBeVisible({ timeout: 10000 });

		await page.screenshot({ path: 'e2e/reports/screenshots/dash-008-settings-nav.png', fullPage: true });
	});

	// ─── Sidebar Active State ────────────────────────────────────────────────

	test('TC-DASH-009: Sidebar highlights active navigation item', async ({ page, dashboardPage }) => {
		await dashboardPage.navigateTo('Profile');
		await page.waitForTimeout(500);

		const activeItem = page.locator('.nav-item.active');
		await expect(activeItem).toBeVisible();

		await page.screenshot({ path: 'e2e/reports/screenshots/dash-009-active-nav.png', fullPage: true });
	});
});
