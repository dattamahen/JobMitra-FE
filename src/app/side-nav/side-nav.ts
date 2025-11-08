import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NavigationService, NavItem } from '../services/navigation.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.css'
})
export class SideNav implements OnInit {
  @Output() pageSelected = new EventEmitter<string>();

  activeItem: string = '';
  navItems: NavItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    // Get navigation items based on current user
    this.navItems = this.navigationService.getNavigationItems();
    

    
    // Initialize with dashboard as default
    this.activeItem = 'dashboard';
  }

  selectItem(itemId: string) {
    this.activeItem = itemId;
    this.pageSelected.emit(itemId);
    
    // ALL pages should stay within the dashboard layout to keep side navigation visible
    // The dashboard component will handle switching between different page components
    // No need to navigate away from dashboard for any page
    return;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
