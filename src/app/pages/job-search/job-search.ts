import { Component, OnInit } from '@angular/core';
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
import { 
  JobListing, 
  FilterOptions,
  JobSearchDataService,
  LearningResource 
} from '../../data/job-search-data';

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
    MatExpansionModule
  ],
  templateUrl: './job-search.html',
  styleUrls: ['./job-search.css']
})
export class JobSearchPage implements OnInit {
  expandedJobs: { [key: string]: boolean } = {};
  
  // Data properties using the data service
  jobListings: readonly JobListing[] = [];
  filterOptions: FilterOptions;
  
  // Filter state
  searchQuery = '';
  selectedLocation = 'all';
  selectedCategory = 'all';
  
  constructor() {
    this.filterOptions = JobSearchDataService.getFilterOptions();
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  private loadJobs(): void {
    // Load active jobs from the data service
    this.jobListings = JobSearchDataService.getActiveJobs();
  }

  toggleJobExpansion(jobId: string): void {
    this.expandedJobs[jobId] = !this.expandedJobs[jobId];
  }

  isJobExpanded(jobId: string): boolean {
    return this.expandedJobs[jobId] || false;
  }

  getJobById(jobId: string): JobListing | undefined {
    return JobSearchDataService.getJobById(jobId);
  }

  // Format salary using the data service utility
  formatSalary(job: JobListing): string {
    return JobSearchDataService.formatSalary(job.salary);
  }

  // Format location using the data service utility
  formatLocation(job: JobListing): string {
    return JobSearchDataService.formatLocation(job.location);
  }

  // Get requirements by type for better display
  getRequirementsByType(job: JobListing, type: 'required' | 'preferred' | 'nice-to-have'): string[] {
    return job.requirements
      .filter(req => req.type === type)
      .map(req => req.description);
  }

  // Search functionality
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  onLocationChange(location: string): void {
    this.selectedLocation = location;
    this.applyFilters();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filteredJobs = JobSearchDataService.getActiveJobs();

    // Apply search query filter
    if (this.searchQuery.trim()) {
      filteredJobs = JobSearchDataService.searchJobs(this.searchQuery);
    }

    // Apply location filter
    if (this.selectedLocation !== 'all') {
      if (this.selectedLocation === 'remote') {
        filteredJobs = filteredJobs.filter(job => job.location.type === 'remote');
      } else {
        // For specific cities, check if location matches
        filteredJobs = filteredJobs.filter(job => 
          this.formatLocation(job).toLowerCase().includes(this.selectedLocation.toLowerCase())
        );
      }
    }

    // Apply category filter (based on department or tags)
    if (this.selectedCategory !== 'all') {
      const categoryMap: { [key: string]: string[] } = {
        'dev': ['engineering', 'software development'],
        'data': ['data science', 'analytics'],
        'pm': ['product', 'product management']
      };

      const searchTerms = categoryMap[this.selectedCategory] || [this.selectedCategory.toLowerCase()];
      
      filteredJobs = filteredJobs.filter(job =>
        searchTerms.some(term =>
          job.department.toLowerCase().includes(term) ||
          job.tags.some(tag => tag.toLowerCase().includes(term))
        )
      );
    }

    this.jobListings = filteredJobs;
  }

  // Get formatted posted date
  getFormattedPostedDate(job: JobListing): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - job.postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }

  // Check if application deadline is approaching
  isDeadlineApproaching(job: JobListing): boolean {
    if (!job.applicationDeadline) return false;
    
    const now = new Date();
    const deadline = job.applicationDeadline;
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7 && diffDays > 0;
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

  // Get learning resources for a job's skills
  getLearningResourcesForJob(job: JobListing): readonly LearningResource[] {
    if (job.learningResources && job.learningResources.length > 0) {
      return job.learningResources;
    }
    return JobSearchDataService.getLearningResourcesBySkills(job.skills);
  }

  // Get YouTube video ID for thumbnail
  getYouTubeVideoId(url: string): string | null {
    return JobSearchDataService.getYouTubeVideoId(url);
  }

  // Get YouTube thumbnail URL
  getYouTubeThumbnail(url: string): string {
    const videoId = this.getYouTubeVideoId(url);
    return videoId 
      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      : '/assets/default-video-thumbnail.jpg';
  }

  // Open YouTube video in new tab
  openLearningResource(resource: LearningResource): void {
    window.open(resource.youtubeUrl, '_blank');
  }

  // Get skill level color
  getLevelColor(level: LearningResource['level']): string {
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
}
