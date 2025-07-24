import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  matIcon?: string;
}

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

  navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', matIcon: 'dashboard' },
    { id: 'profile', label: 'Profile', icon: '👤', matIcon: 'person' },
    { id: 'job-search', label: 'Job Search', icon: '🔍', matIcon: 'search' },
    { id: 'applications', label: 'My Applications', icon: '📋', matIcon: 'assignment' },
    { id: 'resume-builder', label: 'Resume Builder', icon: '📄', matIcon: 'description' },
    { id: 'skill-assessment', label: 'Skill Assessment', icon: '🎯', matIcon: 'assessment' },
    { id: 'mock-interviews', label: 'Mock Interviews', icon: '🎤', matIcon: 'record_voice_over' },
    { id: 'settings', label: 'Settings', icon: '⚙️', matIcon: 'settings' }
  ];

  ngOnInit() {
    // Initialize with dashboard as default
    this.activeItem = 'dashboard';
  }

  trackByItemId(index: number, item: NavItem): string {
    return item.id;
  }

  selectItem(itemId: string) {
    this.activeItem = itemId;
    this.pageSelected.emit(itemId);
  }
}
