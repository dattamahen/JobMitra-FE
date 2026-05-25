import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { JobService } from './job.service';
import { ApiService } from './api.service';
import { UserService } from './user.service';

describe('JobService', () => {
	let service: JobService;
	let apiServiceSpy: jasmine.SpyObj<ApiService>;
	let userServiceSpy: jasmine.SpyObj<UserService>;

	const mockUser = {
		user_id: 'test_001',
		skills: ['Python', 'Angular'],
		certifications: [{ name: 'AWS Certified' }],
		professional_summary: 'Senior developer with expertise in web applications'
	};

	const mockJobResponse = {
		jobs: [
			{ job_id: 'job_001', title: 'Python Developer', company: 'TechCorp', already_applied: false },
			{ job_id: 'job_002', title: 'Angular Developer', company: 'WebCo', already_applied: true }
		],
		total: 2
	};

	beforeEach(() => {
		apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);
		userServiceSpy = jasmine.createSpyObj('UserService', ['getCurrentUser']);
		userServiceSpy.getCurrentUser.and.returnValue(of(mockUser));

		TestBed.configureTestingModule({
			providers: [
				JobService,
				{ provide: ApiService, useValue: apiServiceSpy },
				{ provide: UserService, useValue: userServiceSpy }
			]
		});

		localStorage.clear();
		service = TestBed.inject(JobService);
	});

	afterEach(() => {
		localStorage.clear();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	// ─── Job Search ──────────────────────────────────────────────────────────

	describe('searchJobs', () => {
		it('should search jobs with user skills', () => {
			apiServiceSpy.post.and.returnValue(of(mockJobResponse));

			service.searchJobs({ keywords: 'python' }).subscribe(response => {
				expect(response.jobs.length).toBe(2);
				expect(apiServiceSpy.post).toHaveBeenCalledWith('/jobs', jasmine.objectContaining({
					keywords: 'python',
					user_skills: ['Python', 'Angular']
				}));
			});
		});

		it('should fallback to mock data on API error', () => {
			apiServiceSpy.post.and.returnValue(throwError(() => new Error('API Error')));

			service.searchJobs({}).subscribe(response => {
				expect(response).toBeTruthy();
				expect(response.jobs).toBeDefined();
			});
		});

		it('should handle user service failure gracefully', () => {
			userServiceSpy.getCurrentUser.and.returnValue(throwError(() => new Error('User error')));

			service.searchJobs({}).subscribe(response => {
				expect(response).toBeTruthy();
			});
		});
	});

	// ─── Job Details ─────────────────────────────────────────────────────────

	describe('getJobDetails', () => {
		it('should fetch job details by ID', () => {
			const mockJob = { job_id: 'job_001', title: 'Python Dev' };
			apiServiceSpy.get.and.returnValue(of(mockJob as any));

			service.getJobDetails('job_001').subscribe(job => {
				expect(job.job_id).toBe('job_001');
			});
		});

		it('should return fallback job on error', () => {
			apiServiceSpy.get.and.returnValue(throwError(() => new Error('Not found')));

			service.getJobDetails('invalid_id').subscribe(job => {
				expect(job.title).toBe('Job Not Found');
				expect(job.is_active).toBeFalse();
			});
		});
	});

	// ─── Saved Jobs ──────────────────────────────────────────────────────────

	describe('saved jobs', () => {
		it('should save a job', () => {
			apiServiceSpy.post.and.returnValue(of({ message: 'Saved' }));

			service.saveJob('job_001', 'Interesting role').subscribe(response => {
				expect(response.message).toBe('Saved');
				expect(service.isJobSaved('job_001')).toBeTrue();
			});
		});

		it('should remove a saved job', () => {
			apiServiceSpy.post.and.returnValue(of({ message: 'Saved' }));
			apiServiceSpy.delete.and.returnValue(of({ message: 'Removed' }));

			// First save
			service.saveJob('job_001').subscribe();
			// Then remove
			service.removeSavedJob('job_001').subscribe(response => {
				expect(response.message).toBe('Removed');
				expect(service.isJobSaved('job_001')).toBeFalse();
			});
		});

		it('should check if job is saved', () => {
			expect(service.isJobSaved('nonexistent')).toBeFalse();
		});
	});

	// ─── Filters ─────────────────────────────────────────────────────────────

	describe('search filters', () => {
		it('should set and get filters', () => {
			const filters = { keywords: 'react', experience_level: ['mid'] };
			service.setSearchFilters(filters);
			expect(service.getCurrentFilters()).toEqual(filters);
		});

		it('should clear filters', () => {
			service.setSearchFilters({ keywords: 'test' });
			service.clearFilters();
			expect(service.getCurrentFilters()).toEqual({});
		});

		it('should persist filters to localStorage', () => {
			service.setSearchFilters({ keywords: 'angular' });
			expect(localStorage.getItem('jobSearchFilters')).toContain('angular');
		});
	});

	// ─── Apply for Job ───────────────────────────────────────────────────────

	describe('applyForJob', () => {
		it('should apply for a job', () => {
			apiServiceSpy.post.and.returnValue(of({ message: 'Applied', success: true }));

			service.applyForJob('job_001').subscribe(response => {
				expect(response.success).toBeTrue();
			});
		});

		it('should force apply when specified', () => {
			apiServiceSpy.post.and.returnValue(of({ message: 'Applied', success: true }));

			service.applyForJob('job_001', true).subscribe();
			expect(apiServiceSpy.post).toHaveBeenCalledWith('/api/v1/apply-job', {
				job_id: 'job_001',
				force_apply: true
			});
		});
	});

	// ─── Match Analysis ──────────────────────────────────────────────────────

	describe('performMatchAnalysis', () => {
		it('should perform match analysis', () => {
			apiServiceSpy.post.and.returnValue(of({ match_percentage: 85, message: 'Done', analysis_done: true }));

			service.performMatchAnalysis('job_001').subscribe(response => {
				expect(response.match_percentage).toBe(85);
				expect(response.analysis_done).toBeTrue();
			});
		});
	});

	// ─── Tailor Resume ───────────────────────────────────────────────────────

	describe('tailorResume', () => {
		it('should tailor resume for a job', () => {
			apiServiceSpy.post.and.returnValue(of({ match_percentage: 90, message: 'Tailored', tailor_done: true }));

			service.tailorResume('job_001').subscribe(response => {
				expect(response.tailor_done).toBeTrue();
				expect(response.match_percentage).toBe(90);
			});
		});
	});
});
