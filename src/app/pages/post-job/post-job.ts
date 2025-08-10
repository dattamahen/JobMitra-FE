import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

import { HrService } from '../../services/hr.service';
import { AuthService } from '../../services/auth.service';
import { JobPostingForm, JobPostingConverter } from '../../interfaces/job-posting.interface';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatStepperModule,
    MatDividerModule
  ],
  templateUrl: './post-job.html',
  styleUrl: './post-job.css'
})
export class PostJobPage implements OnInit {
  jobForm: FormGroup;
  isSubmitting = false;
  
  // Form options
  jobTypes = [
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' }
  ];
  
  employmentTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
  ];
  
  experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' },
    { value: 'executive', label: 'Executive' }
  ];
  
  currencies = [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' }
  ];
  
  salaryPeriods = [
    { value: 'yearly', label: 'Per Year' },
    { value: 'monthly', label: 'Per Month' },
    { value: 'hourly', label: 'Per Hour' }
  ];
  
  companySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
  ];
  
  industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Media & Entertainment',
    'Real Estate',
    'Transportation',
    'Energy',
    'Non-profit',
    'Government',
    'Other'
  ];
  
  commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java',
    'C#', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'HTML', 'CSS', 'SQL', 'MongoDB',
    'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
    'Git', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Windows', 'macOS',
    'Product Management', 'Project Management', 'Agile', 'Scrum', 'UI/UX Design',
    'Data Analysis', 'Machine Learning', 'AI', 'DevOps', 'Cybersecurity'
  ];
  
  commonBenefits = [
    'Health Insurance',
    'Dental Insurance',
    'Vision Insurance',
    'Life Insurance',
    'PF & ESI',
    'Flexible working hours',
    'Work from home',
    'Annual performance bonus',
    'Learning and development budget',
    'Paid time off',
    'Sick leave',
    'Maternity/Paternity leave',
    'Free meals',
    'Gym membership',
    'Stock options',
    'Equity participation',
    'Professional training',
    'Conference attendance',
    'Transportation allowance',
    'Internet allowance'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private hrService: HrService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.jobForm = this.createForm();
  }

  ngOnInit(): void {
    this.prefillHRInfo();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      // Basic Information
      title: ['', [Validators.required, Validators.minLength(3)]],
      company: ['', [Validators.required]],
      department: ['', [Validators.required]],
      
      // Location
      location: this.formBuilder.group({
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        country: ['India', [Validators.required]],
        timezone: ['IST', [Validators.required]]
      }),
      job_type: ['remote', [Validators.required]],
      
      // Employment Details
      employment_type: ['full-time', [Validators.required]],
      experience_level: ['mid', [Validators.required]],
      
      // Description
      description: ['', [Validators.required, Validators.minLength(50)]],
      responsibilities: this.formBuilder.array([this.formBuilder.control('', Validators.required)]),
      requirements: this.formBuilder.array([this.formBuilder.control('', Validators.required)]),
      
      // Skills
      skills_required: this.formBuilder.array([]),
      skills_preferred: this.formBuilder.array([]),
      
      // Salary
      salary: this.formBuilder.group({
        min: [0, [Validators.required, Validators.min(0)]],
        max: [0, [Validators.required, Validators.min(0)]],
        currency: ['INR', [Validators.required]],
        period: ['yearly', [Validators.required]],
        is_negotiable: [true]
      }),
      
      // Benefits
      benefits: this.formBuilder.array([]),
      
      // Company Info
      company_info: this.formBuilder.group({
        company_size: ['51-200', [Validators.required]],
        industry: ['Technology', [Validators.required]],
        website: [''],
        description: ['']
      }),
      
      // Application Details
      application_deadline: [''],
      application_instructions: [''],
      external_apply_url: [''],
      
      // HR Contact
      hr_contact: this.formBuilder.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
        title: ['', [Validators.required]],
        department: ['Human Resources', [Validators.required]]
      }),
      
      // Tags
      tags: this.formBuilder.array([]),
      
      // Status
      is_active: [true]
    });
  }

  private prefillHRInfo(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser) {
      const hrContactGroup = this.jobForm.get('hr_contact') as FormGroup;
      hrContactGroup.patchValue({
        name: currentUser.full_name || '',
        email: currentUser.email || '',
        title: 'HR Manager',
        department: 'Human Resources'
      });
      
      this.jobForm.patchValue({
        company: currentUser.company_name || ''
      });
    }
  }

  // FormArray getters
  get responsibilities(): FormArray {
    return this.jobForm.get('responsibilities') as FormArray;
  }

  get requirements(): FormArray {
    return this.jobForm.get('requirements') as FormArray;
  }

  get skillsRequired(): FormArray {
    return this.jobForm.get('skills_required') as FormArray;
  }

  get skillsPreferred(): FormArray {
    return this.jobForm.get('skills_preferred') as FormArray;
  }

  get benefits(): FormArray {
    return this.jobForm.get('benefits') as FormArray;
  }

  get tags(): FormArray {
    return this.jobForm.get('tags') as FormArray;
  }

  // Array manipulation methods
  addResponsibility(): void {
    this.responsibilities.push(this.formBuilder.control('', Validators.required));
  }

  removeResponsibility(index: number): void {
    this.responsibilities.removeAt(index);
  }

  addRequirement(): void {
    this.requirements.push(this.formBuilder.control('', Validators.required));
  }

  removeRequirement(index: number): void {
    this.requirements.removeAt(index);
  }

  addSkill(type: 'required' | 'preferred', skill: string): void {
    if (!skill.trim()) return;
    
    const skillsArray = type === 'required' ? this.skillsRequired : this.skillsPreferred;
    const skillExists = skillsArray.value.includes(skill);
    
    if (!skillExists) {
      skillsArray.push(this.formBuilder.control(skill));
    }
  }

  removeSkill(type: 'required' | 'preferred', index: number): void {
    const skillsArray = type === 'required' ? this.skillsRequired : this.skillsPreferred;
    skillsArray.removeAt(index);
  }

  addBenefit(benefit: string): void {
    if (!benefit.trim()) return;
    
    const benefitExists = this.benefits.value.includes(benefit);
    if (!benefitExists) {
      this.benefits.push(this.formBuilder.control(benefit));
    }
  }

  removeBenefit(index: number): void {
    this.benefits.removeAt(index);
  }

  addTag(tag: string): void {
    if (!tag.trim()) return;
    
    const tagExists = this.tags.value.includes(tag);
    if (!tagExists) {
      this.tags.push(this.formBuilder.control(tag));
    }
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  // Form submission
  async onSubmit(): Promise<void> {
    if (this.jobForm.invalid) {
      this.markFormGroupTouched(this.jobForm);
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = this.jobForm.value as JobPostingForm;
      const apiRequest = JobPostingConverter.formToApiRequest(formValue);
      
      const result = await this.hrService.createJob(apiRequest);
      
      this.snackBar.open('Job posted successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      
      // Navigate back to dashboard or job listings
      this.router.navigate(['/dashboard']);
      
    } catch (error: any) {
      console.error('Error posting job:', error);
      this.snackBar.open(error.message || 'Failed to post job. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl, index) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Helper methods for template
  getErrorMessage(controlName: string, nestedPath?: string): string {
    const control = nestedPath 
      ? this.jobForm.get(`${controlName}.${nestedPath}`)
      : this.jobForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `Minimum ${requiredLength} characters required`;
    }
    if (control?.hasError('min')) {
      return 'Value must be greater than 0';
    }
    return '';
  }
}
