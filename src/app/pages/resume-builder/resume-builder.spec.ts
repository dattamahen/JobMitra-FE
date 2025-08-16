import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

import { ResumeBuilderPage } from './resume-builder';
import { ResumeService } from '../../services/resume.service';

describe('ResumeBuilderPage', () => {
  let component: ResumeBuilderPage;
  let fixture: ComponentFixture<ResumeBuilderPage>;
  let resumeService: jasmine.SpyObj<ResumeService>;

  beforeEach(async () => {
    const resumeServiceSpy = jasmine.createSpyObj('ResumeService', [
      'getUserResumes',
      'getResume',
      'createResume',
      'updateResume',
      'setCurrentResume',
      'setLoading',
      'setActiveSection',
      'calculateCompletionPercentage'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        ResumeBuilderPage,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule
      ],
      providers: [
        { provide: ResumeService, useValue: resumeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResumeBuilderPage);
    component = fixture.componentInstance;
    resumeService = TestBed.inject(ResumeService) as jasmine.SpyObj<ResumeService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize forms on construction', () => {
    expect(component.personalInfoForm).toBeDefined();
    expect(component.summaryForm).toBeDefined();
    expect(component.skillsForm).toBeDefined();
  });

  it('should have correct section definitions', () => {
    expect(component.sections).toHaveSize(7);
    expect(component.sections[0].id).toBe('personal_info');
    expect(component.sections[0].required).toBe(true);
  });

  it('should validate personal info form correctly', () => {
    const form = component.personalInfoForm;
    
    // Initially invalid
    expect(form.valid).toBeFalsy();
    
    // Fill required fields
    form.patchValue({
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      location: 'San Francisco, CA'
    });
    
    expect(form.valid).toBeTruthy();
  });

  it('should validate summary form correctly', () => {
    const form = component.summaryForm;
    
    // Initially invalid
    expect(form.valid).toBeFalsy();
    
    // Too short
    form.patchValue({ summary: 'Short' });
    expect(form.valid).toBeFalsy();
    
    // Valid length
    form.patchValue({ 
      summary: 'This is a comprehensive professional summary that meets the minimum length requirement for validation.' 
    });
    expect(form.valid).toBeTruthy();
  });
});