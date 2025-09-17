import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectorRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea';
  placeholder?: string;
  required?: boolean;
  validators?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: { value: any; label: string }[];
  icon?: string;
  hint?: string;
  rows?: number;
  cssClass?: string;
  width?: 'full' | 'half' | 'quarter' | 'three-quarter';
  readonly?: boolean;
}

export interface FormConfig {
  title?: string;
  fields: FormFieldConfig[];
  submitLabel?: string;
  loading?: boolean;
  readonly?: boolean;
}

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
    MatProgressSpinnerModule
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dynamic-form">
      @if (config.title) {
        <h3>{{ config.title }}</h3>
      }
      
      <div class="form-row">
        @for (field of config.fields; track field.name) {
          <div [class]="getFieldClass(field)">
          @switch (field.type) {
            @case ('checkbox') {
              <mat-checkbox [formControlName]="field.name">
                {{ field.label }}
              </mat-checkbox>
            }
            @default {
              <mat-form-field appearance="outline" class="full-width" [class.readonly]="readonly || !!field.readonly">
                <mat-label>{{ field.label }}{{ field.required ? ' *' : '' }}</mat-label>
                
                @switch (field.type) {
                  @case ('select') {
                    <mat-select [formControlName]="field.name" [disabled]="readonly || !!field.readonly">
                      @for (option of field.options; track option.value) {
                        <mat-option [value]="option.value">
                          {{ option.label }}
                        </mat-option>
                      }
                    </mat-select>
                  }
                  @case ('textarea') {
                    <textarea 
                      matInput 
                      [formControlName]="field.name" 
                      [placeholder]="field.placeholder || ''"
                      [rows]="field.rows || 3"
                      [readonly]="readonly || !!field.readonly">
                    </textarea>
                  }
                  @case ('number') {
                    <input 
                      matInput 
                      type="number" 
                      [formControlName]="field.name" 
                      [placeholder]="field.placeholder || ''"
                      [readonly]="readonly || !!field.readonly">
                  }
                  @default {
                    <input 
                      matInput 
                      [type]="getInputType(field)" 
                      [formControlName]="field.name" 
                      [placeholder]="field.placeholder || ''"
                      [readonly]="readonly || !!field.readonly">
                  }
                }
                
                @if (field.icon) {
                  <mat-icon matSuffix [class.password-toggle]="field.type === 'password'" 
                           (click)="field.type === 'password' ? togglePasswordVisibility() : null">
                    {{ field.type === 'password' ? (showPassword() ? 'visibility_off' : 'visibility') : field.icon }}
                  </mat-icon>
                }
                
                @if (field.hint) {
                  <mat-hint>{{ field.hint }}</mat-hint>
                }
                
                @if (form.get(field.name)?.errors && form.get(field.name)?.touched) {
                  <mat-error>{{ getFieldError(field.name) }}</mat-error>
                }
              </mat-form-field>
            }
          }
          </div>
        }
      </div>
      
      <div class="form-actions">
        @if (showBackButton) {
          <button 
            mat-button 
            type="button" 
            (click)="onBack()">
            Back
          </button>
        }
        
        @if (readonly) {
          <button 
            mat-raised-button 
            color="primary" 
            type="button" 
            class="submit-btn"
            (click)="onToggleEdit()">
            <mat-icon>edit</mat-icon>
            <span>Edit {{ config.title || 'Info' }}</span>
          </button>
        } @else {
          <button 
            mat-raised-button 
            color="primary" 
            type="submit" 
            class="submit-btn"
            [disabled]="form.invalid || isSubmitting">
            @if (isSubmitting) {
              <mat-spinner diameter="20"></mat-spinner>
            }
            @if (!isSubmitting) {
              <span>{{ submitButtonText }}</span>
            }
          </button>
        }
      </div>
    </form>
  `,
  styles: [`
    .dynamic-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .form-field {
      width: 100%;
    }
    
    .form-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .half-width {
      flex: 1;
    }
    
    .full-width {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 16px;
    }
    
    .submit-btn {
      min-width: 120px;
    }
    
    .half-width {
      width: 48%;
    }
    
    .quarter-width {
      width: 23%;
    }
    
    .three-quarter-width {
      width: 73%;
    }
    
    mat-spinner {
      margin-right: 8px;
    }
    
    .password-toggle {
      cursor: pointer;
    }
    
    .mat-mdc-form-field.readonly {
      opacity: 0.6;
      pointer-events: none;
    }
    
    .mat-mdc-form-field.readonly .mat-mdc-text-field-wrapper {
      background-color: #f5f5f5;
    }
    
    .mat-mdc-form-field.readonly input,
    .mat-mdc-form-field.readonly textarea {
      color: #666;
      cursor: default;
    }
  `]
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
    this.buildForm();
  }

  ngOnChanges() {
    if (this.form && this.initialValues && Object.keys(this.initialValues).length > 0) {
      console.log('Dynamic form patching values:', this.initialValues);
      this.form.patchValue(this.initialValues);
      this.cdr.detectChanges();
    }
  }

  private buildForm() {
    const formControls: any = {};
    
    this.config.fields.forEach(field => {
      const validators = [];
      
      if (field.required) {
        validators.push(Validators.required);
      }
      
      if (field.type === 'email') {
        validators.push(Validators.email);
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
      
      const initialValue = this.initialValues?.[field.name] || 
        (field.type === 'checkbox' ? false : '');
      
      formControls[field.name] = [initialValue, validators];
    });
    
    this.form = this.fb.group(formControls);
    
    this.form.valueChanges.subscribe(value => {
      this.formChange.emit(value);
    });
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
    
    return 'Invalid input';
  }

  onSubmit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    } else {
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
    this.form.patchValue(values);
  }
}