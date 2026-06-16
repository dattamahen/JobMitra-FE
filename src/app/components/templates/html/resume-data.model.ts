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

export function formatDescription(desc: any): string {
	if (!desc) return '';
	if (Array.isArray(desc)) return `<ul style="margin:4px 0 0;padding-left:18px;list-style:disc">${desc.map(l => `<li style="line-height:1.6;margin-bottom:2px">${l}</li>`).join('')}</ul>`;
	if (typeof desc !== 'string') return String(desc);
	const lines = desc.split(/\n/).map(l => l.replace(/^[\s•\*\-–]+/, '').trim()).filter(Boolean);
	if (lines.length <= 1) return desc;
	return `<ul style="margin:4px 0 0;padding-left:18px;list-style:disc">${lines.map(l => `<li style="line-height:1.6;margin-bottom:2px">${l}</li>`).join('')}</ul>`;
}
