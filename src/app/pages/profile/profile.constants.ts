export const QUALIFICATION_DISPLAY_MAP: Record<string, string> = {
	high_school: 'High School',
	diploma: 'Diploma',
	bachelors: "Bachelor's Degree",
	masters: "Master's Degree",
	phd: 'PhD'
} as const;

export const SALARY_RANGE_MAP: Record<string, { min: number; max: number }> = {
	'4-6': { min: 4, max: 6 },
	'6-8': { min: 6, max: 8 },
	'8-12': { min: 8, max: 12 },
	'12-18': { min: 12, max: 18 },
	'18-25': { min: 18, max: 25 },
	'25+': { min: 25, max: 30 }
} as const;

export const PROFILE_FIELD_DISPLAY_NAMES: Record<string, string> = {
	fullName: 'Full Name',
	email: 'Email',
	phone: 'Phone Number',
	location: 'Location',
	currentJobTitle: 'Current Job Title',
	experience: 'Years of Experience',
	desiredJobTitle: 'Desired Job Title',
	salaryRange: 'Expected Salary Range',
	skills: 'Skills',
	summary: 'Professional Summary',
	certifications: 'Certifications',
	areaOfExpertise: 'Area of Expertise',
	githubLink: 'GitHub Profile',
	portfolioLink: 'Portfolio Link',
	youtubeChannel: 'YouTube Channel',
	contributions: 'Key Contributions',
	workType: 'Work Type',
	employmentType: 'Employment Type'
} as const;

export const PROFILE_PATTERN_ERROR_MESSAGES: Record<string, string> = {
	phone: 'Please enter a valid phone number (e.g., +1 (555) 123-4567)',
	githubLink: 'Please enter a valid GitHub URL (e.g., https://github.com/username)',
	portfolioLink: 'Please enter a valid URL (e.g., https://yourportfolio.com)',
	youtubeChannel: 'Please enter a valid YouTube channel URL (e.g., https://youtube.com/@username)'
} as const;
