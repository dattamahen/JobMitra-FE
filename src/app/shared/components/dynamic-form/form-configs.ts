import { FormConfig } from './dynamic-form.component';

export const LOGIN_FORM_CONFIG: FormConfig = {
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter your email',
      required: true,
      icon: 'email'
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
  submitLabel: 'Sign In'
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
      icon: 'email'
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
      name: 'user_type',
      label: 'Account Type',
      type: 'select',
      required: true,
      options: [
        { value: 'candidate', label: 'Job Seeker' },
        { value: 'hire', label: 'HR / Recruiter' }
      ]
    }
  ],
  submitLabel: 'Create Account'
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
        { value: 'INR', label: 'INR (₹)' },
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' }
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
  fields: [
    {
      name: 'full_name',
      type: 'text',
      label: 'Full Name',
      placeholder: 'e.g., John Doe',
      required: true,
      icon: 'person'
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'e.g., john@example.com',
      required: true,
      width: 'half',
      icon: 'email'
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      placeholder: 'e.g., +1 (555) 123-4567',
      required: true,
      width: 'half',
      icon: 'phone'
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      placeholder: 'e.g., San Francisco, CA',
      required: true,
      icon: 'location_on',
      hint: 'City, State/Country'
    },
    {
      name: 'linkedin',
      type: 'text',
      label: 'LinkedIn Profile',
      placeholder: 'e.g., linkedin.com/in/johndoe',
      width: 'half',
      icon: 'link',
      hint: 'Professional networking profile'
    },
    {
      name: 'portfolio',
      type: 'text',
      label: 'Portfolio Website',
      placeholder: 'e.g., johndoe.dev',
      width: 'half',
      icon: 'web',
      hint: 'Personal website or portfolio'
    },
    {
      name: 'github',
      type: 'text',
      label: 'GitHub Profile',
      placeholder: 'e.g., github.com/johndoe',
      icon: 'code',
      hint: 'Code repository and projects'
    }
  ]
};

export const RESUME_SUMMARY_CONFIG: FormConfig = {
  title: 'Professional Summary',
  fields: [
    {
      name: 'summary',
      type: 'textarea',
      label: 'Professional Summary',
      placeholder: 'Write a compelling summary of your professional experience, key skills, and career objectives. Aim for 3-4 sentences that highlight your unique value proposition.',
      required: true,
      rows: 6,
      validators: { minLength: 50 }
    }
  ]
};

// Profile Form Configurations
export const PROFILE_BASIC_INFO_CONFIG: FormConfig = {
  title: 'Basic Information',
  fields: [
    {
      name: 'first_name',
      type: 'text',
      label: 'First Name',
      required: true,
      width: 'half'
    },
    {
      name: 'last_name',
      type: 'text',
      label: 'Last Name',
      required: true,
      width: 'half'
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      placeholder: '+91 98765 43210',
      width: 'half'
    },
    {
      name: 'date_of_birth',
      type: 'text',
      label: 'Date of Birth',
      placeholder: 'YYYY-MM-DD',
      width: 'half'
    },
    {
      name: 'city',
      type: 'text',
      label: 'City',
      placeholder: 'City',
      width: 'half'
    },
    {
      name: 'state',
      type: 'text',
      label: 'State',
      placeholder: 'State',
      width: 'half'
    }
  ]
};

export const PROFILE_PROFESSIONAL_CONFIG: FormConfig = {
  title: 'Professional Information',
  fields: [
    {
      name: 'current_role',
      type: 'text',
      label: 'Current Role',
      placeholder: 'e.g. Senior Software Engineer',
      width: 'half'
    },
    {
      name: 'current_company',
      type: 'text',
      label: 'Current Company',
      placeholder: 'Company name',
      width: 'half'
    },
    {
      name: 'overall_experience_years',
      type: 'number',
      label: 'Years of Experience',
      placeholder: '0',
      width: 'quarter'
    },
    {
      name: 'highest_qualification',
      type: 'select',
      label: 'Highest Qualification',
      width: 'three-quarter',
      options: [
        { value: 'high_school', label: 'High School' },
        { value: 'diploma', label: 'Diploma' },
        { value: 'bachelors', label: 'Bachelor\'s Degree' },
        { value: 'masters', label: 'Master\'s Degree' },
        { value: 'phd', label: 'PhD' }
      ]
    },
    {
      name: 'professional_summary',
      type: 'textarea',
      label: 'Professional Summary',
      placeholder: 'Brief description of your professional background...',
      rows: 3
    },
    {
      name: 'linkedin_link',
      type: 'text',
      label: 'LinkedIn Profile',
      placeholder: 'https://linkedin.com/in/username',
      width: 'half'
    },
    {
      name: 'github_link',
      type: 'text',
      label: 'GitHub Profile',
      placeholder: 'https://github.com/username',
      width: 'half'
    }
  ]
};

export const PROFILE_JOB_PREFERENCES_CONFIG: FormConfig = {
  title: 'Job Preferences',
  fields: [
    {
      name: 'job_preferences',
      type: 'select',
      label: 'Preferred Work Type',
      width: 'half',
      options: [
        { value: 'remote', label: 'Remote' },
        { value: 'on-site', label: 'On-site' },
        { value: 'hybrid', label: 'Hybrid' }
      ]
    },
    {
      name: 'employment_type',
      type: 'select',
      label: 'Employment Type',
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
      label: 'Expected Salary',
      placeholder: '0',
      width: 'half'
    },
    {
      name: 'desired_job_title',
      type: 'text',
      label: 'Desired Job Title',
      placeholder: 'e.g. Senior Software Engineer',
      width: 'half'
    }
  ]
};