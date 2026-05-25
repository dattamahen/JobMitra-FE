import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
	readonly page: Page;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly loginButton: Locator;
	readonly signupLink: Locator;
	readonly forgotPasswordLink: Locator;
	readonly errorMessage: Locator;
	readonly successMessage: Locator;
	readonly authTitle: Locator;

	constructor(page: Page) {
		this.page = page;
		this.emailInput = page.locator('input[type="email"], input[formcontrolname="email"]');
		this.passwordInput = page.locator('input[type="password"], input[formcontrolname="password"]');
		this.loginButton = page.locator('button[type="submit"]');
		this.signupLink = page.locator('.toggle-link').first();
		this.forgotPasswordLink = page.locator('a:has-text("Forgot")');
		this.errorMessage = page.locator('.error-message');
		this.successMessage = page.locator('.success-message');
		this.authTitle = page.locator('.auth-title');
	}

	async goto() {
		await this.page.goto('/login');
		await this.page.waitForLoadState('networkidle');
	}

	async login(email: string, password: string) {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.loginButton.click();
	}

	async expectLoginPage() {
		await expect(this.page).toHaveURL(/login/);
		await expect(this.authTitle).toBeVisible();
	}

	async expectErrorMessage(text?: string) {
		await expect(this.errorMessage).toBeVisible();
		if (text) {
			await expect(this.errorMessage).toContainText(text);
		}
	}

	async clickSignup() {
		await this.signupLink.click();
	}

	async clickForgotPassword() {
		await this.forgotPasswordLink.click();
	}
}
