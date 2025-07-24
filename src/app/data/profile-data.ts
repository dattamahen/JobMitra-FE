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
    { value: '40-60k', label: '$40,000 - $60,000' },
    { value: '60-80k', label: '$60,000 - $80,000' },
    { value: '80-100k', label: '$80,000 - $100,000' },
    { value: '100-120k', label: '$100,000 - $120,000' },
    { value: '120k+', label: '$120,000+' }
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
