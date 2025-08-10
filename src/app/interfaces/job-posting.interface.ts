export interface JobPostingForm {
  // Basic Information
  title: string;
  company: string;
  department: string;
  
  // Location Information
  location: {
    city: string;
    state: string;
    country: string;
    timezone: string;
  };
  job_type: 'hybrid' | 'remote' | 'onsite';
  
  // Employment Details
  employment_type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  
  // Job Description
  description: string;
  responsibilities: string[];
  requirements: string[];
  
  // Skills
  skills_required: string[];
  skills_preferred: string[];
  
  // Compensation
  salary: {
    min: number;
    max: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'INR';
    period: 'yearly' | 'monthly' | 'hourly';
    is_negotiable: boolean;
  };
  
  // Benefits
  benefits: string[];
  
  // Company Information
  company_info: {
    company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
    industry: string;
    website?: string;
    description?: string;
  };
  
  // Application Details
  application_deadline?: Date;
  application_instructions?: string;
  external_apply_url?: string;
  
  // HR Contact
  hr_contact: {
    name: string;
    email: string;
    phone: string;
    title: string;
    department: string;
  };
  
  // Tags and Classification
  tags: string[];
  
  // Status
  is_active: boolean;
}

export interface JobPostingRequest {
  // Transform from JobPostingForm to API format
  job_id?: string;
  title: string;
  company: string;
  location: {
    city: string;
    state: string;
    country: string;
    is_remote: boolean;
    timezone: string;
  };
  employment_type: string;
  experience_level: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
    is_negotiable: boolean;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills_required: string[];
  skills_preferred: string[];
  benefits: string[];
  application_deadline?: string;
  company_info: {
    company_size: string;
    industry: string;
    website?: string;
    description?: string;
  };
  job_type: string;
  is_active: boolean;
  application_instructions?: string;
  external_apply_url?: string;
  hr_contact: {
    name: string;
    email: string;
    phone: string;
    title: string;
    department: string;
  };
  tags: string[];
}

export class JobPostingConverter {
  static formToApiRequest(form: JobPostingForm): JobPostingRequest {
    return {
      title: form.title,
      company: form.company,
      location: {
        city: form.location.city,
        state: form.location.state,
        country: form.location.country,
        is_remote: form.job_type === 'remote',
        timezone: form.location.timezone
      },
      employment_type: form.employment_type,
      experience_level: form.experience_level,
      salary: {
        min: form.salary.min,
        max: form.salary.max,
        currency: form.salary.currency,
        period: form.salary.period,
        is_negotiable: form.salary.is_negotiable
      },
      description: form.description,
      requirements: form.requirements,
      responsibilities: form.responsibilities,
      skills_required: form.skills_required,
      skills_preferred: form.skills_preferred,
      benefits: form.benefits,
      application_deadline: form.application_deadline?.toISOString(),
      company_info: form.company_info,
      job_type: form.job_type,
      is_active: form.is_active,
      application_instructions: form.application_instructions,
      external_apply_url: form.external_apply_url,
      hr_contact: form.hr_contact,
      tags: form.tags
    };
  }
}
