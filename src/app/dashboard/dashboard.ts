import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SideNav } from '../side-nav/side-nav';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { JobSearchPage } from '../pages/job-search/job-search';
import { ApplicationsPage } from '../pages/applications/applications';
import { MockInterviewsPage } from '../pages/mock-interviews/mock-interviews';
import { ResumeBuilderPage } from '../pages/resume-builder/resume-builder';
import { SkillAssessmentPage } from '../pages/skill-assessment/skill-assessment';
import { ProfilePage } from '../pages/profile/profile';
import { SettingsPage } from '../pages/settings/settings';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SideNav,
    DashboardPage,
    JobSearchPage,
    ApplicationsPage,
    MockInterviewsPage,
    ResumeBuilderPage,
    SkillAssessmentPage,
    ProfilePage,
    SettingsPage
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  currentPage: string = '';
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize with dashboard as default
    this.currentPage = 'dashboard';
  }

  onPageSelected(pageId: string) {
    this.currentPage = pageId;
  }
}
