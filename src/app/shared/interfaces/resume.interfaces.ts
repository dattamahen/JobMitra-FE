export interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
}

export interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
  achievements: string[];
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  credential_id?: string;
}

export interface ResumeSection {
  personal_info: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
  };
  projects: Project[];
  certifications: Certification[];
}

export interface Resume {
  resume_id: string;
  title: string;
  template_id?: string;
  sections: ResumeSection;
  ats_score: number;
  suggestions: string[];
  created_at?: string;
  updated_at?: string;
  is_primary?: boolean;
}

export interface ResumeTemplate {
  template_id: string;
  name: string;
  description: string;
  preview_url: string;
  category: string;
}