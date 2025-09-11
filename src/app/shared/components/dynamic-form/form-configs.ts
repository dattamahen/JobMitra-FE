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
      required: true
    },
    {
      name: 'department',
      type: 'text',
      label: 'Department',
      placeholder: 'e.g. Engineering',
      required: true
    },
    {
      name: 'employment_type',
      type: 'select',
      label: 'Employment Type',
      required: true,
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
      required: true
    },
    {
      name: 'location.state',
      type: 'text',
      label: 'State',
      placeholder: 'e.g. Karnataka',
      required: true
    },
    {
      name: 'location.country',
      type: 'text',
      label: 'Country',
      required: true
    },
    {
      name: 'location.timezone',
      type: 'text',
      label: 'Timezone',
      required: true
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
      required: true
    },
    {
      name: 'salary.max',
      type: 'number',
      label: 'Max Salary',
      placeholder: '0',
      required: true
    },
    {
      name: 'salary.currency',
      type: 'select',
      label: 'Currency',
      required: true,
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
      required: true
    },
    {
      name: 'hr_contact.email',
      type: 'email',
      label: 'Contact Email',
      placeholder: 'hr@company.com',
      required: true
    },
    {
      name: 'hr_contact.phone',
      type: 'text',
      label: 'Phone Number',
      placeholder: '+91 98765 43210',
      required: true
    },
    {
      name: 'hr_contact.title',
      type: 'text',
      label: 'Job Title',
      placeholder: 'HR Manager',
      required: true
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