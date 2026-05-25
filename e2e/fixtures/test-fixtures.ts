import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { JobSearchPage } from '../pages/job-search.page';
import { ProfilePage } from '../pages/profile.page';

// Test user credentials - update these with real test account credentials
export const TEST_USER = {
	email: 'testuser@jobmitra.com',
	password: 'TestPass123!',
	firstName: 'Test',
	lastName: 'User',
};

export const TEST_HR_USER = {
	email: 'testhr@jobmitra.com',
	password: 'TestHR123!',
	firstName: 'HR',
	lastName: 'Manager',
};

export const INVALID_USER = {
	email: 'invalid@nonexistent.com',
	password: 'WrongPassword123!',
};

// Extended test fixture with page objects
type TestFixtures = {
	loginPage: LoginPage;
	dashboardPage: DashboardPage;
	jobSearchPage: JobSearchPage;
	profilePage: ProfilePage;
	authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},
	dashboardPage: async ({ page }, use) => {
		await use(new DashboardPage(page));
	},
	jobSearchPage: async ({ page }, use) => {
		await use(new JobSearchPage(page));
	},
	profilePage: async ({ page }, use) => {
		await use(new ProfilePage(page));
	},
	authenticatedPage: async ({ page }, use) => {
		// Pre-authenticate by setting localStorage tokens
		await page.goto('/login');
		const loginPage = new LoginPage(page);
		await loginPage.login(TEST_USER.email, TEST_USER.password);
		// Wait for redirect to dashboard
		await page.waitForURL(/dashboard/, { timeout: 15000 }).catch(() => {});
		await use(page);
	},
});

export { expect } from '@playwright/test';
