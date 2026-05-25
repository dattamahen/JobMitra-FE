import { Page, Locator, expect } from '@playwright/test';

export class ProfilePage {
	readonly page: Page;
	readonly profileName: Locator;
	readonly profileHeadline: Locator;
	readonly skillsList: Locator;
	readonly formCards: Locator;
	readonly saveButton: Locator;
	readonly avatarSection: Locator;
	readonly completionPercentage: Locator;

	constructor(page: Page) {
		this.page = page;
		this.profileName = page.locator('.profile-name');
		this.profileHeadline = page.locator('.profile-headline');
		this.skillsList = page.locator('.skills-list');
		this.formCards = page.locator('.form-card');
		this.saveButton = page.locator('button[type="submit"]');
		this.avatarSection = page.locator('.avatar-wrapper');
		this.completionPercentage = page.locator('.stat-number').first();
	}

	async expectProfileLoaded() {
		await expect(this.profileName).toBeVisible();
	}

	async expectProfileName(name: string) {
		await expect(this.profileName).toContainText(name);
	}

	async getFormCardCount(): Promise<number> {
		return await this.formCards.count();
	}
}
