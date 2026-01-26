import { Component, signal, viewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

// import { HrService } from '../../services/hr.service';
// import { AuthService } from '../../services/auth.service';
// import { JobPostingForm, JobPostingConverter } from '../../interfaces/job-posting.interface';
// import { JOB_VALIDATION } from '../../constants/validation.constants';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form.component';
import { POST_JOB_STEP1_CONFIG, POST_JOB_STEP2_CONFIG, POST_JOB_STEP3_CONFIG, POST_JOB_STEP5_CONFIG, POST_JOB_STEP6_CONFIG, POST_JOB_STEP7_CONFIG } from '../../shared/components/dynamic-form/form-configs';
import { JOB_TYPES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, CURRENCIES, SALARY_PERIODS, COMPANY_SIZES, INDUSTRIES, COMMON_SKILLS, COMMON_BENEFITS } from '../../data/post-job-options';
import { HrService } from '../../services/hr.service';
import { JOB_VALIDATION } from '../../constants/validation.constants';

@Component({
	selector: 'app-post-job',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatCardModule,
		MatButtonModule,
		MatChipsModule,
		MatIconModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatSnackBarModule,
		MatStepperModule,
		MatDividerModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		DynamicFormComponent
	],
	templateUrl: './post-job.html',
	styleUrl: './post-job.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostJobPage {
	jobForm: FormGroup;
	isSubmitting = false;
	currentStep = signal(0);
	
	stepper = viewChild.required<MatStepper>('stepper');
	
	private formBuilder = inject(FormBuilder);
	private router = inject(Router);
	private snackBar = inject(MatSnackBar);
	private hrService = inject(HrService);
	
	// Form configurations
	step1Config = POST_JOB_STEP1_CONFIG;
	step2Config = POST_JOB_STEP2_CONFIG;
	step3Config = POST_JOB_STEP3_CONFIG;
	step5Config = POST_JOB_STEP5_CONFIG;
	step6Config = POST_JOB_STEP6_CONFIG;
	step7Config = POST_JOB_STEP7_CONFIG;
	
	// Make validation constants available to template
	public readonly JOB_VALIDATION = JOB_VALIDATION;
	
	// Form options from data file
	jobTypes = JOB_TYPES;
	employmentTypes = EMPLOYMENT_TYPES;
	experienceLevels = EXPERIENCE_LEVELS;
	currencies = CURRENCIES;
	salaryPeriods = SALARY_PERIODS;
	companySizes = COMPANY_SIZES;
	industries = INDUSTRIES;
	commonSkills = COMMON_SKILLS;
	commonBenefits = COMMON_BENEFITS;

	validationErrors = signal<Map<string, string>>(new Map());

	constructor() {
		this.jobForm = this.createForm();
		this.prefillHRInfo();
	}

	// Dynamic form handlers
	onStep1Submit(formData: any): void {
		this.updateFormData(formData);
		this.stepper().next();
	}

	onStep2Submit(formData: any): void {
		this.updateFormData(formData);
		this.stepper().next();
	}

	onStep3Submit(formData: any): void {
		this.updateFormData(formData);
		this.stepper().next();
	}

	onStep5Submit(formData: any): void {
		this.updateFormData(formData);
		this.stepper().next();
	}

	onStep6Submit(formData: any): void {
		this.updateFormData(formData);
		this.stepper().next();
	}

	onStep7Submit(formData: any): void {
		this.updateFormData(formData);
		this.onSubmit();
	}

	private updateFormData(formData: any): void {
		console.log('Updating form with data:', formData);
		
		// Convert dot notation to nested objects
		const nestedData: any = {};
		Object.keys(formData).forEach(key => {
			if (key.includes('.')) {
				// Handle nested fields like 'location.city'
				const parts = key.split('.');
				let current = nestedData;
				for (let i = 0; i < parts.length - 1; i++) {
					if (!current[parts[i]]) {
						current[parts[i]] = {};
					}
					current = current[parts[i]];
				}
				current[parts[parts.length - 1]] = formData[key];
			} else {
				nestedData[key] = formData[key];
			}
		});
		
		console.log('Nested data:', nestedData);
		this.jobForm.patchValue(nestedData, { emitEvent: false });
		console.log('Form value after update:', this.jobForm.value);
	}



	previousStep(): void {
		this.stepper().previous();
	}

	private createForm(): FormGroup {
		return this.formBuilder.group({
			// Basic Information
			title: ['', [Validators.required, Validators.minLength(JOB_VALIDATION.TITLE.MIN_LENGTH), Validators.maxLength(JOB_VALIDATION.TITLE.MAX_LENGTH)]],
			company: ['', [Validators.required, Validators.minLength(JOB_VALIDATION.COMPANY.MIN_LENGTH), Validators.maxLength(JOB_VALIDATION.COMPANY.MAX_LENGTH)]],
			
			// Location
			location: this.formBuilder.group({
				city: ['', [Validators.required]],
				state: ['', [Validators.required]],
				country: ['India', [Validators.required]],
				timezone: ['IST']
			}),
			job_type: ['remote', [Validators.required]],
			
			// Employment Details
			employment_type: ['full-time', [Validators.required]],
			experience_level: ['mid', [Validators.required]],
			
			// Description
			description: ['', [Validators.required, Validators.minLength(JOB_VALIDATION.DESCRIPTION.MIN_LENGTH), Validators.maxLength(JOB_VALIDATION.DESCRIPTION.MAX_LENGTH)]],
			responsibilities: this.formBuilder.array([
				this.formBuilder.control('Manage and execute assigned tasks'),
				this.formBuilder.control('Collaborate with team members'),
				this.formBuilder.control('Deliver high-quality work on time')
			]),
			requirements: this.formBuilder.array([
				this.formBuilder.control('Bachelor degree or equivalent experience'),
				this.formBuilder.control('Strong communication skills'),
				this.formBuilder.control('Ability to work independently')
			]),
			
			// Skills
			skills_required: this.formBuilder.array([]),
			skills_preferred: this.formBuilder.array([]),
			
			// Salary
			salary: this.formBuilder.group({
				min: [0],
				max: [0],
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
		// Add default skills to meet minimum requirements
		this.addSkill('required', 'Communication Skills');
		this.addSkill('required', 'Problem Solving');
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
		if (this.responsibilities.length > JOB_VALIDATION.RESPONSIBILITIES.MIN_ITEMS) {
			this.responsibilities.removeAt(index);
		}
	}

	addRequirement(): void {
		this.requirements.push(this.formBuilder.control('', Validators.required));
	}

	removeRequirement(index: number): void {
		if (this.requirements.length > JOB_VALIDATION.REQUIREMENTS.MIN_ITEMS) {
			this.requirements.removeAt(index);
		}
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
		console.log('=== Form Submission Debug ===');
		console.log('Form Valid:', this.jobForm.valid);
		console.log('Form Value:', this.jobForm.value);
		
		const formErrors = this.getFormValidationErrors();
		console.log('Form Errors:', formErrors);
		
		// Show specific missing fields
		if (Object.keys(formErrors).length > 0) {
			console.error('❌ Invalid fields:');
			Object.keys(formErrors).forEach(field => {
				console.error(`  - ${field}:`, formErrors[field]);
			});
		}
		
		// Custom validation for arrays
		const validationErrors = this.validateArrayFields();
		console.log('Array Validation Errors:', validationErrors);
		
		if (this.jobForm.invalid || validationErrors.length > 0) {
			this.markFormGroupTouched(this.jobForm);
			
			// Create detailed error message
			const fieldErrors = Object.keys(formErrors).map(field => {
				const errorTypes = Object.keys(formErrors[field]);
				return `${field} (${errorTypes.join(', ')})`;
			});
			
			const allErrors = [...fieldErrors, ...validationErrors];
			const errorMessage = allErrors.length > 0 
				? `Missing required fields: ${allErrors.join(', ')}`
				: 'Please fill in all required fields';
			
			console.error('Validation failed:', errorMessage);
			this.snackBar.open(errorMessage, 'Close', {
				duration: 10000,
				panelClass: ['error-snackbar']
			});
			return;
		}

		this.isSubmitting = true;
		this.validationErrors.set(new Map());

		try {
			const jobData = { ...this.jobForm.value };
			
			// Clean up empty string fields that should be null
			if (jobData.application_deadline === '') {
				delete jobData.application_deadline;
			}
			if (jobData.external_apply_url === '') {
				delete jobData.external_apply_url;
			}
			if (jobData.application_instructions === '') {
				delete jobData.application_instructions;
			}
			
			console.log('Submitting job data:', jobData);
			const result = await this.hrService.createJob(jobData);
			console.log('Job created successfully:', result);
			
			this.snackBar.open('Job posted successfully!', 'Close', {
				duration: 3000,
				panelClass: ['success-snackbar']
			});
			
			this.router.navigate(['/my-jobs']);
			
		} catch (error: any) {
			this.isSubmitting = false;
			console.error('Error posting job:', error);
			
			// Handle validation errors from backend
			if (error.error?.errors && Array.isArray(error.error.errors)) {
				this.handleBackendValidationErrors(error.error);
			} else {
				const errorMsg = error.message || error.error?.detail || 'Failed to post job. Please try again.';
				this.snackBar.open(errorMsg, 'Close', {
					duration: 5000,
					panelClass: ['error-snackbar']
				});
			}
		}
	}

	private getFormValidationErrors(): any {
		const errors: any = {};
		const getErrors = (group: FormGroup | FormArray, path: string = '') => {
			if (group instanceof FormGroup) {
				Object.keys(group.controls).forEach(key => {
					const control = group.get(key);
					const fullPath = path ? `${path}.${key}` : key;
					
					if (control instanceof FormGroup || control instanceof FormArray) {
						getErrors(control, fullPath);
					} else if (control && control.errors) {
						errors[fullPath] = control.errors;
					}
				});
			}
		};
		getErrors(this.jobForm);
		return errors;
	}

	private handleBackendValidationErrors(errorResponse: any): void {
		const errorMap = new Map<string, string>();
		const errorMessages: string[] = [];
		
		errorResponse.errors.forEach((error: any) => {
			const fieldPath = error.field.replace(/ -> /g, '.');
			errorMap.set(fieldPath, error.message);
			errorMessages.push(`${error.field}: ${error.message}`);
		});

		this.validationErrors.set(errorMap);
		
		const message = `Validation failed (${errorResponse.error_count} errors):\n${errorMessages.join('\n')}`;
		this.snackBar.open(message, 'Close', {
			duration: 10000,
			panelClass: ['error-snackbar']
		});
		
		// Scroll to first error
		setTimeout(() => {
			const firstError = document.querySelector('.field-error');
			if (firstError) {
				firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}, 100);
	}

	hasFieldError(fieldName: string): boolean {
		return this.validationErrors().has(fieldName);
	}

	getFieldError(fieldName: string): string | undefined {
		return this.validationErrors().get(fieldName);
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

	private validateArrayFields(): string[] {
		const errors: string[] = [];
		
		const validRequirements = this.requirements.value.filter((req: string) => req && req.trim());
		if (validRequirements.length < JOB_VALIDATION.REQUIREMENTS.MIN_ITEMS) {
			errors.push(`At least ${JOB_VALIDATION.REQUIREMENTS.MIN_ITEMS} requirements are needed`);
		}
		
		const validResponsibilities = this.responsibilities.value.filter((resp: string) => resp && resp.trim());
		if (validResponsibilities.length < JOB_VALIDATION.RESPONSIBILITIES.MIN_ITEMS) {
			errors.push(`At least ${JOB_VALIDATION.RESPONSIBILITIES.MIN_ITEMS} responsibilities are needed`);
		}
		
		if (this.skillsRequired.length < JOB_VALIDATION.SKILLS_REQUIRED.MIN_ITEMS) {
			errors.push(`At least ${JOB_VALIDATION.SKILLS_REQUIRED.MIN_ITEMS} required skills are needed`);
		}
		
		return errors;
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
