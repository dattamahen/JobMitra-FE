export interface ProfileFormData {
	experienceOptions: { value: string; label: string }[];
	salaryRanges: { value: string; label: string }[];
	workTypes: { value: string; label: string }[];
	employmentTypes: { value: string; label: string }[];
}

export const PROFILE_FORM_DATA: ProfileFormData = {
	experienceOptions: [
		{ value: '0-1', label: '0-1 years' },
		{ value: '2-3', label: '2-3 years' },
		{ value: '4-5', label: '4-5 years' },
		{ value: '6-8', label: '6-8 years' },
		{ value: '9-12', label: '9-12 years' },
		{ value: '13+', label: '13+ years' }
	],
	
	salaryRanges: [
		{ value: '4-6', label: '₹4 - ₹6 LPA' },
		{ value: '6-8', label: '₹6 - ₹8 LPA' },
		{ value: '8-12', label: '₹8 - ₹12 LPA' },
		{ value: '12-18', label: '₹12 - ₹18 LPA' },
		{ value: '18-25', label: '₹18 - ₹25 LPA' },
		{ value: '25+', label: '₹25+ LPA' }
	],
	
	workTypes: [
		{ value: 'remote', label: 'Remote' },
		{ value: 'hybrid', label: 'Hybrid' },
		{ value: 'onsite', label: 'On-site' }
	],
	
	employmentTypes: [
		{ value: 'full-time', label: 'Full-time' },
		{ value: 'part-time', label: 'Part-time' },
		{ value: 'contract', label: 'Contract' },
		{ value: 'freelance', label: 'Freelance' }
	]
};

export interface FormFieldConfig {
	name: string;
	label: string;
	placeholder: string;
	type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'multiselect';
	required: boolean;
	icon: string;
	hint?: string;
	options?: { value: string; label: string }[];
}

export const PROFILE_FORM_FIELDS: { [section: string]: FormFieldConfig[] } = {
	basic: [
		{
			name: 'fullName',
			label: 'Full Name',
			placeholder: 'Enter your full name',
			type: 'text',
			required: true,
			icon: 'person'
		},
		{
			name: 'email',
			label: 'Email',
			placeholder: 'your.email@example.com',
			type: 'email',
			required: true,
			icon: 'email'
		},
		{
			name: 'phone',
			label: 'Phone Number',
			placeholder: '+1 (555) 123-4567',
			type: 'tel',
			required: true,
			icon: 'phone'
		},
		{
			name: 'location',
			label: 'Location',
			placeholder: 'City, State',
			type: 'text',
			required: true,
			icon: 'location_on'
		}
	],
	
	professional: [
		{
			name: 'currentJobTitle',
			label: 'Current Job Title',
			placeholder: 'e.g., Senior Software Engineer',
			type: 'text',
			required: true,
			icon: 'work'
		},
		{
			name: 'experience',
			label: 'Years of Experience',
			placeholder: '',
			type: 'select',
			required: true,
			icon: 'timeline',
			options: PROFILE_FORM_DATA.experienceOptions
		},
		{
			name: 'desiredJobTitle',
			label: 'Desired Job Title',
			placeholder: 'e.g., Full Stack Developer',
			type: 'text',
			required: true,
			icon: 'trending_up'
		},
		{
			name: 'salaryRange',
			label: 'Expected Salary Range',
			placeholder: '',
			type: 'select',
			required: false,
			icon: 'attach_money',
			options: PROFILE_FORM_DATA.salaryRanges
		},
		{
			name: 'skills',
			label: 'Key Skills',
			placeholder: 'e.g., JavaScript, React, Node.js, Python',
			type: 'text',
			required: true,
			icon: 'code',
			hint: 'Separate skills with commas'
		},
		{
			name: 'summary',
			label: 'Professional Summary',
			placeholder: 'Brief description of your professional background and career goals',
			type: 'textarea',
			required: false,
			icon: 'description'
		},
		{
			name: 'certifications',
			label: 'Certifications',
			placeholder: 'e.g., AWS Certified Developer, Google Cloud Professional',
			type: 'text',
			required: false,
			icon: 'verified',
			hint: 'Separate multiple certifications with commas'
		},
		{
			name: 'areaOfExpertise',
			label: 'Area of Expertise',
			placeholder: 'e.g., Frontend Development, Data Science, DevOps',
			type: 'text',
			required: false,
			icon: 'psychology',
			hint: 'Separate multiple areas with commas'
		},
		{
			name: 'githubLink',
			label: 'GitHub Profile',
			placeholder: 'https://github.com/yourusername',
			type: 'text',
			required: false,
			icon: 'code'
		},
		{
			name: 'portfolioLink',
			label: 'Portfolio/App Link',
			placeholder: 'https://yourportfolio.com or app store link',
			type: 'text',
			required: false,
			icon: 'web'
		},
		{
			name: 'youtubeChannel',
			label: 'YouTube Channel',
			placeholder: 'https://youtube.com/@yourchannel',
			type: 'text',
			required: false,
			icon: 'video_library'
		},
		{
			name: 'contributions',
			label: 'Key Contributions',
			placeholder: 'Describe your notable contributions, projects, or achievements',
			type: 'textarea',
			required: false,
			icon: 'star'
		}
	],
	
	preferences: [
		{
			name: 'workType',
			label: 'Work Type',
			placeholder: '',
			type: 'multiselect',
			required: false,
			icon: 'home_work',
			options: PROFILE_FORM_DATA.workTypes
		},
		{
			name: 'employmentType',
			label: 'Employment Type',
			placeholder: '',
			type: 'multiselect',
			required: false,
			icon: 'business',
			options: PROFILE_FORM_DATA.employmentTypes
		}
	]
};


// ── Profile Page UI Text Constants ──

export const PROFILE_TEXT = {
	formButtons: {
		updateBasicInfo: 'Update Basic Info',
		updateProfessionalInfo: 'Update Professional Info',
		updateSkills: 'Update Skills',
		updateExperience: 'Update Experience',
		updateEducation: 'Update Education',
		updateProjects: 'Update Projects',
		updateCertifications: 'Update Certifications',
		updateJobPreferences: 'Update Job Preferences',
	},
	placeholders: {
		yourName: 'Your Name',
		addHeadline: 'Add your professional headline',
		addLocation: 'Add your location',
		addEmail: 'Add email',
	},
	labels: {
		contactInfo: 'Contact info',
		yearsExperience: 'Years Experience',
		percentComplete: '% Complete',
	},
	sections: {
		about: 'About',
		skills: 'Skills',
		skillsSuffix: 'skills',
		careerPreferences: 'Career Preferences',
		education: 'Education',
		contact: 'Contact',
	},
	emptyStates: {
		addSummary: 'Add a summary to help people discover you and your professional interests.',
		addSummaryBtn: 'Add summary',
		addSkills: 'Add skills to showcase your expertise to potential employers.',
		addSkillsBtn: 'Add skills',
		showAllPrefix: 'Show all',
		showAllSuffix: 'skills',
	},
	preferences: {
		jobTypes: 'Job types',
		workArrangement: 'Work arrangement',
		salaryExpectation: 'Salary expectation',
		notSpecified: 'Not specified',
	},
	contactLinks: {
		githubProfile: 'GitHub Profile',
		linkedinProfile: 'LinkedIn Profile',
		portfolioWebsite: 'Portfolio Website',
	},
} as const;
