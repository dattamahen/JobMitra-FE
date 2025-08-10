import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { 
  JobListing, 
  FilterOptions,
  JobSearchDataService,
  LearningResource 
} from '../../data/job-search-data';
import { JobService, JobListing as ApiJobListing, JobSearchFilters } from '../../services/job.service';

@Component({
  selector: 'app-job-search-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './job-search.html',
  styleUrls: ['./job-search.css']
})
export class JobSearchPage implements OnInit {
  expandedJobs: { [key: string]: boolean } = {};
  
  // Data properties using the API service
  jobListings: ApiJobListing[] = [];
  filterOptions: any = {};
  isLoading = false;
  
  // Filter state
  searchQuery = '';
  selectedLocation = 'all';
  selectedCategory = 'all';
  selectedExperience = 'all';
  selectedEmploymentType = 'all';
  
  // Pagination
  currentPage = 1;
  totalJobs = 0;
  jobsPerPage = 10;

  // Debugging getter
  get debugInfo() {
    return {
      isLoading: this.isLoading,
      jobListingsLength: this.jobListings?.length || 0,
      jobListings: this.jobListings
    };
  }
  
  constructor(
    private jobService: JobService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize filter options with empty arrays to prevent template errors
    this.filterOptions = {
      locations: [],
      experience_levels: [],
      employment_types: [],
      job_types: [],
      companies: [],
      salary_ranges: []
    };
    
    console.log('🏗️ JobSearchPage constructor - initialized filterOptions:', this.filterOptions);
  }

  ngOnInit(): void {
    console.log('🎯 JobSearchPage ngOnInit called');
    this.loadJobs();
  }

  private loadJobs(): void {
    console.log('🎯 loadJobs called, setting isLoading to true');
    console.log('🔍 Current filter values:', {
      searchQuery: this.searchQuery,
      selectedLocation: this.selectedLocation,
      selectedExperience: this.selectedExperience,
      selectedEmploymentType: this.selectedEmploymentType
    });
    
    this.isLoading = true;
    console.log('🔍 Loading jobs from API...');
    
    // Build filters from current selections
    const filters: JobSearchFilters = {};
    
    if (this.searchQuery) {
      filters.keywords = this.searchQuery;
    }
    if (this.selectedLocation !== 'all') {
      filters.location = this.selectedLocation;
    }
    if (this.selectedExperience !== 'all') {
      filters.experience_level = [this.selectedExperience];
    }
    if (this.selectedEmploymentType !== 'all') {
      filters.employment_type = [this.selectedEmploymentType];
    }

    console.log('📤 Sending filters to API:', filters);

    this.jobService.searchJobs(filters, this.currentPage, this.jobsPerPage)
      .subscribe({
        next: (response) => {
          console.log('✅ Jobs loaded successfully:', response);
          console.log('✅ Response jobs array:', response.jobs);
          console.log('✅ Response type:', typeof response);
          console.log('✅ Response keys:', Object.keys(response));
          
          // Update data first
          this.jobListings = response.jobs || [];
          this.totalJobs = response.total_count || 0;
          
          // Update filter options from API response if available
          if (response.filters) {
            this.filterOptions = response.filters;
          }
          
          // Set loading to false and trigger change detection
          this.isLoading = false;
          this.cdr.detectChanges();
          
          console.log('✅ Updated jobListings:', this.jobListings);
          console.log('✅ isLoading set to:', this.isLoading);
          console.log('✅ Change detection triggered');
        },
        error: (error) => {
          console.error('❌ Error loading jobs:', error);
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('❌ Error: Change detection triggered');
        }
      });
  }

  // Format location for API job data
  formatLocation(job: ApiJobListing): string {
    const parts = [];
    if (job.location.city) parts.push(job.location.city);
    if (job.location.state) parts.push(job.location.state);
    if (job.location.country) parts.push(job.location.country);
    
    let location = parts.join(', ') || 'Location not specified';
    
    if (job.location.is_remote) {
      location += ' (Remote)';
    }
    
    return location;
  }

  // Get formatted posted date
  getFormattedPostedDate(job: ApiJobListing): string {
    const now = new Date();
    const postedDate = new Date(job.posted_date);
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }

  // Check if application deadline is approaching
  isDeadlineApproaching(job: ApiJobListing): boolean {
    if (!job.application_deadline) return false;
    
    const now = new Date();
    const deadline = new Date(job.application_deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7 && diffDays > 0;
  }

  // Search functionality
  onSearchButtonClick(): void {
    // Reset to first page when search changes
    this.currentPage = 1;
    this.loadJobs();
  }

  onLocationChange(location: string): void {
    this.selectedLocation = location;
    this.applyFilters();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onExperienceChange(experience: string): void {
    this.selectedExperience = experience;
    this.applyFilters();
  }

  onEmploymentTypeChange(type: string): void {
    this.selectedEmploymentType = type;
    this.applyFilters();
  }

  private applyFilters(): void {
    // Reset to first page when filters change
    this.currentPage = 1;
    this.loadJobs();
  }

  toggleJobExpansion(jobId: string): void {
    this.expandedJobs[jobId] = !this.expandedJobs[jobId];
  }

  isJobExpanded(jobId: string): boolean {
    return this.expandedJobs[jobId] || false;
  }

  getJobById(jobId: string): ApiJobListing | undefined {
    return this.jobListings.find(job => job.job_id === jobId);
  }

  // Format salary for API job data
  formatSalary(job: ApiJobListing): string {
    if (!job.salary.min && !job.salary.max) return 'Salary not disclosed';
    
    const formatAmount = (amount: number) => {
      if (job.salary.currency === 'INR') {
        return (amount / 100000).toFixed(0) + ' LPA';
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: job.salary.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    if (job.salary.min && job.salary.max) {
      return `${formatAmount(job.salary.min)} - ${formatAmount(job.salary.max)}`;
    } else if (job.salary.min) {
      return `From ${formatAmount(job.salary.min)}`;
    } else {
      return `Up to ${formatAmount(job.salary.max!)}`;
    }
  }

  takeMatchAnalysis(jobId: string): void {
    const job = this.getJobById(jobId);
    console.log(`Analyzing profile match for job: ${job?.title}`);
    // Here you would typically navigate to profile analysis or show a dialog
    alert(`Analyzing how well your profile matches the ${job?.title} position...`);
  }

  modifyCV(jobId: string): void {
    const job = this.getJobById(jobId);
    console.log(`Modifying CV for job: ${job?.title}`);
    // Here you would typically navigate to CV modification page or show editing interface
    alert(`Opening CV modification tool tailored for ${job?.title} position...`);
  }

  takeMockInterview(jobId: string): void {
    const job = this.getJobById(jobId);
    console.log(`Starting mock interview for job: ${job?.title}`);
    // Here you would typically navigate to mock interview page or start interview flow
    alert(`Starting mock interview preparation for ${job?.title} position...`);
  }

  // Apply for job
  applyForJob(jobId: string): void {
    const job = this.getJobById(jobId);
    console.log(`Applying for job: ${job?.title}`);
    // Here you would typically handle the job application process
    alert(`Redirecting to application page for ${job?.title} position...`);
  }

  // Save job for later
  saveJob(jobId: string): void {
    const job = this.getJobById(jobId);
    console.log(`Saving job: ${job?.title}`);
    // Here you would typically save the job to user's saved jobs
    alert(`${job?.title} has been saved to your favorites!`);
  }

  // Get skill level color
  getLevelColor(level: 'beginner' | 'intermediate' | 'advanced'): string {
    switch (level) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ff9800';
      case 'advanced': return '#f44336';
      default: return '#757575';
    }
  }

  // Get rating stars array for display
  getRatingStars(rating?: number): boolean[] {
    if (!rating) return [];
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  // Get YouTube video ID for thumbnail
  getYouTubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // Get YouTube thumbnail URL
  getYouTubeThumbnail(url: string): string {
    const videoId = this.getYouTubeVideoId(url);
    return videoId 
      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      : '/assets/default-video-thumbnail.jpg';
  }

  // Open YouTube video in new tab
  openLearningResource(resource: any): void {
    window.open(resource.youtube_url, '_blank');
  }
}
