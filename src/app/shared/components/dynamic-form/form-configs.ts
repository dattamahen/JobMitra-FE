import { FormConfig } from '../../interfaces/form.interfaces';

export const LOGIN_FORM_CONFIG: FormConfig = {
	fields: [
		{
			name: 'email',
			label: 'Email',
			type: 'email',
			placeholder: 'Enter your email',
			required: true,
			icon: '',
		},
		{
			name: 'password',
			label: 'Password',
			type: 'password',
			placeholder: 'Enter your password',
			required: true,
			icon: 'visibility'
		}
	],
	submitLabel: 'Sign In',
	showCancel: false
};

export const SIGNUP_FORM_CONFIG: FormConfig = {
	fields: [
		{
			name: 'first_name',
			label: 'First Name',
			type: 'text',
			placeholder: 'First name',
			required: true
		},
		{
			name: 'last_name',
			label: 'Last Name',
			type: 'text',
			placeholder: 'Last name',
			required: true
		},
		{
			name: 'email',
			label: 'Email',
			type: 'email',
			placeholder: 'Enter your email',
			required: true,
			icon: '',
		},
		{
			name: 'password',
			label: 'Password',
			type: 'password',
			placeholder: 'Create a password',
			required: true,
			icon: 'visibility'
		},
		{
			name: 'confirmPassword',
			label: 'Confirm Password',
			type: 'password',
			placeholder: 'Confirm your password',
			required: true,
			icon: 'visibility'
		},
		{
			name: 'user_type',
			label: 'Account Type',
			type: 'select',
			required: true,
			defaultValue: 'candidate',
			options: [
				{ value: 'candidate', label: 'Job Seeker' },
				{ value: 'hire', label: 'HR / Recruiter' }
			]
		}
	],
	submitLabel: 'Create Account'
};

export const FORGOT_PASSWORD_FORM_CONFIG: FormConfig = {
	fields: [
		{
			name: 'email',
			label: 'Email',
			type: 'email',
			placeholder: 'Enter your email',
			required: true,
			icon: ''
		}
	],
	submitLabel: 'Send Reset Link',
	showCancel: false
};

export const RESET_PASSWORD_FORM_CONFIG: FormConfig = {
	fields: [
		{
			name: 'new_password',
			label: 'New Password',
			type: 'password',
			placeholder: 'Enter new password',
			required: true,
			icon: 'visibility'
		},
		{
			name: 'confirm_password',
			label: 'Confirm Password',
			type: 'password',
			placeholder: 'Confirm new password',
			required: true,
			icon: 'visibility'
		}
	],
	submitLabel: 'Reset Password',
	showCancel: false
};

// Post Job Form Configurations
export const POST_JOB_STEP1_CONFIG: FormConfig = {
	title: 'Basic Information',
	fields: [
		{
			name: 'title',
			type: 'text',
			label: 'Job Title',
			placeholder: 'e.g. Senior Software Engineer',
			required: true,
			hint: '10-100 characters required',
			validators: { minLength: 10, maxLength: 100 }
		},
		{
			name: 'company',
			type: 'text',
			label: 'Company',
			placeholder: 'Company name',
			required: true,
			width: 'half'
		},
		{
			name: 'department',
			type: 'text',
			label: 'Department',
			placeholder: 'e.g. Engineering',
			required: true,
			width: 'half'
		},
		{
			name: 'employment_type',
			type: 'select',
			label: 'Employment Type',
			required: true,
			width: 'half',
			options: [
				{ value: 'full-time', label: 'Full-time' },
				{ value: 'part-time', label: 'Part-time' },
				{ value: 'contract', label: 'Contract' },
				{ value: 'freelance', label: 'Freelance' },
				{ value: 'internship', label: 'Internship' }
			]
		},
		{
			name: 'experience_level',
			type: 'select',
			label: 'Experience Level',
			required: true,
			width: 'half',
			options: [
				{ value: 'entry', label: 'Entry Level' },
				{ value: 'junior', label: 'Junior' },
				{ value: 'mid', label: 'Mid Level' },
				{ value: 'senior', label: 'Senior' },
				{ value: 'lead', label: 'Lead' },
				{ value: 'executive', label: 'Executive' }
			]
		}
	]
};

export const POST_JOB_STEP2_CONFIG: FormConfig = {
	title: 'Location & Work Type',
	fields: [
		{
			name: 'location.city',
			type: 'text',
			label: 'City',
			placeholder: 'e.g. Bangalore',
			required: true,
			width: 'half'
		},
		{
			name: 'location.state',
			type: 'text',
			label: 'State',
			placeholder: 'e.g. Karnataka',
			required: true,
			width: 'half'
		},
		{
			name: 'location.country',
			type: 'text',
			label: 'Country',
			required: true,
			width: 'half'
		},
		{
			name: 'location.timezone',
			type: 'text',
			label: 'Timezone',
			required: true,
			width: 'half'
		},
		{
			name: 'job_type',
			type: 'select',
			label: 'Work Type',
			required: true,
			options: [
				{ value: 'remote', label: 'Remote' },
				{ value: 'onsite', label: 'On-site' },
				{ value: 'hybrid', label: 'Hybrid' }
			]
		}
	]
};

export const POST_JOB_STEP3_CONFIG: FormConfig = {
	title: 'Job Description',
	fields: [
		{
			name: 'description',
			type: 'textarea',
			label: 'Job Description',
			placeholder: 'Describe the role, what the candidate will do, and what makes this opportunity exciting...',
			required: true,
			rows: 6,
			hint: '100-2000 characters required',
			validators: { minLength: 100, maxLength: 2000 }
		}
	]
};

export const POST_JOB_STEP5_CONFIG: FormConfig = {
	title: 'Salary & Benefits',
	fields: [
		{
			name: 'salary.min',
			type: 'number',
			label: 'Min Salary',
			placeholder: '0',
			required: true,
			width: 'half'
		},
		{
			name: 'salary.max',
			type: 'number',
			label: 'Max Salary',
			placeholder: '0',
			required: true,
			width: 'half'
		},
		{
			name: 'salary.currency',
			type: 'select',
			label: 'Currency',
			required: true,
			width: 'half',
			options: [
				{ value: 'INR', label: 'INR (₹)' }
			]
		},
		{
			name: 'salary.period',
			type: 'select',
			label: 'Period',
			required: true,
			width: 'half',
			options: [
				{ value: 'yearly', label: 'Per Year' },
				{ value: 'monthly', label: 'Per Month' },
				{ value: 'hourly', label: 'Per Hour' }
			]
		},
		{
			name: 'salary.is_negotiable',
			type: 'checkbox',
			label: 'Salary is negotiable'
		}
	]
};

export const POST_JOB_STEP6_CONFIG: FormConfig = {
	title: 'Company Information',
	fields: [
		{
			name: 'company_info.company_size',
			type: 'select',
			label: 'Company Size',
			required: true,
			width: 'half',
			options: [
				{ value: '1-10', label: '1-10 employees' },
				{ value: '11-50', label: '11-50 employees' },
				{ value: '51-200', label: '51-200 employees' },
				{ value: '201-500', label: '201-500 employees' },
				{ value: '501-1000', label: '501-1000 employees' },
				{ value: '1000+', label: '1000+ employees' }
			]
		},
		{
			name: 'company_info.industry',
			type: 'select',
			label: 'Industry',
			required: true,
			width: 'half',
			options: [
				{ value: 'Technology', label: 'Technology' },
				{ value: 'Healthcare', label: 'Healthcare' },
				{ value: 'Finance', label: 'Finance' },
				{ value: 'Education', label: 'Education' },
				{ value: 'Retail', label: 'Retail' },
				{ value: 'Manufacturing', label: 'Manufacturing' },
				{ value: 'Consulting', label: 'Consulting' },
				{ value: 'Media & Entertainment', label: 'Media & Entertainment' },
				{ value: 'Real Estate', label: 'Real Estate' },
				{ value: 'Transportation', label: 'Transportation' },
				{ value: 'Energy', label: 'Energy' },
				{ value: 'Non-profit', label: 'Non-profit' },
				{ value: 'Government', label: 'Government' },
				{ value: 'Other', label: 'Other' }
			]
		},
		{
			name: 'company_info.website',
			type: 'text',
			label: 'Company Website',
			placeholder: 'https://company.com'
		},
		{
			name: 'company_info.description',
			type: 'textarea',
			label: 'Company Description',
			placeholder: 'Brief description of your company...',
			rows: 3
		}
	]
};

export const POST_JOB_STEP7_CONFIG: FormConfig = {
	title: 'HR Contact & Final Details',
	fields: [
		{
			name: 'hr_contact.name',
			type: 'text',
			label: 'Contact Name',
			placeholder: 'HR Contact Name',
			required: true,
			width: 'half'
		},
		{
			name: 'hr_contact.email',
			type: 'email',
			label: 'Contact Email',
			placeholder: 'hr@company.com',
			required: true,
			width: 'half'
		},
		{
			name: 'hr_contact.phone',
			type: 'text',
			label: 'Phone Number',
			placeholder: '+91 98765 43210',
			required: true,
			width: 'half'
		},
		{
			name: 'hr_contact.title',
			type: 'text',
			label: 'Job Title',
			placeholder: 'HR Manager',
			required: true,
			width: 'half'
		},
		{
			name: 'application_instructions',
			type: 'textarea',
			label: 'Application Instructions',
			placeholder: 'Special instructions for applicants...',
			rows: 3
		},
		{
			name: 'external_apply_url',
			type: 'text',
			label: 'External Apply URL (Optional)',
			placeholder: 'https://company.com/apply'
		},
		{
			name: 'is_active',
			type: 'checkbox',
			label: 'Publish job immediately'
		}
	]
};

// Resume Builder Form Configurations
export const RESUME_PERSONAL_INFO_CONFIG: FormConfig = {
	title: 'Personal Information',
	showActions: false,
	fields: [
		{
			name: 'full_name',
			type: 'text',
			label: 'Full Name',
			placeholder: 'e.g., Rajesh Kumar',
			required: true,
			icon: '',
			width: 'half',
		},
		{
			name: 'email',
			type: 'email',
			label: 'Email Address',
			placeholder: 'e.g., rajesh.kumar@example.com',
			required: true,
			width: 'half',
			icon: '',
		},
		{
			name: 'phone',
			type: 'text',
			label: 'Phone Number',
			placeholder: 'e.g., +91 98765 43210',
			required: true,
			width: 'half',
			icon: '',
		},
		{
			name: 'location',
			type: 'text',
			label: 'Location',
			placeholder: 'e.g., Bangalore, Karnataka',
			required: true,
			icon: '',
			width: 'half',
			hint: 'City, State/Country'
		},
		{
			name: 'linkedin',
			type: 'text',
			label: 'LinkedIn Profile',
			placeholder: 'e.g., linkedin.com/in/rajeshkumar',
			width: 'half',
			icon: '',
			hint: 'Professional networking profile'
		},
		{
			name: 'portfolio',
			type: 'text',
			label: 'Portfolio Website',
			placeholder: 'e.g., rajeshkumar.dev',
			width: 'half',
			icon: '',
			hint: 'Personal website or portfolio'
		},
		{
			name: 'github',
			type: 'text',
			label: 'GitHub Profile',
			placeholder: 'e.g., github.com/rajeshkumar',
			icon: '',
			hint: 'Code repository and projects',
			width: 'half',
		}
	]
};

export const RESUME_SUMMARY_CONFIG: FormConfig = {
	title: 'Professional Summary',
	showActions: false,
	fields: [
		{
			name: 'summary',
			type: 'textarea',
			label: 'Professional Summary',
			placeholder: 'Write a compelling summary of your professional experience, key skills, and career objectives. Aim for 3-4 sentences that highlight your unique value proposition.',
			required: true,
			rows: 6,
			validators: { minLength: 200, maxLength: 500 },	
		}
	]
};

export const RESUME_SKILLS_CONFIG: FormConfig = {
	title: 'Skills & Expertise',
	showActions: false,
	fields: [
		{
			name: 'technical_skills',
			type: 'dynamic-array',
			label: '',
			fields: [
				{
					name: 'name',
					type: 'text',
					label: 'Skill Name',
					placeholder: 'e.g., JavaScript',
					required: true,
					icon: 'code',
					width: 'quarter'
				},
				{
					name: 'version',
					type: 'text',
					label: 'Version',
					placeholder: 'e.g., ES6, v3.9',
					icon: '',
					width: 'quarter',
				},
				{
					name: 'experience',
					type: 'select',
					label: 'Experience',
					required: true,
					icon: '',
					width: 'quarter',
					options: [
						{ value: 'Less than 1 year', label: 'Less than 1 year' },
						{ value: '1 year', label: '1 year' },
						{ value: '2 years', label: '2 years' },
						{ value: '3 years', label: '3 years' },
						{ value: '4 years', label: '4 years' },
						{ value: '5+ years', label: '5+ years' }
					]
				}
			]
		},
		{
			name: 'soft_skills',
			type: 'chip-list',
			label: 'Soft Skills',
			placeholder: 'Add soft skills...'
		}
	]
};

export const RESUME_EXPERIENCE_CONFIG: FormConfig = {
	title: 'Work Experience',
	showActions: false,
	fields: [
		{
			name: 'experiences',
			type: 'dynamic-array',
			label: '',
			fields: [
				{
					name: 'company',
					type: 'text',
					label: 'Company Name',
					placeholder: 'e.g., TCS, Infosys, Wipro',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'position',
					type: 'text',
					label: 'Job Title',
					placeholder: 'e.g., Senior Software Engineer',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'start_date',
					type: 'date',
					label: 'Start Date',
					required: true,
					width: 'half'
				},
				{
					name: 'end_date',
					type: 'date',
					label: 'End Date',
					width: 'half',
					hint: 'Leave empty if current position'
				},
				{
					name: 'description',
					type: 'textarea',
					label: 'Job Description & Achievements',
					placeholder: '• Led development of microservices architecture\n• Improved system performance by 40%\n• Mentored junior developers',
					required: true,
					rows: 4,
					icon: '',
					width: 'full',
					hint: 'Use bullet points to highlight key achievements and responsibilities'
				}
			]
		}
	]
};

export const RESUME_EDUCATION_CONFIG: FormConfig = {
	title: 'Education',
	showActions: false,
	fields: [
		{
			name: 'education',
			type: 'dynamic-array',
			label: '',
			fields: [
				{
					name: 'institution',
					type: 'text',
					label: 'Institution Name',
					placeholder: 'e.g., IIT Bombay, BITS Pilani',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'education_type',
					type: 'select',
					label: 'Education Type',
					required: true,
					icon: '',
					width: 'half',
					options: [
						{ value: 'school', label: 'School' },
						{ value: 'pu', label: 'PU/Higher Secondary' },
						{ value: 'graduate', label: 'Graduate' },
						{ value: 'post_graduate', label: 'Post Graduate' },
						{ value: 'phd', label: 'PhD' },
						{ value: 'diploma', label: 'Diploma' }
					]
				},
				{
					name: 'start_date',
					type: 'date',
					label: 'Start Date',
					required: true,
					
					width: 'half'
				},
				{
					name: 'end_date',
					type: 'date',
					label: 'End Date',
					
					width: 'half',
					hint: 'Leave empty if currently studying'
				}
			]
		}
	]
};

export const RESUME_PROJECTS_CONFIG: FormConfig = {
	title: 'Projects',
	showActions: false,
	fields: [
		{
			name: 'projects',
			type: 'dynamic-array',
			label: '',
			fields: [
				{
					name: 'name',
					type: 'text',
					label: 'Project Name',
					placeholder: 'e.g., E-commerce Platform',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'url',
					type: 'url',
					label: 'Project URL',
					placeholder: 'e.g., github.com/rajeshkumar/project',
					icon: '',
					width: 'half',
					hint: 'GitHub, live demo, or portfolio link'
				},
				{
					name: 'technologies',
					type: 'text',
					label: 'Technologies Used / Skills Used',
					placeholder: 'e.g., React, Node.js, MongoDB, AWS',
					required: true,
					icon: '',
					width: 'full',
					hint: 'Separate technologies with commas'
				},
				{
					name: 'description',
					type: 'textarea',
					label: 'Project Description',
					placeholder: '• Built a full-stack e-commerce platform\n• Implemented secure payment processing\n• Achieved 99.9% uptime with 1000+ users',
					required: true,
					rows: 4,
					icon: '',
					width: 'full',
					hint: 'Highlight your role, technologies used, and impact'
				},
			]
		}
	]
};

export const RESUME_CERTIFICATIONS_CONFIG: FormConfig = {
	title: 'Certifications',
	showActions: false,
	fields: [
		{
			name: 'certifications',
			type: 'dynamic-array',
			label: '',
			fields: [
				{
					name: 'name',
					type: 'text',
					label: 'Certification Name',
					placeholder: 'e.g., AWS Solutions Architect',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'issuer',
					type: 'text',
					label: 'Issuing Organization',
					placeholder: 'e.g., AWS, Microsoft, Google',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'date',
					type: 'text',
					label: 'Issue Date',
					placeholder: 'e.g., March 2023',
					required: true,
					
					width: 'half'
				},
				{
					name: 'credential_id',
					type: 'text',
					label: 'Credential ID',
					placeholder: 'e.g., ABC123XYZ',
					icon: '',
					width: 'half',
					hint: 'Optional verification ID'
				}
			]
		}
	]
};

// Profile Form Configurations - Based on Resume Builder
export const PROFILE_BASIC_INFO_CONFIG: FormConfig = {
	title: 'Personal Information',
	fields: [
		{
			name: 'first_name',
			type: 'text',
			label: 'First Name',
			placeholder: 'e.g., John',
			required: true,
			icon: '',
			width: 'half'
		},
		{
			name: 'last_name',
			type: 'text',
			label: 'Last Name',
			placeholder: 'e.g., Doe',
			required: true,
			icon: '',
			width: 'half'
		},
		{
			name: 'email',
			type: 'email',
			label: 'Email Address',
			placeholder: 'e.g., rajesh.kumar@example.com',
			required: true,
			icon: '',
			readonly: true,
			width: 'half'
		},
		{
			name: 'phone',
			type: 'text',
			label: 'Phone Number',
			placeholder: 'e.g., +91 98765 43210',
			required: true,
			width: 'half',
			icon: '',
		},
		{
			name: 'date_of_birth',
			type: 'date',
			label: 'Date of Birth',
			width: 'half'
		},
		{
			name: 'location',
			type: 'text',
			label: 'Location',
			placeholder: 'e.g., Bangalore, Karnataka',
			required: true,
			icon: '',
			hint: 'City, State/Country',
			width: 'half'
		}
	]
};

export const PROFILE_PROFESSIONAL_CONFIG: FormConfig = {
	title: 'Professional Information',
	fields: [
		{
			name: 'professional_summary',
			type: 'textarea',
			label: 'Professional Summary',
			placeholder: 'Write a compelling summary of your professional experience, key skills, and career objectives. Aim for 3-4 sentences that highlight your unique value proposition.',
			required: true,
			rows: 4,
			validators: { minLength: 50 },
			width: 'full'
		},
		{
			name: 'current_role',
			type: 'text',
			label: 'Current Job Title',
			placeholder: 'e.g., Senior Software Engineer',
			required: true,
			icon: '',
			width: 'half'
		},
		{
			name: 'current_company',
			type: 'text',
			label: 'Current Company',
			placeholder: 'e.g., TCS, Infosys, Wipro',
			required: false,
			icon: '',
			width: 'half'
		},
		{
			name: 'overall_experience_years',
			type: 'number',
			label: 'Years of Experience',
			placeholder: '0',
			required: true,
			width: 'half'
		},
		{
			name: 'highest_qualification',
			type: 'select',
			label: 'Highest Qualification',
			required: true,
			width: 'half',
			options: [
				{ value: 'high_school', label: 'High School' },
				{ value: 'diploma', label: 'Diploma' },
				{ value: 'bachelors', label: 'Bachelor\'s Degree' },
				{ value: 'masters', label: 'Master\'s Degree' },
				{ value: 'phd', label: 'PhD' }
			]
		},
		{
			name: 'linkedin_link',
			type: 'text',
			label: 'LinkedIn Profile',
			placeholder: 'e.g., linkedin.com/in/rajeshkumar',
			width: 'half',
			icon: '',
			hint: 'Professional networking profile'
		},
		{
			name: 'github_link',
			type: 'text',
			label: 'GitHub Profile',
			placeholder: 'e.g., github.com/rajeshkumar',
			width: 'half',
			icon: '',
			hint: 'Code repository and projects'
		},
		{
			name: 'portfolio_link',
			type: 'text',
			label: 'Portfolio Website',
			placeholder: 'e.g., rajeshkumar.dev',
			icon: '',
			hint: 'Personal website or portfolio'
		}
	]
};

export const PROFILE_SKILLS_CONFIG: FormConfig = {
	title: 'Skills & Expertise',
	fields: [
		{
			name: 'technical_skills',
			type: 'dynamic-array',
			label: 'Skills',
			fields: [
				{
					name: 'name',
					type: 'text',
					label: 'Skill Name',
					placeholder: 'e.g., JavaScript',
					required: true,
					icon: '',
					width: 'quarter'
				},
				{
					name: 'version',
					type: 'text',
					label: 'Version',
					placeholder: 'e.g., ES6, v3.9',
					icon: '',
					width: 'quarter'
				},
				{
					name: 'experience',
					type: 'select',
					label: 'Experience',
					required: true,
					icon: '',
					width: 'quarter',
					options: [
						{ value: 'Beginner (0-6 months)', label: 'Beginner (0-6 months)' },
						{ value: '6 months - 1 year', label: '6 months - 1 year' },
						{ value: '1-2 years', label: '1-2 years' },
						{ value: '2-3 years', label: '2-3 years' },
						{ value: '3-4 years', label: '3-4 years' },
						{ value: '4-5 years', label: '4-5 years' },
						{ value: '5-7 years', label: '5-7 years' },
						{ value: '7-10 years', label: '7-10 years' },
						{ value: '10+ years', label: '10+ years' },
						{ value: 'Expert (15+ years)', label: 'Expert (15+ years)' }
					]
				}
			]
		}
	]
};

export const PROFILE_EXPERIENCE_CONFIG: FormConfig = {
	title: 'Work Experience',
	fields: [
		{
			name: 'experiences',
			type: 'dynamic-array',
			label: 'Work Experience',
			fields: [
				{
					name: 'company',
					type: 'text',
					label: 'Company Name',
					placeholder: 'e.g., TCS, Infosys, Wipro',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'position',
					type: 'text',
					label: 'Job Title',
					placeholder: 'e.g., Senior Software Engineer',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'start_date',
					type: 'date',
					label: 'Start Date',
					required: true,
					
					width: 'half'
				},
				{
					name: 'end_date',
					type: 'date',
					label: 'End Date',
					
					width: 'half',
					hint: 'Leave empty if current position'
				},
				{
					name: 'description',
					type: 'textarea',
					label: 'Job Description & Achievements',
					placeholder: '• Led development of microservices architecture\n• Improved system performance by 40%\n• Mentored junior developers',
					required: true,
					rows: 4,
					icon: '',
					hint: 'Use bullet points to highlight key achievements and responsibilities'
				}
			]
		}
	]
};

export const PROFILE_EDUCATION_CONFIG: FormConfig = {
	title: 'Education',
	fields: [
		{
			name: 'education',
			type: 'dynamic-array',
			label: 'Education',
			fields: [
				{
					name: 'institution',
					type: 'text',
					label: 'Institution Name',
					placeholder: 'e.g., IIT Bombay, BITS Pilani',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'education_type',
					type: 'select',
					label: 'Education Type',
					required: true,
					icon: '',
					width: 'half',
					options: [
						{ value: 'school', label: 'School' },
						{ value: 'pu', label: 'PU/Higher Secondary' },
						{ value: 'graduate', label: 'Graduate' },
						{ value: 'post_graduate', label: 'Post Graduate' },
						{ value: 'phd', label: 'PhD' },
						{ value: 'diploma', label: 'Diploma' }
					]
				},
				{
					name: 'start_date',
					type: 'date',
					label: 'Start Date',
					required: true,
					
					width: 'half'
				},
				{
					name: 'end_date',
					type: 'date',
					label: 'End Date',
					
					width: 'half',
					hint: 'Leave empty if currently studying'
				}
			]
		}
	]
};

export const PROFILE_PROJECTS_CONFIG: FormConfig = {
	title: 'Projects',
	fields: [
		{
			name: 'projects',
			type: 'dynamic-array',
			label: 'Projects',
			fields: [
				{
					name: 'name',
					type: 'text',
					label: 'Project Name',
					placeholder: 'e.g., E-commerce Platform',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'url',
					type: 'url',
					label: 'Project URL',
					placeholder: 'e.g., github.com/rajeshkumar/project',
					icon: '',
					width: 'half',
					hint: 'GitHub, live demo, or portfolio link'
				},
				{
					name: 'description',
					type: 'textarea',
					label: 'Project Description',
					placeholder: '• Built a full-stack e-commerce platform\n• Implemented secure payment processing\n• Achieved 99.9% uptime with 1000+ users',
					required: true,
					rows: 4,
					icon: '',
					hint: 'Highlight your role, technologies used, and impact'
				},
				{
					name: 'technologies',
					type: 'text',
					label: 'Technologies Used',
					placeholder: 'e.g., React, Node.js, MongoDB, AWS',
					required: true,
					icon: '',
					hint: 'Separate technologies with commas'
				}
			]
		}
	]
};

export const PROFILE_CERTIFICATIONS_CONFIG: FormConfig = {
	title: 'Certifications',
	fields: [
		{
			name: 'certifications',
			type: 'dynamic-array',
			label: 'Certifications',
			fields: [
				{
					name: 'name',
					type: 'text',
					label: 'Certification Name',
					placeholder: 'e.g., AWS Solutions Architect',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'issuer',
					type: 'text',
					label: 'Issuing Organization',
					placeholder: 'e.g., AWS, Microsoft, Google',
					required: true,
					icon: '',
					width: 'half'
				},
				{
					name: 'issue_date',
					type: 'date',
					label: 'Issue Date',
					placeholder: 'e.g., March 2023',
					required: true,
					
					width: 'half'
				},
				{
					name: 'credential_id',
					type: 'text',
					label: 'Credential ID',
					placeholder: 'e.g., ABC123XYZ',
					icon: '',
					width: 'half',
					hint: 'Optional verification ID'
				}
			]
		}
	]
};

export const PROFILE_JOB_PREFERENCES_CONFIG: FormConfig = {
	title: 'Career Preferences',
	fields: [
		{
			name: 'desired_job_title',
			type: 'text',
			label: 'Desired Job Title',
			placeholder: 'e.g., Senior Software Engineer',
			required: true,
			icon: '',
			width: 'half'
		},
		{
			name: 'job_preferences',
			type: 'select',
			label: 'Preferred Work Type',
			required: true,
			width: 'half',
			options: [
				{ value: 'remote', label: 'Remote' },
				{ value: 'hybrid', label: 'Hybrid' },
				{ value: 'on-site', label: 'On-site' }
			]
		},
		{
			name: 'employment_type',
			type: 'select',
			label: 'Employment Type',
			required: true,
			width: 'half',
			options: [
				{ value: 'full-time', label: 'Full-time' },
				{ value: 'part-time', label: 'Part-time' },
				{ value: 'contract', label: 'Contract' },
				{ value: 'freelancing', label: 'Freelancing' }
			]
		},
		{
			name: 'expected_salary',
			type: 'number',
			label: 'Expected Salary (Annual) (₹)',
			placeholder: '0',
			width: 'half',
			icon: ''
		}
	]
};
