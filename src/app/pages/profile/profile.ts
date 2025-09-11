import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, finalize } from 'rxjs';
import { PROFILE_FORM_DATA, PROFILE_FORM_FIELDS, ProfileFormData, FormFieldConfig } from '../../data/profile-data';
import { UserService, UserProfile, UpdateUserRequest } from '../../services';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatListModule,
    MatExpansionModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfilePage implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  currentUser: UserProfile | null = null;
  isLoading = false;
  isSaving = false;
  private destroy$ = new Subject<void>();
  
  expandedPanels: { [key: string]: boolean } = {
    basic: true,
    professional: false,
    preferences: false
  };
  
  formData: ProfileFormData = PROFILE_FORM_DATA;
  formFields = PROFILE_FORM_FIELDS;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // Force refresh user data from API for testing
    console.log('Profile component: ngOnInit - forcing user data refresh');
    this.forceRefreshUserData();
  }

  // Helper function to convert salary range string to expected_salary object
  private convertSalaryRangeToObject(salaryRange: string): { min: number; max: number; currency: 'INR'; period: 'yearly' } | undefined {
    if (!salaryRange) return undefined;
    
    // Map dropdown values to LPA ranges
    const rangeMap: { [key: string]: { min: number; max: number } } = {
      '4-6': { min: 4, max: 6 },
      '6-8': { min: 6, max: 8 },
      '8-12': { min: 8, max: 12 },
      '12-18': { min: 12, max: 18 },
      '18-25': { min: 18, max: 25 },
      '25+': { min: 25, max: 30 }
    };
    
    const range = rangeMap[salaryRange];
    if (range) {
      return {
        min: range.min,
        max: range.max,
        currency: 'INR' as const,
        period: 'yearly' as const
      };
    }
    
    return undefined;
  }

  private forceRefreshUserData(): void {
    console.log('Profile component: Forcing refresh of user data from API');
    // Clear localStorage to force API call
    localStorage.removeItem('currentUser');
    
    // Force refresh from API
    this.isLoading = true;
    this.userService.refreshCurrentUser()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          console.log('Profile component: Finished force refresh');
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (user) => {
          console.log('Profile component: Force refresh received user data:', user);
          if (user) {
            this.currentUser = user;
            this.populateForm(user);
          }
        },
        error: (error) => {
          console.error('Profile component: Error in force refresh:', error);
          this.snackBar.open('Error loading profile data', 'Close', { duration: 3000 });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      location: ['', [Validators.required, Validators.minLength(2)]],
      currentJobTitle: ['', [Validators.required, Validators.minLength(2)]],
      experience: ['', [Validators.required]],
      desiredJobTitle: ['', [Validators.required, Validators.minLength(2)]],
      salaryRange: [''],
      skills: ['', [Validators.required, Validators.minLength(3)]],
      summary: ['', [Validators.maxLength(500)]],
      certifications: this.fb.array([]),
      areaOfExpertise: [''],
      githubLink: ['', [Validators.pattern(/^$|^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/)]],
      portfolioLink: ['', [Validators.pattern(/^$|^https?:\/\/.+\..+/)]],
      youtubeChannel: ['', [Validators.pattern(/^$|^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_-]+\/?$/)]],
      contributions: ['', [Validators.maxLength(1000)]],
      workType: [[]],
      employmentType: [[]]
    });
  }

  private loadCurrentUser(): void {
    console.log('Profile component: Loading current user...');
    this.isLoading = true;
    this.userService.getCurrentUser()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          console.log('Profile component: Finished loading user');
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (user) => {
          console.log('Profile component: Received user data:', user);
          if (user) {
            this.currentUser = user;
            this.populateForm(user);
          } else {
            console.log('Profile component: No user data received');
          }
        },
        error: (error) => {
          console.error('Profile component: Error loading user profile:', error);
          this.snackBar.open('Error loading profile data', 'Close', { duration: 3000 });
        }
      });
  }

  private populateForm(user: UserProfile): void {
    this.profileForm.patchValue({
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      location: user.location?.city || '',
      currentJobTitle: user.current_job_title,
      experience: user.experience_years,
      desiredJobTitle: user.desired_job_title,
      salaryRange: this.userService.getSalaryRangeForDropdown(user),
      skills: user.skills.join(', '),
      summary: user.professional_summary,
      areaOfExpertise: user.area_of_expertise.join(', '),
      githubLink: user.social_links?.github || '',
      portfolioLink: user.social_links?.portfolio || '',
      youtubeChannel: user.social_links?.youtube || '',
      contributions: user.key_contributions,
      workType: user.preferred_work_types,
      employmentType: user.preferred_employment_types
    });
    
    // Populate certifications array
    this.certificationsArray.clear();
    if (user.certifications && user.certifications.length > 0) {
      user.certifications.forEach(cert => {
        this.certificationsArray.push(this.createCertificationGroup(cert));
      });
    } else {
      this.addCertification(); // Add one empty certification by default
    }
  }

  // Getter for easy access to form controls
  get f() { return this.profileForm.controls; }

  saveProfile(): void {
    if (!this.isSaving) {
      this.isSaving = true;
      const formValue = this.profileForm.value;
      
      // Convert form data to API format
      const updateData: UpdateUserRequest = {
        full_name: formValue.fullName,
        phone: formValue.phone,
        current_job_title: formValue.currentJobTitle,
        desired_job_title: formValue.desiredJobTitle,
        experience_years: formValue.experience,
        skills: formValue.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s),
        professional_summary: formValue.summary,
        certifications: this.certificationsArray.value,
        area_of_expertise: formValue.areaOfExpertise ? formValue.areaOfExpertise.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
        key_contributions: formValue.contributions,
        preferred_work_types: formValue.workType,
        preferred_employment_types: formValue.employmentType,
        expected_salary: this.convertSalaryRangeToObject(formValue.salaryRange),
        social_links: {
          github: formValue.githubLink || undefined,
          portfolio: formValue.portfolioLink || undefined,
          youtube: formValue.youtubeChannel || undefined
        },
        location: formValue.location ? {
          city: formValue.location,
          country: 'US', // You might want to add a country field
          type: 'hybrid' as const
        } : undefined
      };

      console.log('Sending update data:', updateData);
      
      this.userService.updateCurrentUser(updateData)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isSaving = false)
        )
        .subscribe({
          next: (response) => {
            console.log('Profile update response:', response);
            this.snackBar.open('Profile updated successfully!', 'Close', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            console.error('Error saving profile:', error);
            this.snackBar.open('Error saving profile. Please try again.', 'Close', { 
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });

  }
}

  public resetForm(): void {
    if (confirm('Are you sure you want to reset all changes?')) {
      if (this.currentUser) {
        this.populateForm(this.currentUser);
      } else {
        this.profileForm.reset();
      }
    }
  }

  getProfileCompletion(): number {
    if (this.currentUser) {
      return this.userService.calculateProfileCompletion(this.currentUser);
    }
    return 0;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  getSkillsArray(): string[] {
    const skills = this.profileForm.get('skills')?.value;
    return skills ? skills.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill) : [];
  }

  get certificationsArray(): FormArray {
    return this.profileForm.get('certifications') as FormArray;
  }

  createCertificationGroup(cert?: any): FormGroup {
    return this.fb.group({
      name: [cert?.name || '', Validators.required],
      issuer: [cert?.issuer || '', Validators.required],
      issue_date: [cert?.issue_date || ''],
      expiry_date: [cert?.expiry_date || ''],
      credential_id: [cert?.credential_id || ''],
      link: [cert?.link || '']
    });
  }

  addCertification(): void {
    this.certificationsArray.push(this.createCertificationGroup());
    this.profileForm.markAsDirty();
  }

  removeCertification(index: number): void {
    this.certificationsArray.removeAt(index);
    this.profileForm.markAsDirty();
  }

  getCertificationsArray(): any[] {
    return this.certificationsArray.value;
  }

  getExpertiseArray(): string[] {
    const expertise = this.profileForm.get('areaOfExpertise')?.value;
    return expertise ? expertise.split(',').map((area: string) => area.trim()).filter((area: string) => area) : [];
  }

  getWorkTypeDisplay(): string {
    const workType = this.profileForm.get('workType')?.value;
    return workType && workType.length > 0 ? workType.join(', ') : 'Not specified';
  }

  getEmploymentTypeDisplay(): string {
    const employmentType = this.profileForm.get('employmentType')?.value;
    return employmentType && employmentType.length > 0 ? employmentType.join(', ') : 'Not specified';
  }

  getCompletionPercentage(): number {
    const requiredFields = ['fullName', 'email', 'phone', 'location', 'currentJobTitle', 'experience', 'desiredJobTitle', 'skills'];
    const optionalFields = ['salaryRange', 'summary', 'workType', 'employmentType'];
    
    let completedRequired = 0;
    let completedOptional = 0;

    requiredFields.forEach(field => {
      const value = this.profileForm.get(field)?.value;
      if (value && (Array.isArray(value) ? value.length > 0 : value.trim())) {
        completedRequired++;
      }
    });

    optionalFields.forEach(field => {
      const value = this.profileForm.get(field)?.value;
      if (value && (Array.isArray(value) ? value.length > 0 : value.trim())) {
        completedOptional++;
      }
    });

    const requiredWeight = 0.8;
    const optionalWeight = 0.2;
    
    return Math.round(
      (completedRequired / requiredFields.length) * requiredWeight * 100 +
      (completedOptional / optionalFields.length) * optionalWeight * 100
    );
  }

  isBasicInfoComplete(): boolean {
    return !!(this.f['fullName'].value && this.f['email'].value && this.f['phone'].value && this.f['location'].value);
  }

  isProfessionalInfoComplete(): boolean {
    return !!(this.f['currentJobTitle'].value && this.f['skills'].value);
  }

  isJobPreferencesComplete(): boolean {
    const workType = this.f['workType'].value;
    const employmentType = this.f['employmentType'].value;
    return !!(workType && workType.length > 0 && employmentType && employmentType.length > 0);
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        return this.getPatternErrorMessage(fieldName);
      }
    }
    return '';
  }

  private getPatternErrorMessage(fieldName: string): string {
    switch (fieldName) {
      case 'phone':
        return 'Please enter a valid phone number (e.g., +1 (555) 123-4567)';
      case 'githubLink':
        return 'Please enter a valid GitHub URL (e.g., https://github.com/username)';
      case 'portfolioLink':
        return 'Please enter a valid URL (e.g., https://yourportfolio.com)';
      case 'youtubeChannel':
        return 'Please enter a valid YouTube channel URL (e.g., https://youtube.com/@username)';
      default:
        return 'Please enter a valid format';
    }
  }

  togglePanel(panel: string): void {
    // Close all panels first
    Object.keys(this.expandedPanels).forEach(key => {
      this.expandedPanels[key] = false;
    });
    
    // Open the selected panel
    this.expandedPanels[panel] = true;
  }

  getCompletionSteps() {
    return [
      {
        id: 'basic',
        label: 'Basic Info',
        completed: this.isBasicInfoComplete(),
        icon: 'person'
      },
      {
        id: 'professional',
        label: 'Professional',
        completed: this.isProfessionalInfoComplete(),
        icon: 'work'
      },
      {
        id: 'preferences',
        label: 'Preferences',
        completed: this.isJobPreferencesComplete(),
        icon: 'settings'
      }
    ];
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'fullName': 'Full Name',
      'email': 'Email',
      'phone': 'Phone Number',
      'location': 'Location',
      'currentJobTitle': 'Current Job Title',
      'experience': 'Years of Experience',
      'desiredJobTitle': 'Desired Job Title',
      'salaryRange': 'Expected Salary Range',
      'skills': 'Skills',
      'summary': 'Professional Summary',
      'certifications': 'Certifications',
      'areaOfExpertise': 'Area of Expertise',
      'githubLink': 'GitHub Profile',
      'portfolioLink': 'Portfolio Link',
      'youtubeChannel': 'YouTube Channel',
      'contributions': 'Key Contributions',
      'workType': 'Work Type',
      'employmentType': 'Employment Type'
    };
    return fieldNames[fieldName] || fieldName;
  }
}
