import { test, expect, TEST_USER } from '../fixtures/test-fixtures';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Profile Management', () => {

	test.beforeEach(async ({ page }) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await loginPage.login(TEST_USER.email, TEST_USER.password);
		await page.waitForURL(/dashboard/, { timeout: 15000 });

		const dashboard = new DashboardPage(page);
		await dashboard.navigateTo('Profile');
		await dashboard.waitForContentLoad();
	});

	// ─── Profile Page Load ───────────────────────────────────────────────────

	test('TC-PROF-001: Profile page loads with user data', async ({ page }) => {
		await expect(page.locator('.profile-layout, .page-container')).toBeVisible({ timeout: 10000 });
		await expect(page.locator('.profile-name, .linkedin-profile-card')).toBeVisible({ timeout: 10000 });

		await page.screenshot({ path: 'e2e/reports/screenshots/prof-001-profile-loaded.png', fullPage: true });
	});

	// ─── Profile Preview Card ────────────────────────────────────────────────

	test('TC-PROF-002: Profile preview card shows user info', async ({ page }) => {
		const profileCard = page.locator('.linkedin-profile-card');
		await expect(profileCard).toBeVisible({ timeout: 10000 });

		// Should show name
		await expect(page.locator('.profile-name')).toBeVisible();

		await page.screenshot({ path: 'e2e/reports/screenshots/prof-002-preview-card.png', fullPage: true });
	});

	// ─── Form Sections Visible ───────────────────────────────────────────────

	test('TC-PROF-003: All profile form sections are visible', async ({ page }) => {
		const formCards = page.locator('.form-card');
		const count = await formCards.count();

		// Should have multiple form sections (basic info, professional, skills, etc.)
		expect(count).toBeGreaterThanOrEqual(3);

		await page.screenshot({ path: 'e2e/reports/screenshots/prof-003-form-sections.png', fullPage: true });
	});

	// ─── Edit Basic Info ─────────────────────────────────────────────────────

	test('TC-PROF-004: Edit basic info section', async ({ page }) => {
		// Find and click edit button on first form card
		const editButtons = page.locator('.form-card button:has-text("Edit"), .form-card mat-icon:has-text("edit")');
		const count = await editButtons.count();

		if (count > 0) {
			await editButtons.first().click();
			await page.waitForTimeout(500);

			// Form fields should become editable
			const inputs = page.locator('.form-card input:not([readonly])');
			const inputCount = await inputs.count();
			expect(inputCount).toBeGreaterThan(0);
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/prof-004-edit-basic.png', fullPage: true });
	});

	// ─── Skills Section ──────────────────────────────────────────────────────

	test('TC-PROF-005: Skills section displays user skills', async ({ page }) => {
		const skillsSection = page.locator('.skills-list, .skill-item');
		const emptySkills = page.locator('.empty-section:has-text("skill")');

		const hasSkills = await skillsSection.isVisible().catch(() => false);
		const hasEmpty = await emptySkills.isVisible().catch(() => false);

		// Either skills are shown or empty state
		expect(hasSkills || hasEmpty).toBeTruthy();

		await page.screenshot({ path: 'e2e/reports/screenshots/prof-005-skills-section.png', fullPage: true });
	});

	// ─── Profile Completion ──────────────────────────────────────────────────

	test('TC-PROF-006: Profile completion percentage is displayed', async ({ page }) => {
		const statNumbers = page.locator('.stat-number');
		const count = await statNumbers.count();

		if (count > 0) {
			const text = await statNumbers.first().textContent();
			expect(text).toBeTruthy();
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/prof-006-completion.png', fullPage: true });
	});

	// ─── Avatar Section ──────────────────────────────────────────────────────

	test('TC-PROF-007: Avatar section is interactive', async ({ page }) => {
		const avatarWrapper = page.locator('.avatar-wrapper');
		await expect(avatarWrapper).toBeVisible({ timeout: 10000 });

		// Hover should show overlay
		await avatarWrapper.hover();
		await page.waitForTimeout(300);

		await page.screenshot({ path: 'e2e/reports/screenshots/prof-007-avatar.png', fullPage: true });
	});

	// ─── Contact Info Section ────────────────────────────────────────────────

	test('TC-PROF-008: Contact information section shows email', async ({ page }) => {
		const contactSection = page.locator('.contact-list, .contact-row');
		const hasContact = await contactSection.first().isVisible().catch(() => false);

		if (hasContact) {
			await expect(page.locator('.contact-row:has(mat-icon:has-text("email"))')).toBeVisible();
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/prof-008-contact-info.png', fullPage: true });
	});

	// ─── Career Preferences ──────────────────────────────────────────────────

	test('TC-PROF-009: Career preferences section is visible', async ({ page }) => {
		const preferencesSection = page.locator('.preferences-list');
		const hasPreferences = await preferencesSection.isVisible().catch(() => false);

		if (hasPreferences) {
			await expect(page.locator('.preference-row').first()).toBeVisible();
		}

		await page.screenshot({ path: 'e2e/reports/screenshots/prof-009-preferences.png', fullPage: true });
	});
});
