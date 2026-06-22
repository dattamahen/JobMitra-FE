import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e/tests',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 1,
	workers: 1,
	timeout: 60000,

	reporter: [
		['html', { outputFolder: 'e2e/reports/html-report', open: 'never' }],
		['json', { outputFile: 'e2e/reports/test-results.json' }],
		['list']
	],

	use: {
		baseURL: 'http://localhost:4200',
		trace: 'on-first-retry',
		screenshot: 'on',
		video: 'on-first-retry',
		actionTimeout: 15000,
		navigationTimeout: 30000,
	},

	webServer: {
		command: 'ng serve',
		url: 'http://localhost:4200',
		reuseExistingServer: true,
		timeout: 120000,
	},

	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				launchOptions: {
					slowMo: 500,
				},
			},
		},
	],

	outputDir: 'e2e/reports/test-artifacts',
});
