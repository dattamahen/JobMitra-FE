import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface SkillLevel {
	skill_id: string;
	skill_name: string;
	current_level: number;
	level_text: string;
	category: string;
}

export interface AssessmentResult {
	id: string;
	skill_name: string;
	score: number;
	level: string;
	completed_date: string;
	has_certificate: boolean;
}

export interface LearningResource {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly youtubeUrl: string;
	readonly channel: string;
	readonly duration: string;
	readonly level: string;
	readonly skill: string;
	readonly rating?: number;
}

export interface UsageStatus {
	interviews_used: number;
	interviews_remaining: number;
	weekly_limit: number;
	next_reset: string;
	can_take_interview: boolean;
}

export interface RecommendedSkill {
	id: string;
	name: string;
	relevance_reason: string;
}

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