import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ 
		path: 'login', 
		loadComponent: () => import('./login-page/login-page').then(m => m.LoginPage)
	},
	{ 
		path: 'signup', 
		loadComponent: () => import('./pages/signup/signup').then(m => m.SignupPage)
	},

	{ 
		path: 'dashboard', 
		loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
		canActivate: [AuthGuard]
	},
	{ 
		path: 'dashboard/:page', 
		loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
		canActivate: [AuthGuard]
	},
	{
		path: 'job-applications/:jobId',
		loadComponent: () => import('./pages/job-applications/job-applications.component').then(m => m.JobApplicationsComponent),
		canActivate: [AuthGuard]
	},
	{
		path: 'profile',
		redirectTo: '/dashboard'
	},
	{
		path: 'job-search',
		redirectTo: '/dashboard'
	},
	{
		path: 'applications',
		redirectTo: '/dashboard'
	},
	{
		path: 'resume-builder',
		redirectTo: '/dashboard'
	},
	{
		path: 'skill-assessment',
		redirectTo: '/dashboard'
	},
	{
		path: 'mock-interviews',
		redirectTo: '/dashboard'
	},
	{
		path: 'analytics',
		redirectTo: '/dashboard'
	},
	{
		path: 'error',
		loadComponent: () => import('./pages/error/error-page.component').then(m => m.ErrorPageComponent)
	},
	// Catch all route
	{ path: '**', redirectTo: '/login' }
];
