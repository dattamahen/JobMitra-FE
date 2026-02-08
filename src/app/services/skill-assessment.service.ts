import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { SkillLevel, AssessmentResult, LearningResource, UsageStatus, RecommendedSkill } from '../types/skill-assessment.types';

@Injectable({
	providedIn: 'root'
})
export class SkillAssessmentService {


	constructor(private apiService: ApiService) {}

	getTechnicalSkills(): Observable<SkillLevel[]> {
		return this.apiService.get<SkillLevel[]>('/skill-assessment/skills/technical');
	}

	getSoftSkills(): Observable<SkillLevel[]> {
		return this.apiService.get<SkillLevel[]>('/skill-assessment/skills/soft');
	}

	getAssessmentHistory(): Observable<AssessmentResult[]> {
		return this.apiService.get<AssessmentResult[]>('/skill-assessment/history');
	}

	takeSkillTest(skillId: string): Observable<any> {
		return this.apiService.post(`/skill-assessment/take-test/${skillId}`, {});
	}

	startMockInterview(skillName: string, userId: string): Observable<any> {
		return this.apiService.post('/skill-assessment/mock-interview', {
			skill_name: skillName,
			user_id: userId
		});
	}

	getLearningResources(skillName: string): Observable<LearningResource[]> {
		return this.apiService.get<LearningResource[]>(`/skill-assessment/learning-resources/${skillName}`);
	}

	getUsageStatus(): Observable<UsageStatus> {
		return this.apiService.get<UsageStatus>('/skill-assessment/usage-status');
	}

	getRecommendedSkills(): Observable<RecommendedSkill[]> {
		return this.apiService.get<RecommendedSkill[]>('/skill-assessment/recommended-skills');
	}

	contributeResource(resourceData: any): Observable<any> {
		return this.apiService.post('/skill-assessment/contribute-resource', resourceData);
	}

	getCertificate(assessmentId: string): Observable<any> {
		return this.apiService.get(`/skill-assessment/certificate/${assessmentId}`);
	}
}
