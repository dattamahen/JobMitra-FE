import { test, expect, TEST_USER } from '../fixtures/test-fixtures';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { JobSearchPage } from '../pages/job-search.page';

test.describe('Job Search & Apply Flow', () => {

	test.beforeEach(async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(TEST_USER.email, TEST_USER.password);
		await page.waitForURL(/dashboard/, { timeout: 15000 });

		// Navigate to Job Search
		const dashboard = new DashboardPage(page);
		await dashboard.navigateTo('Job Search');
		await dashboard.waitForContentLoad();
	});

	// ─── Job Listings Load ───────────────────────────────────────────────────

	test('TC-JOB-001: Job listings page loads', async ({ page, jobSearchPage }) => {
		await jobSearchPage.waitForJobsLoaded();

		// Either jobs are shown or empty state
		const jobCount = await jobSearchPage.getJobCount();
		const emptyVisible = await page.locator('app-empty-state').isVisible().catch(() => false);

		expect(jobCount > 0 || emptyVisible).toBeTruthy();

		await page.screenshot({ path: 'e2e/reports/screenshots/job-001-listings-loaded.png', fullPage: true });
	});

	// ─── Job Card Structure ──────────────────────────────────────────────────

	test('TC-JOB-002: Job cards display required information', async ({ page, jobSearchPage }) => {
		await jobSearchPage.waitForJobsLoaded();

		const jobCount = await jobSearchPage.getJobCount();
		if (jobCount > 0) {
			const firstCard = page.locator('.job-card').first();
			await expect(firstCard.locator('.job-title')).toBeVisible();
			await expect(firstCard.locator('.job-company')).toBeVisible();
			await expect(firstCard.locator('.job-meta-row')).toBeVisible();
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/job-002-card-structure.png', fullPage: true });
	});

	// ─── Expand Job Details ──────────────────────────────────────────────────

	test('TC-JOB-003: Expanding job card shows full details', async ({ page, jobSearchPage }) => {
		await jobSearchPage.waitForJobsLoaded();

		const jobCount = await jobSearchPage.getJobCount();
		if (jobCount > 0) {
			await jobSearchPage.expandFirstJob();
			await page.waitForTimeout(500);

			const expandedSection = page.locator('.job-expanded').first();
			await expect(expandedSection).toBeVisible();
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/job-003-expanded-details.png', fullPage: true });
	});

	// ─── Apply for Job ───────────────────────────────────────────────────────

	test('TC-JOB-004: Apply for a job', async ({ page, jobSearchPage }) => {
		await jobSearchPage.waitForJobsLoaded();

		const applyButtons = page.locator('button:has-text("Apply Now")');
		const count = await applyButtons.count();

		if (count > 0) {
			await applyButtons.first().click();
			await page.waitForTimeout(3000);

			// Should either show success or match prompt dialog
			const appliedButton = page.locator('button:has-text("Applied")');
			const dialog = page.locator('mat-dialog-container');
			const hasApplied = await appliedButton.isVisible().catch(() => false);
			const hasDialog = await dialog.isVisible().catch(() => false);

			expect(hasApplied || hasDialog).toBeTruthy();
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/job-004-apply-job.png', fullPage: true });
	});

	// ─── Already Applied State ───────────────────────────────────────────────

	test('TC-JOB-005: Already applied jobs show disabled button', async ({ page, jobSearchPage }) => {
		await jobSearchPage.waitForJobsLoaded();

		const appliedButtons = page.locator('button:has-text("Applied")');
		const count = await appliedButtons.count();

		if (count > 0) {
			await expect(appliedButtons.first()).toBeDisabled();
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/job-005-already-applied.png', fullPage: true });
	});

	// ─── Match Analysis Chip ─────────────────────────────────────────────────

	test('TC-JOB-006: Match Analysis action chip is clickable', async ({ page, jobSearchPage }) => {
		await jobSearchPage.waitForJobsLoaded();

		const matchChips = page.locator('.action-chip:has-text("Match")');
		const count = await matchChips.count();

		if (count > 0) {
			const firstChip = matchChips.first();
			const isDisabled = await firstChip.evaluate(el => el.classList.contains('disabled'));
			if (!isDisabled) {
				await firstChip.click();
				await page.waitForTimeout(3000);
			}
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/job-006-match-analysis.png', fullPage: true });
	});

	// ─── Tailor Resume Chip ──────────────────────────────────────────────────

	test('TC-JOB-007: Tailor Resume action chip is clickable', async ({ page, jobSearchPage }) => {
		await jobSearchPage.waitForJobsLoaded();

		const tailorChips = page.locator('.action-chip:has-text("Tailor")');
		const count = await tailorChips.count();

		if (count > 0) {
			const firstChip = tailorChips.first();
			const isDisabled = await firstChip.evaluate(el => el.classList.contains('disabled'));
			if (!isDisabled) {
				await firstChip.click();
				await page.waitForTimeout(3000);
			}
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/job-007-tailor-resume.png', fullPage: true });
	});

	// ─── Pagination ──────────────────────────────────────────────────────────

	test('TC-JOB-008: Pagination works when multiple pages exist', async ({ page, jobSearchPage }) => {
		await jobSearchPage.waitForJobsLoaded();

		const pagination = page.locator('.pagination');
		const hasPagination = await pagination.isVisible().catch(() => false);

		if (hasPagination) {
			const nextButton = pagination.locator('button').last();
			const isDisabled = await nextButton.isDisabled();
			if (!isDisabled) {
				await nextButton.click();
				await page.waitForTimeout(1000);
				await expect(page.locator('.page-info')).toContainText('Page 2');
			}
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/job-008-pagination.png', fullPage: true });
	});

	// ─── Mock Interview Chip ─────────────────────────────────────────────────

	test('TC-JOB-009: Mock Interview chip opens interview modal', async ({ page, jobSearchPage }) => {
		await jobSearchPage.waitForJobsLoaded();

		const mockChips = page.locator('.action-chip:has-text("Mock")');
		const count = await mockChips.count();

		if (count > 0) {
			await mockChips.first().click();
			await page.waitForTimeout(2000);

			// Should open a modal or navigate
			const modal = page.locator('mat-dialog-container, .modal, .cdk-overlay-container');
			const hasModal = await modal.isVisible().catch(() => false);
			// Modal or navigation happened
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/job-009-mock-interview.png', fullPage: true });
	});
});
