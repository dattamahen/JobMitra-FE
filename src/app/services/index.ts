// Core API Service
export { ApiService } from './api.service';

// Feature Services
export { UserService } from './user.service';
export { JobService } from './job.service';
export { ApplicationService } from './application.service';
export { MockInterviewService } from './mock-interview.service';
export { LearningService } from './learning.service';
export { DashboardService } from './dashboard.service';

// Service Types and Interfaces
export type { UserProfile, CreateUserRequest, UpdateUserRequest } from './user.service';
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
  MockInterviewSession, 
  CreateInterviewRequest,
  InterviewQuestion,
  SubmitAnswerRequest,
  InterviewAnalytics
} from './mock-interview.service';
export type { 
  LearningResource, 
  UserProgress, 
  LearningPath,
  ResourceFilters
} from './learning.service';
