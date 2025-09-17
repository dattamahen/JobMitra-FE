import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
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
import { UserService, UserProfile, UpdateUserRequest } from '../../services';
import { AuthService } from '../../services/auth.service';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form.component';
import { PROFILE_BASIC_INFO_CONFIG, PROFILE_PROFESSIONAL_CONFIG, PROFILE_JOB_PREFERENCES_CONFIG } from '../../shared/components/dynamic-form/form-configs';

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
    MatSnackBarModule,
    DynamicFormComponent
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfilePage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('basicForm') basicForm!: DynamicFormComponent;
  @ViewChild('professionalForm') professionalForm!: DynamicFormComponent;
  @ViewChild('jobPreferencesForm') jobPreferencesForm!: DynamicFormComponent;
  profileForm!: FormGroup;
  currentUser: UserProfile | null = null;
  isLoading = false;
  isSaving = false;
  private destroy$ = new Subject<void>();
  
  // Form configurations
  basicInfoConfig = PROFILE_BASIC_INFO_CONFIG;
  professionalConfig = PROFILE_PROFESSIONAL_CONFIG;
  jobPreferencesConfig = PROFILE_JOB_PREFERENCES_CONFIG;
  
  // Edit mode states
  isBasicInfoEditing = false;
  isProfessionalEditing = false;
  isJobPreferencesEditing = false;

  // Dynamic form handlers
  onBasicInfoSubmit(formData: any): void {
    const updateData: any = {};
    
    // Basic Personal Information - strings
    if (formData.first_name?.trim()) updateData.first_name = formData.first_name.trim();
    if (formData.last_name?.trim()) updateData.last_name = formData.last_name.trim();
    if (formData.phone?.trim()) updateData.phone = formData.phone.trim();
    
    // Direct city/state fields (backend supports both direct and nested)
    if (formData.city?.trim()) updateData.city = formData.city.trim();
    if (formData.state?.trim()) updateData.state = formData.state.trim();
    
    // date_of_birth - datetime (ISO string)
    if (formData.date_of_birth?.trim()) {
      try {
        const date = new Date(formData.date_of_birth);
        if (!isNaN(date.getTime())) {
          updateData.date_of_birth = date.toISOString();
        }
      } catch (e) {
        console.warn('Invalid date format:', formData.date_of_birth);
      }
    }
    
    console.log('Basic Info Update Data:', updateData);
    this.updateProfile(updateData, 'Basic information updated successfully!');
    this.isBasicInfoEditing = false;
  }

  onBasicInfoToggleEdit(): void {
    this.isBasicInfoEditing = !this.isBasicInfoEditing;
  }

  onProfessionalSubmit(formData: any): void {
    const updateData: any = {};
    
    // Legacy compatibility fields - strings
    if (formData.current_role?.trim()) updateData.current_role = formData.current_role.trim();
    if (formData.current_company?.trim()) updateData.current_company = formData.current_company.trim();
    if (formData.professional_summary?.trim()) updateData.professional_summary = formData.professional_summary.trim();
    
    // Professional Information - int (must be >= 0)
    if (formData.overall_experience_years !== undefined && formData.overall_experience_years !== null && formData.overall_experience_years !== '') {
      const exp = Number(formData.overall_experience_years);
      if (!isNaN(exp) && exp >= 0) {
        updateData.overall_experience_years = Math.floor(exp);
      }
    }
    
    // highest_qualification - string
    if (formData.highest_qualification?.trim()) updateData.highest_qualification = formData.highest_qualification.trim();
    
    // Social Links - strings
    if (formData.linkedin_link?.trim()) updateData.linkedin_link = formData.linkedin_link.trim();
    if (formData.github_link?.trim()) updateData.github_link = formData.github_link.trim();
    
    this.updateProfile(updateData, 'Professional information updated successfully!');
    this.isProfessionalEditing = false;
  }

  onProfessionalToggleEdit(): void {
    this.isProfessionalEditing = !this.isProfessionalEditing;
  }

  onJobPreferencesSubmit(formData: any): void {
    const updateData: any = {};
    
    // Preferences - List[Literal] (arrays of specific string values)
    if (formData.job_preferences?.trim()) {
      const validPrefs = ['remote', 'hybrid', 'on-site'];
      if (validPrefs.includes(formData.job_preferences)) {
        updateData.job_preferences = [formData.job_preferences];
      }
    }
    
    if (formData.employment_type?.trim()) {
      const validTypes = ['full-time', 'part-time', 'freelancing', 'contract'];
      if (validTypes.includes(formData.employment_type)) {
        updateData.employment_type = [formData.employment_type];
      }
    }
    
    // Legacy compatibility - expected_salary as float
    if (formData.expected_salary !== undefined && formData.expected_salary !== null && formData.expected_salary !== '') {
      const salary = Number(formData.expected_salary);
      if (!isNaN(salary) && salary >= 0) {
        updateData.expected_salary = salary;
      }
    }
    
    // Legacy compatibility - desired_job_title as string
    if (formData.desired_job_title?.trim()) updateData.desired_job_title = formData.desired_job_title.trim();
    
    this.updateProfile(updateData, 'Job preferences updated successfully!');
    this.isJobPreferencesEditing = false;
  }

  onJobPreferencesToggleEdit(): void {
    this.isJobPreferencesEditing = !this.isJobPreferencesEditing;
  }

  private updateProfile(updateData: any, successMessage: string): void {
    this.isSaving = true;
    
    this.userService.updateCurrentUser(updateData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSaving = false)
      )
      .subscribe({
        next: () => {
          this.snackBar.open(successMessage, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Refresh user data after successful update
          this.loadUserProfile();
        },
        error: (error) => {
          this.snackBar.open('Error updating profile. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  basicInfoValues: any = {};
  professionalValues: any = {};
  jobPreferencesValues: any = {};

  private updateFormValues(): void {
    const user = this.currentUser as any;
    console.log('Updating form values with user:', user);
    
    this.basicInfoValues = {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      // Check both direct fields and nested personal_info structure
      city: user?.city || user?.personal_info?.location?.city || '',
      state: user?.state || user?.personal_info?.location?.state || '',
      date_of_birth: user?.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : ''
    };
    console.log('Basic info values:', this.basicInfoValues);

    this.professionalValues = {
      // Check both direct fields and nested professional_info structure
      current_role: user?.current_role || user?.professional_info?.current_role || '',
      current_company: user?.current_company || user?.professional_info?.current_company || '',
      overall_experience_years: user?.overall_experience_years || 0,
      highest_qualification: user?.highest_qualification || '',
      professional_summary: user?.professional_summary || user?.professional_info?.professional_summary || '',
      linkedin_link: user?.linkedin_link || user?.social_links?.linkedin || '',
      github_link: user?.github_link || user?.social_links?.github || ''
    };
    console.log('Professional values:', this.professionalValues);

    this.jobPreferencesValues = {
      job_preferences: user?.job_preferences?.[0] || '',
      employment_type: user?.employment_type?.[0] || '',
      expected_salary: user?.expected_salary || user?.professional_info?.expected_salary || 0,
      desired_job_title: user?.desired_job_title || user?.professional_info?.desired_job_title || ''
    };
    console.log('Job preferences values:', this.jobPreferencesValues);
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngAfterViewInit(): void {
    // Forms are now available
  }

  private updateDynamicForms(): void {
    setTimeout(() => {
      if (this.basicForm) {
        this.basicForm.patchValue(this.basicInfoValues);
      }
      if (this.professionalForm) {
        this.professionalForm.patchValue(this.professionalValues);
      }
      if (this.jobPreferencesForm) {
        this.jobPreferencesForm.patchValue(this.jobPreferencesValues);
      }
    }, 100);
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

  private loadUserProfile(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    
    this.isLoading = true;
    this.authService.getCurrentUser()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (user: any) => {
          this.currentUser = user as any;
          this.updateFormValues();
          this.updateDynamicForms();
        },
        error: (error: any) => {
          if (error.status === 401) {
            this.authService.clearAllAuthData();
          }
          this.snackBar.open('Error loading profile data', 'Close', { duration: 3000 });
        }
      });
  }

  private convertToUserProfile(user: any): any {
    return {
      full_name: user.full_name || `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone: user.phone || user.personal_info?.phone,
      location: { city: user.personal_info?.location?.city || user.city || '' },
      professional_summary: user.professional_info?.professional_summary,
      current_job_title: user.professional_info?.current_role,
      experience_years: user.professional_info?.total_experience,
      social_links: user.social_links || {},
      expected_salary: { min: user.professional_info?.expected_salary || 0 },
      desired_job_title: user.professional_info?.desired_job_title,
      preferred_work_types: user.job_preferences || [user.preferences?.remote_preference || 'hybrid'],
      preferred_employment_types: user.employment_type || ['full-time']
    };
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

  // Getter methods for profile summary section
  getFullName(): string {
    const user = this.currentUser as any;
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
  }

  getCurrentRole(): string {
    const user = this.currentUser as any;
    return user?.current_role || user?.professional_info?.current_role || '';
  }

  getLocation(): string {
    const user = this.currentUser as any;
    const city = user?.city || user?.personal_info?.location?.city || '';
    const state = user?.state || user?.personal_info?.location?.state || '';
    return [city, state].filter(Boolean).join(', ');
  }

  getExperience(): string {
    const user = this.currentUser as any;
    return user?.overall_experience_years?.toString() || '0';
  }

  getProfessionalSummary(): string {
    const user = this.currentUser as any;
    return user?.professional_summary || user?.professional_info?.professional_summary || '';
  }

  getSkills(): string[] {
    const user = this.currentUser as any;
    return user?.skills || [];
  }

  getEmail(): string {
    const user = this.currentUser as any;
    return user?.email || '';
  }

  getPhone(): string {
    const user = this.currentUser as any;
    return user?.phone || '';
  }

  getGithubLink(): string {
    const user = this.currentUser as any;
    return user?.github_link || user?.social_links?.github || '';
  }

  getLinkedinLink(): string {
    const user = this.currentUser as any;
    return user?.linkedin_link || user?.social_links?.linkedin || '';
  }

  getJobPreferences(): string {
    const user = this.currentUser as any;
    return user?.job_preferences?.[0] || '';
  }

  getEmploymentType(): string {
    const user = this.currentUser as any;
    return user?.employment_type?.[0] || '';
  }

  getExpectedSalary(): string {
    const user = this.currentUser as any;
    const salary = user?.expected_salary || user?.professional_info?.expected_salary;
    return salary ? `₹${salary.toLocaleString()}` : '';
  }

  getCompletionPercentage(): number {
    if (!this.currentUser) return 0;
    
    const fields = [
      this.getFullName(),
      this.getEmail(),
      this.getPhone(),
      this.getCurrentRole(),
      this.getSkills().length > 0,
      this.getLocation(),
      this.getProfessionalSummary(),
      this.getExperience() !== '0'
    ];

    const completedFields = fields.filter(field => 
      field !== undefined && field !== null && field !== '' && field !== false
    ).length;

    return Math.round((completedFields / fields.length) * 100);
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
    // Method kept for compatibility but not used with dynamic forms
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
