import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root'
})
export class ResumeIntegrationService {

	constructor(private userService: UserService) {}

	/**
	* Get profile data formatted for resume builder
	*/
	getResumeData(): Observable<any> {
		return this.userService.getCurrentUser().pipe(
			map(user => this.transformProfileToResumeData(user))
		);
	}

	/**
	* Transform user profile data to resume builder format
	*/
	private transformProfileToResumeData(user: any): any {
		if (!user) return {};

		return {
			// Personal Information
			personal_info: {
				full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
				email: user.email || '',
				phone: user.phone || '',
				location: [user.city, user.state].filter(Boolean).join(', ') || '',
				linkedin: user.linkedin_link || '',
				github: user.github_link || '',
				portfolio: user.portfolio_link || ''
			},

			// Professional Summary
			summary: user.professional_summary || '',

			// Skills
			skills: {
				technical: user.technical_skills?.map((skill: any) => ({
					name: skill.name,
					experience: skill.experience
				})) || [],
				soft: user.skills || []
			},

			// Work Experience
			experience: user.work_experience?.map((exp: any) => ({
				company: exp.company,
				position: exp.position,
				start_date: exp.start_date,
				end_date: exp.end_date,
				description: exp.description,
				achievements: exp.description?.split('\n').filter((line: string) => line.trim().startsWith('•')) || []
			})) || [],

			// Education
			education: user.education?.map((edu: any) => ({
				institution: edu.institution,
				education_type: edu.education_type,
				start_date: edu.start_date,
				end_date: edu.end_date
			})) || [],

			// Projects
			projects: user.projects?.map((project: any) => ({
				name: project.name,
				url: project.url,
				description: project.description,
				technologies: project.technologies?.split(',').map((tech: string) => tech.trim()) || []
			})) || [],

			// Certifications
			certifications: user.certifications?.map((cert: any) => ({
				name: cert.name,
				issuer: cert.issuer,
				date: cert.date,
				credential_id: cert.credential_id
			})) || [],

			// Career Information
			career_info: {
				current_role: user.current_role || '',
				current_company: user.current_company || '',
				desired_job_title: user.desired_job_title || '',
				experience_years: user.overall_experience_years || 0,
				highest_qualification: user.highest_qualification || ''
			}
		};
	}

	/**
	* Update profile from resume data
	*/
	updateProfileFromResume(resumeData: any): Observable<any> {
		const profileUpdate = this.transformResumeToProfileData(resumeData);
		return this.userService.updateCurrentUser(profileUpdate);
	}

	/**
	* Transform resume data back to profile format
	*/
	private transformResumeToProfileData(resumeData: any): any {
		const update: any = {};

		// Personal Information
		if (resumeData.personal_info) {
			const nameParts = resumeData.personal_info.full_name?.split(' ') || [];
			if (nameParts.length > 0) {
				update.first_name = nameParts[0];
				update.last_name = nameParts.slice(1).join(' ');
			}
			if (resumeData.personal_info.phone) update.phone = resumeData.personal_info.phone;
			if (resumeData.personal_info.location) {
				const locationParts = resumeData.personal_info.location.split(',').map((part: string) => part.trim());
				if (locationParts.length >= 1) update.city = locationParts[0];
				if (locationParts.length >= 2) update.state = locationParts[1];
			}
			if (resumeData.personal_info.linkedin) update.linkedin_link = resumeData.personal_info.linkedin;
			if (resumeData.personal_info.github) update.github_link = resumeData.personal_info.github;
			if (resumeData.personal_info.portfolio) update.portfolio_link = resumeData.personal_info.portfolio;
		}

		// Professional Summary
		if (resumeData.summary) update.professional_summary = resumeData.summary;

		// Skills
		if (resumeData.skills) {
			if (resumeData.skills.technical) {
				update.technical_skills = resumeData.skills.technical;
				update.skills = resumeData.skills.technical.map((skill: any) => skill.name);
			}
		}

		// Work Experience
		if (resumeData.experience) update.work_experience = resumeData.experience;

		// Education
		if (resumeData.education) update.education = resumeData.education;

		// Projects
		if (resumeData.projects) update.projects = resumeData.projects;

		// Certifications
		if (resumeData.certifications) update.certifications = resumeData.certifications;

		// Career Information
		if (resumeData.career_info) {
			if (resumeData.career_info.current_role) update.current_role = resumeData.career_info.current_role;
			if (resumeData.career_info.current_company) update.current_company = resumeData.career_info.current_company;
			if (resumeData.career_info.desired_job_title) update.desired_job_title = resumeData.career_info.desired_job_title;
			if (resumeData.career_info.experience_years) update.overall_experience_years = resumeData.career_info.experience_years;
			if (resumeData.career_info.highest_qualification) update.highest_qualification = resumeData.career_info.highest_qualification;
		}

		return update;
	}
}