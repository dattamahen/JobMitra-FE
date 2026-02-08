// Core API Service
export { ApiService } from './api.service';

// Feature Services
export { UserService } from './user.service';
export { JobService } from './job.service';
export { ApplicationService } from './application.service';
export { MockInterviewService } from './mock-interview.service';
export { LearningService } from './learning.service';
export { DashboardService } from './dashboard.service';
export { HrService } from './hr.service';
export { ResumeService } from './resume.service';
export { ProfileShareService } from './profile-share.service';
export { ImageUploadService } from './image-upload.service';

// Service Types and Interfaces
export type { 
	UserProfile, 
	CreateUserRequest, 
	UpdateUserRequest,
	TechnicalSkill,
	WorkExperience,
	Education,
	Project,
	Certification
} from '../types/profile.types';
export type { 
	JobListing, 
	JobSearchFilters, 
	JobSearchResponse, 
	SavedJob 
} from './job.service';
export type { 
	JobApplication, 
	CreateApplicationRequest, 
	UpdateApplicationRequest,
	ApplicationFilters,
	ApplicationsResponse,
	ApplicationStats
} from './application.service';
export type { 
	InterviewQuestion,
	InterviewSession,
	InterviewEvaluation,
	InterviewSubmissionData
} from '../types/mock-interview.types';
export type { 
	LearningResource, 
	UserProgress, 
	LearningPath,
	ResourceFilters
} from './learning.service';
export type {
	HRUser,
	JobPostingRequest,
	JobListing as HRJobListing,
	HRDashboardStats
} from './hr.service';
export type {

} from './resume.service';
export type { ProfileSnapshot } from '../types/profile.types';
// ImageUploadService has no exported types
