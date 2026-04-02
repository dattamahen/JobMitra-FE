export interface ResumeData {
	personalInfo: any;
	summary: string;
	experience: any[];
	education: any[];
	skills: { technical: any[]; soft: string[] };
	projects: any[];
	certifications: any[];
}

export function skillName(skill: any): string {
	return typeof skill === 'string' ? skill : skill?.name || '';
}

export function formatDuration(item: any): string {
	if (item.duration) return item.duration;
	if (item.start_date && item.end_date) return `${item.start_date} - ${item.end_date}`;
	return '';
}

export function formatYear(item: any): string {
	if (item.year) return item.year;
	if (item.start_date && item.end_date) return `${item.start_date} – ${item.end_date}`;
	return '';
}
