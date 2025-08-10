import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { Dashboard } from './dashboard/dashboard';
import { ViewPage } from './view-page/view-page';
import { AuthGuard } from './guards/auth.guard';
import { JobSeekerGuard } from './guards/job-seeker.guard';
import { HRGuard } from './guards/hr.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    component: LoginPage
  },
  { 
    path: 'dashboard', 
    component: ViewPage,
    canActivate: [AuthGuard],
    data: { page: 'dashboard' }
  },
  // Job Seeker specific routes (protected)
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.ProfilePage),
    canActivate: [AuthGuard, JobSeekerGuard]
  },
  {
    path: 'job-search',
    loadComponent: () => import('./pages/job-search/job-search').then(m => m.JobSearchPage),
    canActivate: [AuthGuard, JobSeekerGuard]
  },
  {
    path: 'applications',
    loadComponent: () => import('./pages/applications/applications').then(m => m.ApplicationsPage),
    canActivate: [AuthGuard, JobSeekerGuard]
  },
  {
    path: 'resume-builder',
    loadComponent: () => import('./pages/resume-builder/resume-builder').then(m => m.ResumeBuilderPage),
    canActivate: [AuthGuard, JobSeekerGuard]
  },
  {
    path: 'skill-assessment',
    loadComponent: () => import('./pages/skill-assessment/skill-assessment').then(m => m.SkillAssessmentPage),
    canActivate: [AuthGuard, JobSeekerGuard]
  },
  {
    path: 'mock-interviews',
    loadComponent: () => import('./pages/mock-interviews/mock-interviews').then(m => m.MockInterviewsPage),
    canActivate: [AuthGuard, JobSeekerGuard]
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/analytics').then(m => m.AnalyticsComponent),
    canActivate: [AuthGuard, JobSeekerGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsPage),
    canActivate: [AuthGuard, JobSeekerGuard]
  },
  // Legacy route support for backwards compatibility
  {
    path: 'hr-dashboard',
    redirectTo: '/dashboard'
  },
  {
    path: 'admin-dashboard', 
    redirectTo: '/dashboard'
  },
  {
    path: 'hr',
    redirectTo: '/dashboard'
  },
  // Catch all route
  { path: '**', redirectTo: '/login' }
];
