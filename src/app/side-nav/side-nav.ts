import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface NavItem {
  id: string;
  label: string;
  matIcon: string;
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
    { id: 'dashboard', label: 'Dashboard', matIcon: 'dashboard' },
    { id: 'profile', label: 'Profile', matIcon: 'person' },
    { id: 'job-search', label: 'Job Search', matIcon: 'search' },
    { id: 'applications', label: 'My Applications', matIcon: 'assignment' },
    { id: 'resume-builder', label: 'Resume Builder', matIcon: 'description' },
    { id: 'skill-assessment', label: 'Skill Assessment', matIcon: 'assessment' },
    { id: 'mock-interviews', label: 'Mock Interviews', matIcon: 'record_voice_over' },
    { id: 'settings', label: 'Settings', matIcon: 'settings' }
  ];

  ngOnInit() {
    // Initialize with dashboard as default
    this.activeItem = 'dashboard';
  }

  selectItem(itemId: string) {
    this.activeItem = itemId;
    this.pageSelected.emit(itemId);
  }
}
