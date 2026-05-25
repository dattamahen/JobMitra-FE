import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormFieldConfig, FormConfig } from '../../interfaces/form.interfaces';
import { DateFieldComponent } from '../date-field/date-field.component';
import { emailValidator } from '../../../validators/email.validator';
import { mobileNumberValidator } from '../../../validators/mobile-number.validator';
import { linkedinUrlValidator } from '../../../validators/linkedin-url.validator';
import { githubUrlValidator } from '../../../validators/github-url.validator';
import { websiteUrlValidator } from '../../../validators/website-url.validator';

@Component({
	selector: 'app-dynamic-form',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCheckboxModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatDatepickerModule,
		MatNativeDateModule,
		DateFieldComponent
	],
	templateUrl: './dynamic-form.component.html',
	styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnChanges {
	@Input() config!: FormConfig;
	@Input() initialValues: any = {};
	@Input() submitButtonText = 'Submit';
	@Input() showBackButton = false;
	@Input() isSubmitting = false;
	@Input() readonly = false;
	@Output() formSubmit = new EventEmitter<any>();
	@Output() formChange = new EventEmitter<any>();
	@Output() backClick = new EventEmitter<void>();
	@Output() toggleEdit = new EventEmitter<void>();

	form!: FormGroup;
	showPassword = signal(false);

	constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

	ngOnInit() {
		
		if (!this.form) {
			this.buildForm();
		}
		

		
		// Only patch values if form was built and we have values
		if (this.form && this.initialValues && Object.keys(this.initialValues).length > 0) {
			setTimeout(() => {
				this.form.patchValue(this.initialValues, { emitEvent: false });
				// Mark all controls with values as touched and dirty to trigger label float
				Object.keys(this.form.controls).forEach(key => {
					const control = this.form.get(key);
					if (control?.value) {
						control.markAsTouched();
						control.markAsDirty();
					}
				});
				this.form.updateValueAndValidity();
				this.cdr.detectChanges();
			}, 100);
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		// Only build form if config exists and no form is built yet
		if (this.config && this.config.fields && !this.form) {
			this.buildForm();
		}
		
		// Rebuild form when initialValues change (for dynamic-array population)
		if (changes['initialValues'] && this.form) {
			const newValues = changes['initialValues'].currentValue;
			if (newValues && Object.keys(newValues).length > 0) {
				this.initialValues = { ...newValues };
				this.buildForm();
				if (this.readonly) {
					this.form.disable();
				}
				this.cdr.detectChanges();
			}
		}
		
		// Handle readonly state changes
		if (changes['readonly'] && this.form) {
			if (this.readonly) {
				this.form.disable();
			} else {
				this.form.enable();
				this.markAllFieldsAsTouched();
			}
		}
	}

	private buildForm() {
		if (!this.config?.fields) return;
		
		// Clear previous state
		this.arrayItems = {};
		const formControls: { [key: string]: [any, any[]] } = {};
		
		this.config.fields.forEach(field => {
			if (field.type === 'dynamic-array') {
				this.initializeArrayField(field, formControls);
			} else {
				const validators = this.getValidators(field);
				const initialValue = this.initialValues?.[field.name] || field.defaultValue || (field.type === 'checkbox' ? false : '');
				formControls[field.name] = [initialValue, validators];
			}
		});
		
		this.form = this.fb.group(formControls);
		this.form.valueChanges.subscribe(value => this.formChange.emit(value));
	}

	private initializeArrayField(field: any, formControls: { [key: string]: [any, any[]] }) {
		
		// Extract item IDs from initial values
		const itemIds = new Set<string>();
		Object.keys(this.initialValues || {}).forEach(key => {
			const match = key.match(new RegExp(`^${field.name}_(item_\\d+)_`));
			if (match) {
				itemIds.add(match[1]);
			}
		});
		
		if (itemIds.size > 0) {
			// Sort item IDs numerically
			const sortedIds = Array.from(itemIds).sort((a, b) => {
				const aNum = parseInt(a.split('_')[1]);
				const bNum = parseInt(b.split('_')[1]);
				return aNum - bNum;
			});
			
			this.arrayItems[field.name] = sortedIds;
			
			// Create controls for each item
			sortedIds.forEach(itemId => {
				this.createArrayItemControls(field, itemId, formControls);
			});
		} else {
			// No data - create single empty item
			this.arrayItems[field.name] = ['item_0'];
			this.createArrayItemControls(field, 'item_0', formControls);
		}    
	}

	private createArrayItemControls(field: FormFieldConfig, itemId: string, formControls: { [key: string]: [any, any[]] }) {
		if (field.fields) {
			field.fields.forEach(subField => {
				const controlName = `${field.name}_${itemId}_${subField.name}`;
				const validators = this.getValidators(subField);
				const initialValue = this.initialValues?.[controlName] || '';
				formControls[controlName] = [initialValue, validators];
			});
		}
	}

	private generateId(): string {
		const timestamp = Date.now().toString().slice(-6);
		return `item_${timestamp}`;
	}

	private getValidators(field: FormFieldConfig) {
		const validators = [];
		
		if (field.required) {
			validators.push(Validators.required);
		}
		
		if (field.type === 'email') {
			validators.push(emailValidator());
		}
		
		if (field.name === 'phone' || field.name === 'mobile') {
			validators.push(mobileNumberValidator());
		}
		
		if (field.name === 'linkedin' || field.name === 'linkedin_link') {
			validators.push(linkedinUrlValidator());
		}
		
		if (field.name === 'github' || field.name === 'github_link') {
			validators.push(githubUrlValidator());
		}
		
		if (field.name === 'portfolio' || field.name === 'portfolio_link' || field.name === 'website') {
			validators.push(websiteUrlValidator());
		}
		
		if (field.validators) {
			if (field.validators.minLength) {
				validators.push(Validators.minLength(field.validators.minLength));
			}
			if (field.validators.maxLength) {
				validators.push(Validators.maxLength(field.validators.maxLength));
			}
			if (field.validators.min !== undefined) {
				validators.push(Validators.min(field.validators.min));
			}
			if (field.validators.max !== undefined) {
				validators.push(Validators.max(field.validators.max));
			}
			if (field.validators.pattern) {
				validators.push(Validators.pattern(field.validators.pattern));
			}
		}
		
		return validators;
	}

	getInputType(field: FormFieldConfig): string {
		if (field.type === 'password') {
			return this.showPassword() ? 'text' : 'password';
		}
		if (field.type === 'number') {
			return 'number';
		}
		return field.type;
	}

	onBack(): void {
		this.backClick.emit();
	}

	onToggleEdit(): void {
		this.toggleEdit.emit();
	}

	getFieldClass(field: FormFieldConfig): string {
		// Use explicit width if provided
		if (field.width) {
			switch (field.width) {
				case 'half': return 'half-width';
				case 'quarter': return 'quarter-width';
				case 'three-quarter': return 'three-quarter-width';
				case 'full': return 'full-width';
				default: return 'full-width';
			}
		}
		
		// Default to full width for textareas
		if (field.type === 'textarea') {
			return 'full-width';
		}
		
		return 'full-width';
	}

	togglePasswordVisibility() {
		this.showPassword.update(show => !show);
	}

	getFieldError(fieldName: string): string {
		const field = this.form.get(fieldName);
		if (!field?.errors) return '';
		
		const fieldConfig = this.config.fields.find(f => f.name === fieldName);
		const fieldLabel = fieldConfig?.label || fieldName;
		
		if (field.errors['required']) {
			return `${fieldLabel} is required`;
		}
		if (field.errors['email']) {
			return 'Please enter a valid email address';
		}
		if (field.errors['minlength']) {
			return `${fieldLabel} must be at least ${field.errors['minlength'].requiredLength} characters`;
		}
		if (field.errors['maxlength']) {
			return `${fieldLabel} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
		}
		if (field.errors['min']) {
			return `${fieldLabel} must be at least ${field.errors['min'].min}`;
		}
		if (field.errors['max']) {
			return `${fieldLabel} must be no more than ${field.errors['max'].max}`;
		}
		if (field.errors['passwordMismatch']) {
			return 'Passwords do not match';
		}
		
		return 'Invalid input';
	}

	onSubmit() {
		
		if (this.form.valid) {
			this.formSubmit.emit(this.form.value);
		} else {
			Object.keys(this.form.controls).forEach(key => {
				const control = this.form.get(key);
				if (control?.errors) {
					console.log(`Field ${key} errors:`, control.errors);
				}
			});
			this.markAllFieldsAsTouched();
		}
	}

	private markAllFieldsAsTouched() {
		Object.keys(this.form.controls).forEach(key => {
			this.form.get(key)?.markAsTouched();
		});
	}

	get formValue() {
		return this.form.value;
	}

	get isValid() {
		return this.form.valid;
	}

	resetForm() {
		this.form.reset();
	}

	patchValue(values: any) {
		
		if (!values || Object.keys(values).length === 0) {
			return;
		}
		
		// Store values and rebuild form to ensure correct structure
		this.initialValues = { ...values };
		
		if (this.form) {
			this.buildForm();
		}
		
		this.cdr.detectChanges();
	}
	
	getArrayItems(fieldName: string): string[] {
		return this.arrayItems[fieldName] || [];
	}

	addArrayItem(fieldName: string): void {
		const field = this.config.fields.find(f => f.name === fieldName);
		if (!field?.fields) return;
		
		const itemId = this.generateId();
		
		field.fields.forEach(subField => {
			const controlName = `${fieldName}_${itemId}_${subField.name}`;
			const validators = this.getValidators(subField);
			this.form.addControl(controlName, this.fb.control('', validators));
		});
		
		this.arrayItems[fieldName].push(itemId);
	}

	removeArrayItem(fieldName: string, itemId: string): void {
		const field = this.config.fields.find(f => f.name === fieldName);
		if (!field?.fields || this.arrayItems[fieldName].length <= 1) return;
		
		field.fields.forEach(subField => {
			this.form.removeControl(`${fieldName}_${itemId}_${subField.name}`);
		});
		
		this.arrayItems[fieldName] = this.arrayItems[fieldName].filter(id => id !== itemId);
	}

	private arrayItems: {[key: string]: string[]} = {};
	


	hasFormControl(controlName: string): boolean {
		return this.form.contains(controlName);
	}

	canAddArrayItem(fieldName: string): boolean {
		const field = this.config.fields.find(f => f.name === fieldName);
		if (!field?.fields) return false;
		
		const lastItemId = this.arrayItems[fieldName]?.slice(-1)[0];
		if (!lastItemId) return true;
		
		// Check if all required fields in the last item are filled
		return field.fields.every(subField => {
			if (!subField.required) return true;
			const controlName = `${fieldName}_${lastItemId}_${subField.name}`;
			const control = this.form.get(controlName);
			return control?.value?.toString().trim();
		});
	}
}
