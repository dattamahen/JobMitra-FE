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
	if (typeof skill === 'string') return skill;
	const name = skill?.name || '';
	const version = skill?.version || '';
	return version ? `${name} ${version}` : name;
}

function toDisplayDate(val: string): string {
	if (!val) return '';
	const lower = val.toLowerCase().trim();
	if (lower === 'present' || lower === 'current') return 'Present';
	// ISO date: YYYY-MM-DD or YYYY-MM
	const isoMatch = val.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
	if (isoMatch) {
		const [, y, m, d] = isoMatch;
		return d ? `${d}-${m}-${y}` : `${m}-${y}`;
	}
	// Already DD-MM-YYYY or similar
	return val;
}

export function formatDuration(item: any): string {
	if (item.duration) return item.duration;
	if (item.start_date && item.end_date) return `${toDisplayDate(item.start_date)} - ${toDisplayDate(item.end_date)}`;
	return '';
}

export function formatYear(item: any): string {
	if (item.year) return item.year;
	if (item.start_date && item.end_date) return `${toDisplayDate(item.start_date)} – ${toDisplayDate(item.end_date)}`;
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
