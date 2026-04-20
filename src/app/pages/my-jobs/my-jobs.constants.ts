export const EMPLOYMENT_TYPE_DISPLAY: Record<string, string> = {
	'full-time': 'Full Time',
	'full_time': 'Full Time',
	'part-time': 'Part Time',
	'part_time': 'Part Time',
	contract: 'Contract',
	freelance: 'Freelance',
	internship: 'Internship'
} as const;

export const EXPERIENCE_LEVEL_DISPLAY: Record<string, string> = {
	entry: 'Entry Level',
	junior: 'Junior',
	mid: 'Mid Level',
	senior: 'Senior',
	lead: 'Lead',
	executive: 'Executive'
} as const;

export const JOB_TYPE_DISPLAY: Record<string, string> = {
	remote: 'Remote',
	onsite: 'On-site',
	hybrid: 'Hybrid'
} as const;
