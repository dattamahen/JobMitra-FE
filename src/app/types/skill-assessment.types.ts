export type SkillLevel = {
	skill_id: string;
	skill_name: string;
	current_level: number;
	level_text: string;
	category: string;
};

export type AssessmentResult = {
	id: string;
	skill_name: string;
	score: number;
	level: string;
	completed_date: string;
	has_certificate: boolean;
};

export type LearningResource = {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly youtubeUrl: string;
	readonly channel: string;
	readonly duration: string;
	readonly level: string;
	readonly skill: string;
	readonly rating?: number;
};

export type UsageStatus = {
	interviews_used: number;
	interviews_remaining: number;
	weekly_limit: number;
	next_reset: string;
	can_take_interview: boolean;
};

export type RecommendedSkill = {
	id: string;
	name: string;
	relevance_reason: string;
};

export type SkillAssessment = {
	readonly id: string;
	readonly name: string;
	readonly category: 'technical' | 'soft-skills';
	readonly currentLevel: number;
	readonly levelText: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
	readonly isRecommended?: boolean;
	readonly relevanceReason?: string;
};
