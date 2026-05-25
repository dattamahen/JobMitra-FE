import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
	readonly page: Page;
	readonly sideNav: Locator;
	readonly mainContent: Locator;
	readonly navItems: Locator;
	readonly logoutButton: Locator;
	readonly userName: Locator;
	readonly userEmail: Locator;
	readonly loadingIndicator: Locator;

	constructor(page: Page) {
		this.page = page;
		this.sideNav = page.locator('.side-nav-container');
		this.mainContent = page.locator('.main-content');
		this.navItems = page.locator('.nav-item');
		this.logoutButton = page.locator('.logout-item');
		this.userName = page.locator('.user-name');
		this.userEmail = page.locator('.user-email');
		this.loadingIndicator = page.locator('app-loading');
	}

	async expectDashboardLoaded() {
		await expect(this.page).toHaveURL(/dashboard/);
		await expect(this.sideNav).toBeVisible();
	}

	async navigateTo(navLabel: string) {
		await this.page.locator(`.nav-item:has-text("${navLabel}")`).click();
		// Wait for page content to load
		await this.page.waitForTimeout(1000);
	}

	async waitForContentLoad() {
		// Wait for loading indicator to disappear
		await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
	}

	async logout() {
		await this.logoutButton.click();
	}

	async expectUserInfo(name: string) {
		await expect(this.userName).toContainText(name);
	}
}
