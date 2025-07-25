import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { PROFILE_FORM_DATA, PROFILE_FORM_FIELDS, ProfileFormData, FormFieldConfig } from '../../data/profile-data';

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
    MatExpansionModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfilePage {
  profileForm: FormGroup;
  expandedPanels: { [key: string]: boolean } = {
    basic: true,
    professional: false,
    preferences: false
  };
  
  formData: ProfileFormData = PROFILE_FORM_DATA;
  formFields = PROFILE_FORM_FIELDS;

  constructor(private fb: FormBuilder) {
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
      certifications: [''],
      areaOfExpertise: [''],
      githubLink: ['', [Validators.pattern(/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/)]],
      portfolioLink: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      youtubeChannel: ['', [Validators.pattern(/^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_-]+\/?$/)]],
      contributions: ['', [Validators.maxLength(1000)]],
      workType: [[]],
      employmentType: [[]]
    });
  }

  // Getter for easy access to form controls
  get f() { return this.profileForm.controls; }

  saveProfile(): void {
    if (this.profileForm.valid) {
      console.log('Profile saved:', this.profileForm.value);
      // Here you would typically send the data to a service
    } else {
      this.markFormGroupTouched();
    }
  }

  resetForm(): void {
    if (confirm('Are you sure you want to reset all changes?')) {
      this.profileForm.reset();
    }
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

  getCertificationsArray(): string[] {
    const certifications = this.profileForm.get('certifications')?.value;
    return certifications ? certifications.split(',').map((cert: string) => cert.trim()).filter((cert: string) => cert) : [];
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
        return 'Please enter a valid phone number';
      }
    }
    return '';
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
      'skills': 'Skills',
      'summary': 'Professional Summary'
    };
    return fieldNames[fieldName] || fieldName;
  }
}
