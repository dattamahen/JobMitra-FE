import { Routes } from '@angular/router';
import { LoginPage } from './login-page/login-page';
import { Dashboard } from './dashboard/dashboard';
import { ViewPage } from './view-page/view-page';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    component: ViewPage,
    data: { page: 'login' }
  },
  { 
    path: 'dashboard', 
    component: ViewPage,
    data: { page: 'dashboard' }
  }
];
