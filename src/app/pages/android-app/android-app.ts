import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'app-android-app',
	templateUrl: './android-app.html',
	styleUrl: './android-app.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AndroidAppPage {
	readonly apkUrl = '/downloads/jobmouka.apk';

	readonly screenshots = [
		{ label: 'Job Search' },
		{ label: 'Resume Builder' },
		{ label: 'Mock Interviews' },
		{ label: 'Dashboard' },
	];

	readonly features = [
		{ icon: 'ti-briefcase', title: 'Smart Job Search', desc: 'AI-powered job recommendations tailored to your skills and experience.' },
		{ icon: 'ti-file-text', title: 'Resume Builder', desc: 'Build ATS-optimized resumes in minutes with AI suggestions.' },
		{ icon: 'ti-microphone', title: 'Mock Interviews', desc: 'Practice with AI-powered role-specific interview sessions.' },
		{ icon: 'ti-chart-bar', title: 'Application Tracker', desc: 'Track all your job applications in one place, in real time.' },
		{ icon: 'ti-bell', title: 'Job Alerts', desc: 'Get instant notifications for new jobs matching your profile.' },
		{ icon: 'ti-shield-check', title: 'Secure & Private', desc: 'Your data is encrypted and never shared without your consent.' },
	];

	downloadApk(): void {
		const a = document.createElement('a');
		a.href = this.apkUrl;
		a.download = 'jobmouka.apk';
		a.click();
	}
}
