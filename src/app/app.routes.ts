import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';

import { Dashboard } from './dashboard/dashboard';
import { ViewPage } from './view-page/view-page';
import { JobApplicationsComponent } from './pages/job-applications/job-applications.component';
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
    component: Dashboard,
    canActivate: [AuthGuard]
  },
  { 
    path: 'dashboard/:page', 
    component: Dashboard,
    canActivate: [AuthGuard]
  },
  {
    path: 'job-applications/:jobId',
    component: JobApplicationsComponent,
    canActivate: [AuthGuard]
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
  // Redirect all job seeker pages to dashboard (they'll be handled internally)
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
    path: 'settings',
    redirectTo: '/dashboard'
  },
  // Catch all route
  { path: '**', redirectTo: '/login' }
];
