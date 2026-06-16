export const RESUME_SECTIONS = [
	{ id: 'personal_info', label: 'Personal Info', icon: 'person', required: true },
	{ id: 'summary', label: 'Summary', icon: 'description', required: true },
	{ id: 'experience', label: 'Experience', icon: 'work', required: true },
	{ id: 'education', label: 'Education', icon: 'school', required: true },
	{ id: 'skills', label: 'Skills', icon: 'build', required: true },
	{ id: 'projects', label: 'Projects', icon: 'code', required: false },
	{ id: 'certifications', label: 'Certifications', icon: 'verified', required: false }
] as const;

export const CV_TEMPLATES = [
	{ id: 'standard', name: 'Standard', icon: 'text_snippet' },
	{ id: 'modern', name: 'Modern', icon: 'article' },
	{ id: 'classic', name: 'Classic', icon: 'description' },
	{ id: 'creative', name: 'Creative', icon: 'palette' },
	{ id: 'executive', name: 'Executive', icon: 'business_center' }
] as const;
