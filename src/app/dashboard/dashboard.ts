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
import { PostJobPage } from '../pages/post-job/post-job';
import { AuthService } from '../services/auth.service';

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
    SettingsPage,
    PostJobPage
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  currentPage: string = '';
  userType: string | null = null;
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get user type to determine default page
    this.userType = this.authService.getUserType();
    console.log('Dashboard: User type detected:', this.userType);
    
    // Use unified dashboard for all user types
    this.currentPage = 'dashboard';
  }

  onPageSelected(pageId: string) {
    this.currentPage = pageId;
  }
}
