// Import the existing types from job.types.ts since they match the API structure
import type { 
	JobListing as ApiJobListing,
	JobSearchResponse,
	JobSearchFilters
} from '../types/job.types';

// Import the existing frontend interfaces from job-search-data.ts
import { 
	JobListing as FrontendJobListing, 
	HRContact, 
	JobRequirement, 
	JobBenefit, 
	LearningResource,
	CompanyInfo,
	SalaryRange,
	JobLocation
} from '../data/job-search-data';

// Conversion utilities to transform API data to frontend interfaces
export class JobApiConverter {
	static convertApiJobToFrontendJobListing(apiJob: ApiJobListing): FrontendJobListing {
		return {
			id: apiJob.job_id,
			title: apiJob.title,
			company: {
				id: apiJob.job_id.split('-').slice(-1)[0] || 'unknown',
				name: apiJob.company,
				industry: apiJob.company_info.industry,
				size: apiJob.company_info.company_size,
				website: apiJob.company_info.website,
				description: apiJob.company_info.description
			},
			location: {
				type: apiJob.job_type as 'remote' | 'onsite' | 'hybrid',
				city: apiJob.location.city,
				state: apiJob.location.state,
				country: apiJob.location.country,
				timezone: apiJob.location.timezone
			},
			salary: {
				min: apiJob.salary?.min || 0,
				max: apiJob.salary?.max || 0,
				currency: apiJob.salary?.currency || 'INR',
				period: apiJob.salary?.period || 'yearly'
			},
			matchPercentage: apiJob.match_percentage || 0,
			shortDescription: this.truncateDescription(apiJob.description, 150),
			fullDescription: apiJob.description,
			requirements: apiJob.requirements.map((req: string, index: number) => ({
				id: `req-${apiJob.job_id}-${index}`,
				description: req,
				type: 'required' as const,
				category: 'technical' as const
			})),
			benefits: apiJob.benefits.map((benefit: string, index: number) => ({
				id: `benefit-${apiJob.job_id}-${index}`,
				title: benefit,
				description: benefit,
				category: this.categorizeBenefit(benefit)
			})),
			hrContact: {
				name: apiJob.hr_contact?.name || '',
				email: apiJob.hr_contact?.email || '',
				phone: apiJob.hr_contact?.phone || '',
				title: apiJob.hr_contact?.title || '',
				department: apiJob.hr_contact?.department || ''
			},
			skills: [...(apiJob.skills_required || []), ...(apiJob.skills_preferred || [])],
			experienceLevel: apiJob.experience_level,
			employmentType: (apiJob.employment_type === 'freelance' ? 'contract' : apiJob.employment_type) as 'full-time' | 'part-time' | 'contract' | 'internship',
			department: apiJob.hr_contact?.department?.replace('Human Resources', 'Engineering').replace('Talent Acquisition', 'Engineering') || 'Engineering',
			postedDate: new Date(apiJob.posted_date),
			applicationDeadline: apiJob.application_deadline ? new Date(apiJob.application_deadline) : new Date(),
			isActive: apiJob.is_active,
			tags: apiJob.tags || [],
			learningResources: (apiJob.learning_resources || []).map((lr: any) => ({
				id: lr.id,
				title: lr.title,
				description: lr.description,
				youtubeUrl: lr.youtube_url,
				duration: lr.duration,
				level: lr.level,
				channel: lr.channel,
				skill: lr.skill,
				rating: lr.rating
			}))
		};
	}

	// Define a frontend response type for job search results
	static convertJobSearchResponseToFrontendResponse(apiResponse: JobSearchResponse): {
		jobs: FrontendJobListing[];
		filters: {
			locations: any[];
			experience_levels: any[];
			employment_types: any[];
			job_types: any[];
			companies: any[];
			salary_ranges: any[];
		};
		total_count: number;
		page: number;
		per_page: number;
		total_pages: number;
		has_next: boolean;
		has_prev: boolean;
	} {
		return {
			jobs: apiResponse.jobs.map((job: ApiJobListing) => this.convertApiJobToFrontendJobListing(job)),
			filters: {
				locations: [], // Will be populated by separate API call if needed
				experience_levels: [],
				employment_types: [],
				job_types: [],
				companies: [],
				salary_ranges: []
			},
			total_count: apiResponse.total_count,
			page: apiResponse.page,
			per_page: apiResponse.per_page,
			total_pages: apiResponse.total_pages ?? 0,
			has_next: apiResponse.has_next ?? false,
			has_prev: apiResponse.has_prev ?? false
		};
	}

	private static truncateDescription(description: string, maxLength: number): string {
		if (description.length <= maxLength) {
			return description;
		}
		return description.substring(0, maxLength).trim() + '...';
	}

	private static categorizeBenefit(benefit: string): 'health' | 'financial' | 'time-off' | 'professional' | 'lifestyle' {
		const benefitLower = benefit.toLowerCase();
		
		if (benefitLower.includes('health') || benefitLower.includes('medical') || benefitLower.includes('insurance')) {
			return 'health';
		}
		if (benefitLower.includes('pf') || benefitLower.includes('esi') || benefitLower.includes('bonus') || benefitLower.includes('salary')) {
			return 'financial';
		}
		if (benefitLower.includes('leave') || benefitLower.includes('time off') || benefitLower.includes('holiday')) {
			return 'time-off';
		}
		if (benefitLower.includes('learning') || benefitLower.includes('development') || benefitLower.includes('training') || benefitLower.includes('budget')) {
			return 'professional';
		}
		return 'lifestyle';
	}
}
