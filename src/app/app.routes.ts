import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { Dashboard } from './dashboard/dashboard';
import { ViewPage } from './view-page/view-page';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    component: LoginPage
  },
  { 
    path: 'dashboard', 
    component: ViewPage,
    data: { page: 'dashboard' }
  }
];
