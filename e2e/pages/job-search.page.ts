import { Page, Locator, expect } from '@playwright/test';

export class JobSearchPage {
	readonly page: Page;
	readonly jobCards: Locator;
	readonly jobTitle: Locator;
	readonly applyButton: Locator;
	readonly pagination: Locator;
	readonly emptyState: Locator;
	readonly loadingState: Locator;
	readonly matchChip: Locator;
	readonly expandButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.jobCards = page.locator('.job-card');
		this.jobTitle = page.locator('.job-title');
		this.applyButton = page.locator('button:has-text("Apply Now")');
		this.pagination = page.locator('.pagination');
		this.emptyState = page.locator('app-empty-state');
		this.loadingState = page.locator('app-loading');
		this.matchChip = page.locator('.match-chip');
		this.expandButton = page.locator('button:has(mat-icon:has-text("expand_more"))');
	}

	async waitForJobsLoaded() {
		await this.loadingState.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
		await this.page.waitForTimeout(1000);
	}

	async getJobCount(): Promise<number> {
		return await this.jobCards.count();
	}

	async clickApplyOnFirstJob() {
		await this.applyButton.first().click();
	}

	async expandFirstJob() {
		await this.expandButton.first().click();
	}

	async expectJobsVisible() {
		const count = await this.jobCards.count();
		expect(count).toBeGreaterThan(0);
	}

	async expectEmptyState() {
		await expect(this.emptyState).toBeVisible();
	}
}
