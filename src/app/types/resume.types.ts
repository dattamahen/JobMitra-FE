export type PersonalInfo = {
	full_name: string;
	email: string;
	phone: string;
	location: string;
	linkedin?: string;
	portfolio?: string;
	github?: string;
};

export type Experience = {
	company: string;
	position: string;
	duration: string;
	description: string;
	achievements: string[];
};

export type Education = {
	institution: string;
	degree: string;
	year: string;
	gpa?: string;
};

export type Project = {
	name: string;
	description: string;
	technologies: string[];
	url?: string;
};

export type Certification = {
	name: string;
	issuer: string;
	date: string;
	credential_id?: string;
};

export type ResumeSection = {
	personal_info: PersonalInfo;
	summary: string;
	experience: Experience[];
	education: Education[];
	skills: {
		technical: string[];
		soft: string[];
	};
	projects: Project[];
	certifications: Certification[];
};

export type Resume = {
	resume_id: string;
	title: string;
	template_id?: string;
	sections: ResumeSection;
	ats_score: number;
	suggestions: string[];
	created_at?: string;
	updated_at?: string;
	is_primary?: boolean;
};

export type ResumeTemplate = {
	template_id: string;
	name: string;
	description: string;
	preview_url: string;
	category: string;
};
