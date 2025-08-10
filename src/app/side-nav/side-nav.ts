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
    
    // Only navigate away from dashboard for external routes
    // For dashboard pages, stay within dashboard and let the component handle the page switching
    if (itemId === 'dashboard' || itemId === 'post-job' || itemId === 'my-jobs' || 
        itemId === 'find-candidates' || itemId === 'applications-received') {
      // These are handled within the dashboard component
      return;
    }
    
    // Navigate to separate routes for job seeker pages
    this.router.navigate([`/${itemId}`]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
