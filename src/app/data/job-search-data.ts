// Job Search Data Types and Interfaces

export interface HRContact {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly department?: string;
  readonly title?: string;
}

export interface JobRequirement {
  readonly id: string;
  readonly description: string;
  readonly type: 'required' | 'preferred' | 'nice-to-have';
  readonly category: 'technical' | 'soft-skills' | 'experience' | 'education' | 'certification';
}

export interface JobBenefit {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: 'health' | 'financial' | 'time-off' | 'professional' | 'lifestyle';
}

export interface LearningResource {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly youtubeUrl: string;
  readonly duration: string;
  readonly level: 'beginner' | 'intermediate' | 'advanced';
  readonly channel: string;
  readonly skill: string;
  readonly rating?: number;
}

export interface MockInterviewSession {
  readonly id: string;
  readonly skill: string;
  readonly date: Date;
  readonly duration: number; // in minutes
  readonly score?: number; // 0-100
  readonly feedback?: string;
  readonly questions: readonly string[];
  readonly status: 'completed' | 'in-progress' | 'cancelled';
}

export interface MockInterviewConfig {
  readonly maxSessionsPerWeek: number;
  readonly sessionDurationMinutes: number;
  readonly cooldownHours: number;
  readonly questionsPerSession: number;
  readonly skillCategories: readonly string[];
}

export interface UserMockInterviewData {
  readonly userId: string;
  readonly currentWeekSessions: readonly MockInterviewSession[];
  readonly totalSessions: number;
  readonly lastSessionDate?: Date;
  readonly nextAvailableSession?: Date;
}

export interface SubscriptionPlan {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly currency: 'USD' | 'EUR' | 'GBP' | 'INR';
  readonly period: 'monthly' | 'yearly';
  readonly features: readonly string[];
  readonly mockInterviewsPerWeek: number;
  readonly cooldownHours: number;
  readonly priority: 'basic' | 'premium' | 'enterprise';
  readonly isPopular?: boolean;
}

export interface UserSubscription {
  readonly userId: string;
  readonly planId: string;
  readonly status: 'active' | 'cancelled' | 'expired' | 'trial';
  readonly startDate: Date;
  readonly endDate: Date;
  readonly autoRenew: boolean;
  readonly paymentMethod?: string;
}

export interface SubscriptionLimits {
  readonly mockInterviewsPerWeek: number;
  readonly cooldownHours: number;
  readonly canAccessPremiumContent: boolean;
  readonly canSkipCooldown: boolean;
  readonly prioritySupport: boolean;
}

export interface CompanyInfo {
  readonly id: string;
  readonly name: string;
  readonly industry: string;
  readonly size: string;
  readonly website?: string;
  readonly logo?: string;
  readonly description?: string;
}

export interface SalaryRange {
  readonly min: number;
  readonly max: number;
  readonly currency: 'USD' | 'EUR' | 'GBP' | 'INR';
  readonly period: 'yearly' | 'monthly' | 'hourly';
}

export interface JobLocation {
  readonly type: 'remote' | 'onsite' | 'hybrid';
  readonly city?: string;
  readonly state?: string;
  readonly country: string;
  readonly address?: string;
  readonly timezone?: string;
}

export interface JobListing {
  readonly id: string;
  readonly title: string;
  readonly company: CompanyInfo;
  readonly location: JobLocation;
  readonly salary: SalaryRange;
  readonly matchPercentage: number;
  readonly shortDescription: string;
  readonly fullDescription: string;
  readonly requirements: JobRequirement[];
  readonly benefits?: JobBenefit[];
  readonly hrContact: HRContact;
  readonly skills: readonly string[];
  readonly experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  readonly employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  readonly department: string;
  readonly postedDate: Date;
  readonly applicationDeadline?: Date;
  readonly isActive: boolean;
  readonly tags: readonly string[];
  readonly learningResources?: readonly LearningResource[];
}

export interface FilterOptions {
  readonly locations: readonly string[];
  readonly categories: readonly string[];
  readonly experienceLevels: readonly string[];
  readonly employmentTypes: readonly string[];
  readonly salaryRanges: readonly { label: string; min: number; max: number }[];
}

// Sample Companies Data
export const COMPANIES_DATA: readonly CompanyInfo[] = [
  {
    id: 'techcorp',
    name: 'TechCorp Inc.',
    industry: 'Technology',
    size: '1000-5000',
    website: 'https://techcorp.com',
    description: 'Leading AI and cloud solutions provider'
  },
  {
    id: 'innovateai',
    name: 'InnovateAI',
    industry: 'Artificial Intelligence',
    size: '500-1000',
    website: 'https://innovateai.com',
    description: 'AI-powered recruitment and HR solutions'
  },
  {
    id: 'dataflow',
    name: 'DataFlow Solutions',
    industry: 'Data Analytics',
    size: '100-500',
    website: 'https://dataflow.com',
    description: 'Advanced data analytics and machine learning platform'
  }
] as const;

// Sample Job Requirements
const COMMON_REQUIREMENTS: readonly JobRequirement[] = [
  {
    id: 'req-1',
    description: '5+ years of experience in software development',
    type: 'required',
    category: 'experience'
  },
  {
    id: 'req-2',
    description: 'Proficiency in JavaScript, Python, or Java',
    type: 'required',
    category: 'technical'
  },
  {
    id: 'req-3',
    description: 'Experience with React and Node.js',
    type: 'required',
    category: 'technical'
  },
  {
    id: 'req-4',
    description: 'Knowledge of cloud platforms (AWS, GCP, or Azure)',
    type: 'preferred',
    category: 'technical'
  },
  {
    id: 'req-5',
    description: 'Strong understanding of software architecture',
    type: 'required',
    category: 'technical'
  },
  {
    id: 'req-6',
    description: 'Experience with agile development methodologies',
    type: 'preferred',
    category: 'experience'
  },
  {
    id: 'req-7',
    description: '3+ years of product management experience',
    type: 'required',
    category: 'experience'
  },
  {
    id: 'req-8',
    description: 'Experience with SaaS products',
    type: 'required',
    category: 'experience'
  },
  {
    id: 'req-9',
    description: 'Knowledge of recruitment or HR technology',
    type: 'preferred',
    category: 'technical'
  },
  {
    id: 'req-10',
    description: 'Strong analytical and data-driven decision making',
    type: 'required',
    category: 'soft-skills'
  },
  {
    id: 'req-11',
    description: 'Excellent communication and leadership skills',
    type: 'required',
    category: 'soft-skills'
  },
  {
    id: 'req-12',
    description: 'Master\'s degree in Data Science, Statistics, or related field',
    type: 'required',
    category: 'education'
  },
  {
    id: 'req-13',
    description: '3+ years of experience in machine learning',
    type: 'required',
    category: 'experience'
  },
  {
    id: 'req-14',
    description: 'Proficiency in Python and ML libraries (scikit-learn, pandas, numpy)',
    type: 'required',
    category: 'technical'
  },
  {
    id: 'req-15',
    description: 'Experience with deep learning frameworks (TensorFlow, PyTorch)',
    type: 'preferred',
    category: 'technical'
  },
  {
    id: 'req-16',
    description: 'Knowledge of SQL and database systems',
    type: 'required',
    category: 'technical'
  },
  {
    id: 'req-17',
    description: 'Experience with cloud ML platforms',
    type: 'preferred',
    category: 'technical'
  }
] as const;

// Sample Job Benefits
const COMMON_BENEFITS: readonly JobBenefit[] = [
  {
    id: 'benefit-1',
    title: 'Health Insurance',
    description: 'Comprehensive medical coverage for employee and family',
    category: 'health'
  },
  {
    id: 'benefit-2',
    title: 'PF & ESI',
    description: 'Provident Fund and Employee State Insurance',
    category: 'financial'
  },
  {
    id: 'benefit-3',
    title: 'Paid Leave',
    description: 'Annual leave, sick leave, and public holidays',
    category: 'time-off'
  },
  {
    id: 'benefit-4',
    title: 'Learning Budget',
    description: '₹1,50,000 annual professional development budget',
    category: 'professional'
  },
  {
    id: 'benefit-5',
    title: 'Remote Work',
    description: 'Work from anywhere with flexible hours',
    category: 'lifestyle'
  }
] as const;

// Learning Resources Data for Skills Improvement
export const LEARNING_RESOURCES_DATA: readonly LearningResource[] = [
  // JavaScript Resources
  {
    id: 'js-1',
    title: 'JavaScript Crash Course For Beginners',
    description: 'Learn JavaScript fundamentals including variables, functions, DOM manipulation, and more',
    youtubeUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
    duration: '1h 40m',
    level: 'beginner',
    channel: 'Traversy Media',
    skill: 'JavaScript',
    rating: 4.8
  },
  {
    id: 'js-2',
    title: 'Modern JavaScript ES6+ Features',
    description: 'Master advanced JavaScript concepts including arrow functions, destructuring, modules',
    youtubeUrl: 'https://www.youtube.com/watch?v=nZ1DMMsyVyI',
    duration: '2h 15m',
    level: 'intermediate',
    channel: 'FreeCodeCamp',
    skill: 'JavaScript',
    rating: 4.9
  },
  {
    id: 'js-3',
    title: 'JavaScript Design Patterns',
    description: 'Learn advanced design patterns and best practices for scalable JavaScript applications',
    youtubeUrl: 'https://www.youtube.com/watch?v=kuirGzhGhyw',
    duration: '1h 30m',
    level: 'advanced',
    channel: 'DevEd',
    skill: 'JavaScript',
    rating: 4.7
  },

  // React Resources
  {
    id: 'react-1',
    title: 'React Tutorial for Beginners',
    description: 'Complete React tutorial covering components, state, props, and hooks',
    youtubeUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    duration: '3h 48m',
    level: 'beginner',
    channel: 'React',
    skill: 'React',
    rating: 4.9
  },
  {
    id: 'react-2',
    title: 'React Hooks Complete Guide',
    description: 'Master React Hooks including useState, useEffect, useContext, and custom hooks',
    youtubeUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
    duration: '2h 20m',
    level: 'intermediate',
    channel: 'Codevolution',
    skill: 'React',
    rating: 4.8
  },
  {
    id: 'react-3',
    title: 'Advanced React Patterns and Performance',
    description: 'Learn advanced React patterns, performance optimization, and best practices',
    youtubeUrl: 'https://www.youtube.com/watch?v=3XaXKiXtNjw',
    duration: '1h 45m',
    level: 'advanced',
    channel: 'React Conf',
    skill: 'React',
    rating: 4.7
  },

  // Node.js Resources
  {
    id: 'node-1',
    title: 'Node.js Tutorial for Beginners',
    description: 'Learn Node.js fundamentals, modules, file system, and building your first server',
    youtubeUrl: 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
    duration: '3h 26m',
    level: 'beginner',
    channel: 'Programming with Mosh',
    skill: 'Node.js',
    rating: 4.9
  },
  {
    id: 'node-2',
    title: 'Express.js & Node.js API Development',
    description: 'Build RESTful APIs with Express.js, middleware, authentication, and database integration',
    youtubeUrl: 'https://www.youtube.com/watch?v=L72fhGm1tfE',
    duration: '4h 30m',
    level: 'intermediate',
    channel: 'FreeCodeCamp',
    skill: 'Node.js',
    rating: 4.8
  },

  // Python Resources
  {
    id: 'python-1',
    title: 'Python Tutorial - Python for Beginners',
    description: 'Complete Python tutorial covering syntax, data structures, functions, and OOP',
    youtubeUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    duration: '6h 14m',
    level: 'beginner',
    channel: 'Programming with Mosh',
    skill: 'Python',
    rating: 4.9
  },
  {
    id: 'python-2',
    title: 'Advanced Python Programming',
    description: 'Learn decorators, generators, context managers, and advanced Python concepts',
    youtubeUrl: 'https://www.youtube.com/watch?v=HGOBQPFzWKo',
    duration: '2h 45m',
    level: 'advanced',
    channel: 'Real Python',
    skill: 'Python',
    rating: 4.8
  },

  // AWS Resources
  {
    id: 'aws-1',
    title: 'AWS Tutorial for Beginners',
    description: 'Introduction to AWS services including EC2, S3, RDS, and basic cloud concepts',
    youtubeUrl: 'https://www.youtube.com/watch?v=3hLmDS179YE',
    duration: '4h 29m',
    level: 'beginner',
    channel: 'FreeCodeCamp',
    skill: 'AWS',
    rating: 4.8
  },
  {
    id: 'aws-2',
    title: 'AWS Lambda and Serverless Architecture',
    description: 'Master serverless computing with AWS Lambda, API Gateway, and DynamoDB',
    youtubeUrl: 'https://www.youtube.com/watch?v=71cd5XerKss',
    duration: '3h 15m',
    level: 'intermediate',
    channel: 'AWS',
    skill: 'AWS',
    rating: 4.7
  },

  // Docker Resources
  {
    id: 'docker-1',
    title: 'Docker Tutorial for Beginners',
    description: 'Learn Docker fundamentals, containers, images, and basic Docker commands',
    youtubeUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
    duration: '2h 46m',
    level: 'beginner',
    channel: 'TechWorld with Nana',
    skill: 'Docker',
    rating: 4.9
  },
  {
    id: 'docker-2',
    title: 'Docker Compose and Multi-Container Applications',
    description: 'Master Docker Compose for orchestrating multi-container applications',
    youtubeUrl: 'https://www.youtube.com/watch?v=DM65_JyGxCo',
    duration: '1h 30m',
    level: 'intermediate',
    channel: 'Docker',
    skill: 'Docker',
    rating: 4.8
  },

  // Kubernetes Resources
  {
    id: 'k8s-1',
    title: 'Kubernetes Tutorial for Beginners',
    description: 'Learn Kubernetes basics, pods, services, deployments, and cluster management',
    youtubeUrl: 'https://www.youtube.com/watch?v=X48VuDVv0do',
    duration: '4h 3m',
    level: 'beginner',
    channel: 'TechWorld with Nana',
    skill: 'Kubernetes',
    rating: 4.9
  },

  // Machine Learning Resources
  {
    id: 'ml-1',
    title: 'Machine Learning Course for Beginners',
    description: 'Introduction to ML concepts, algorithms, and hands-on projects with Python',
    youtubeUrl: 'https://www.youtube.com/watch?v=NWONeJKn6kc',
    duration: '10h 52m',
    level: 'beginner',
    channel: 'FreeCodeCamp',
    skill: 'Machine Learning',
    rating: 4.8
  },
  {
    id: 'ml-2',
    title: 'Deep Learning with TensorFlow',
    description: 'Master neural networks and deep learning using TensorFlow and Keras',
    youtubeUrl: 'https://www.youtube.com/watch?v=tPYj3fFJGjk',
    duration: '7h 0m',
    level: 'intermediate',
    channel: 'TensorFlow',
    skill: 'TensorFlow',
    rating: 4.7
  },

  // Statistics Resources
  {
    id: 'stats-1',
    title: 'Statistics for Data Science',
    description: 'Essential statistics concepts for data science and machine learning',
    youtubeUrl: 'https://www.youtube.com/watch?v=xxpc-HPKN28',
    duration: '8h 15m',
    level: 'beginner',
    channel: 'FreeCodeCamp',
    skill: 'Statistics',
    rating: 4.8
  },

  // Product Management Resources
  {
    id: 'pm-1',
    title: 'Product Management Fundamentals',
    description: 'Learn product strategy, roadmapping, user research, and product lifecycle',
    youtubeUrl: 'https://www.youtube.com/watch?v=2VP7ctmCgAY',
    duration: '2h 30m',
    level: 'beginner',
    channel: 'Product School',
    skill: 'Product Management',
    rating: 4.7
  },
  {
    id: 'pm-2',
    title: 'Advanced Product Analytics',
    description: 'Master product metrics, A/B testing, and data-driven product decisions',
    youtubeUrl: 'https://www.youtube.com/watch?v=VTU_5yZZiRc',
    duration: '1h 45m',
    level: 'intermediate',
    channel: 'Amplitude',
    skill: 'Analytics',
    rating: 4.6
  },

  // SQL Resources
  {
    id: 'sql-1',
    title: 'SQL Tutorial for Beginners',
    description: 'Complete SQL course covering queries, joins, functions, and database design',
    youtubeUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    duration: '4h 20m',
    level: 'beginner',
    channel: 'FreeCodeCamp',
    skill: 'SQL',
    rating: 4.9
  },
  {
    id: 'sql-2',
    title: 'Advanced SQL Techniques',
    description: 'Master window functions, CTEs, stored procedures, and query optimization',
    youtubeUrl: 'https://www.youtube.com/watch?v=2Fn0WAyZV0E',
    duration: '3h 0m',
    level: 'advanced',
    channel: 'ExcelIsFun',
    skill: 'SQL',
    rating: 4.7
  },

  // Agile Resources
  {
    id: 'agile-1',
    title: 'Agile and Scrum Tutorial',
    description: 'Learn Agile methodologies, Scrum framework, sprints, and team collaboration',
    youtubeUrl: 'https://www.youtube.com/watch?v=9TycLR0TqFA',
    duration: '1h 20m',
    level: 'beginner',
    channel: 'Simplilearn',
    skill: 'Agile',
    rating: 4.6
  }
] as const;

// Mock Interview Configuration
export const MOCK_INTERVIEW_CONFIG: MockInterviewConfig = {
  maxSessionsPerWeek: 2,
  sessionDurationMinutes: 30,
  cooldownHours: 24,
  questionsPerSession: 8,
  skillCategories: [
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'AWS',
    'Machine Learning',
    'Product Management',
    'Communication',
    'Leadership',
    'Problem Solving',
    'SQL',
    'Docker',
    'Kubernetes'
  ]
} as const;

// Subscription Plans Data
export const SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Perfect for getting started with AI mock interviews',
    price: 0,
    currency: 'USD',
    period: 'monthly',
    features: [
      '2 AI mock interviews per week',
      '24-hour cooldown between interviews',
      'Basic feedback and scoring',
      'Standard question database',
      'Email support'
    ],
    mockInterviewsPerWeek: 2,
    cooldownHours: 24,
    priority: 'basic'
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    description: 'For serious interview preparation and skill development',
    price: 19.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      '10 AI mock interviews per week',
      '4-hour cooldown between interviews',
      'Advanced feedback with improvement tips',
      'Extended question database',
      'Industry-specific questions',
      'Performance analytics dashboard',
      'Priority email support',
      'Skip cooldown 2x per week'
    ],
    mockInterviewsPerWeek: 10,
    cooldownHours: 4,
    priority: 'premium',
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'Unlimited access for teams and organizations',
    price: 49.99,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Unlimited AI mock interviews',
      'No cooldown period',
      'Custom question creation',
      'Team analytics and reporting',
      'White-label options',
      'API access',
      '24/7 priority support',
      'Custom integrations',
      'Dedicated account manager'
    ],
    mockInterviewsPerWeek: 999,
    cooldownHours: 0,
    priority: 'enterprise'
  }
] as const;

// Sample Mock Interview Questions by Skill
export const MOCK_INTERVIEW_QUESTIONS: Record<string, readonly string[]> = {
  'JavaScript': [
    'What is the difference between let, const, and var in JavaScript?',
    'Explain event delegation and how it works.',
    'What are closures in JavaScript and provide an example?',
    'How does prototypal inheritance work in JavaScript?',
    'What is the event loop and how does it work?',
    'Explain the difference between == and === operators.',
    'What are promises and how do they differ from callbacks?',
    'How do you handle asynchronous operations in JavaScript?',
    'What is hoisting in JavaScript?',
    'Explain the concept of this keyword in JavaScript.'
  ],
  'React': [
    'What is the virtual DOM and how does it work?',
    'Explain the difference between state and props.',
    'What are React hooks and why were they introduced?',
    'How do you optimize React application performance?',
    'What is the component lifecycle in React?',
    'Explain the concept of lifting state up.',
    'What are controlled vs uncontrolled components?',
    'How does React handle events?',
    'What is the purpose of keys in React lists?',
    'Explain the difference between class and functional components.'
  ],
  'Python': [
    'What are the key features of Python?',
    'Explain the difference between lists and tuples.',
    'What is a decorator in Python?',
    'How does garbage collection work in Python?',
    'What are generators and when would you use them?',
    'Explain the concept of duck typing.',
    'What is the difference between deep copy and shallow copy?',
    'How do you handle exceptions in Python?',
    'What are lambda functions?',
    'Explain the Global Interpreter Lock (GIL).'
  ],
  'Communication': [
    'How do you handle difficult conversations with team members?',
    'Describe a time when you had to explain a complex technical concept to a non-technical audience.',
    'How do you ensure effective communication in remote teams?',
    'What strategies do you use to give constructive feedback?',
    'How do you handle disagreements during team meetings?',
    'Describe your approach to presenting ideas to stakeholders.',
    'How do you adapt your communication style for different audiences?',
    'What techniques do you use for active listening?'
  ],
  'Leadership': [
    'Describe your leadership style and when you adapt it.',
    'How do you motivate team members during challenging projects?',
    'Tell me about a time you had to make a difficult decision as a leader.',
    'How do you handle underperforming team members?',
    'What strategies do you use to build trust within your team?',
    'How do you delegate tasks effectively?',
    'Describe a time when you had to lead through change.',
    'How do you resolve conflicts between team members?'
  ]
} as const;

// Main Job Listings Data
export const JOB_LISTINGS_DATA: readonly JobListing[] = [
  {
    id: 'senior-software-engineer',
    title: 'Senior Software Engineer',
    company: COMPANIES_DATA[0], // TechCorp Inc.
    location: {
      type: 'hybrid',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      timezone: 'PST'
    },
    salary: {
      min: 120000,
      max: 180000,
      currency: 'USD',
      period: 'yearly'
    },
    matchPercentage: 92,
    shortDescription: 'Join our team to build scalable AI-powered applications...',
    fullDescription: 'We are looking for a Senior Software Engineer to join our dynamic team and help build next-generation AI-powered applications. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies. Our tech stack includes React, Node.js, Python, and cloud services. You will work closely with product managers, designers, and other engineers to deliver high-quality software solutions.',
    requirements: [
      COMMON_REQUIREMENTS[0], // 5+ years experience
      COMMON_REQUIREMENTS[1], // JS/Python/Java
      COMMON_REQUIREMENTS[2], // React/Node.js
      COMMON_REQUIREMENTS[3], // Cloud platforms
      COMMON_REQUIREMENTS[4], // Software architecture
      COMMON_REQUIREMENTS[5]  // Agile methodologies
    ],
    benefits: [
      COMMON_BENEFITS[0], // Health Insurance
      COMMON_BENEFITS[1], // 401k
      COMMON_BENEFITS[3], // Learning Budget
      COMMON_BENEFITS[4]  // Remote Work
    ],
    hrContact: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      phone: '+1 (555) 123-4567',
      title: 'Senior Technical Recruiter',
      department: 'Human Resources'
    },
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes'],
    experienceLevel: 'senior',
    employmentType: 'full-time',
    department: 'Engineering',
    postedDate: new Date('2025-01-15'),
    applicationDeadline: new Date('2025-02-15'),
    isActive: true,
    tags: ['ai', 'full-stack', 'cloud', 'remote-friendly'],
    learningResources: [
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'JavaScript')!,
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'React')!,
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'Node.js')!,
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'AWS')!,
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'Docker')!
    ].filter(Boolean)
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    company: COMPANIES_DATA[1], // InnovateAI
    location: {
      type: 'onsite',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      timezone: 'EST'
    },
    salary: {
      min: 100000,
      max: 150000,
      currency: 'USD',
      period: 'yearly'
    },
    matchPercentage: 78,
    shortDescription: 'Lead product strategy for our AI recruitment platform...',
    fullDescription: 'We are seeking an experienced Product Manager to lead the product strategy and roadmap for our AI-powered recruitment platform. You will work closely with engineering, design, and business teams to define product requirements, prioritize features, and ensure successful product launches. The ideal candidate has experience in SaaS products and understands the recruitment/HR technology space.',
    requirements: [
      COMMON_REQUIREMENTS[6],  // 3+ years PM experience
      COMMON_REQUIREMENTS[7],  // SaaS experience
      COMMON_REQUIREMENTS[8],  // HR tech knowledge
      COMMON_REQUIREMENTS[9],  // Analytical skills
      COMMON_REQUIREMENTS[10], // Communication skills
      COMMON_REQUIREMENTS[5]   // Agile methodologies
    ],
    benefits: [
      COMMON_BENEFITS[0], // Health Insurance
      COMMON_BENEFITS[1], // 401k
      COMMON_BENEFITS[2], // Flexible PTO
      COMMON_BENEFITS[3]  // Learning Budget
    ],
    hrContact: {
      name: 'Michael Chen',
      email: 'michael.chen@innovateai.com',
      phone: '+1 (555) 234-5678',
      title: 'Talent Acquisition Manager',
      department: 'Human Resources'
    },
    skills: ['Product Management', 'Analytics', 'SaaS', 'Agile', 'User Research', 'SQL'],
    experienceLevel: 'mid',
    employmentType: 'full-time',
    department: 'Product',
    postedDate: new Date('2025-01-10'),
    applicationDeadline: new Date('2025-02-10'),
    isActive: true,
    tags: ['product', 'saas', 'ai', 'hr-tech'],
    learningResources: [
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'Product Management')!,
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'Analytics')!,
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'SQL')!,
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'Agile')!
    ].filter(Boolean)
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    company: COMPANIES_DATA[2], // DataFlow Solutions
    location: {
      type: 'remote',
      country: 'USA',
      timezone: 'Various'
    },
    salary: {
      min: 130000,
      max: 170000,
      currency: 'USD',
      period: 'yearly'
    },
    matchPercentage: 85,
    shortDescription: 'Develop machine learning models for talent matching...',
    fullDescription: 'Join our data science team to develop and implement machine learning models that power our talent matching algorithms. You will work with large datasets, build predictive models, and collaborate with engineering teams to deploy ML solutions at scale. This role requires strong technical skills in machine learning, statistics, and programming.',
    requirements: [
      COMMON_REQUIREMENTS[11], // Master's degree
      COMMON_REQUIREMENTS[12], // 3+ years ML experience
      COMMON_REQUIREMENTS[13], // Python/ML libraries
      COMMON_REQUIREMENTS[14], // Deep learning frameworks
      COMMON_REQUIREMENTS[15], // SQL/databases
      COMMON_REQUIREMENTS[16]  // Cloud ML platforms
    ],
    benefits: [
      COMMON_BENEFITS[0], // Health Insurance
      COMMON_BENEFITS[1], // 401k
      COMMON_BENEFITS[2], // Flexible PTO
      COMMON_BENEFITS[3], // Learning Budget
      COMMON_BENEFITS[4]  // Remote Work
    ],
    hrContact: {
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@dataflow.com',
      phone: '+1 (555) 345-6789',
      title: 'HR Business Partner',
      department: 'Human Resources'
    },
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Statistics', 'AWS'],
    experienceLevel: 'mid',
    employmentType: 'full-time',
    department: 'Data Science',
    postedDate: new Date('2025-01-12'),
    applicationDeadline: new Date('2025-02-12'),
    isActive: true,
    tags: ['data-science', 'machine-learning', 'remote', 'analytics'],
    learningResources: [
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'Python')!,
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'Machine Learning')!,
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'TensorFlow')!,
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'Statistics')!,
      LEARNING_RESOURCES_DATA.find(r => r.skill === 'SQL')!
    ].filter(Boolean)
  }
] as const;

// Filter Options Data
export const FILTER_OPTIONS_DATA: FilterOptions = {
  locations: [
    'All Locations',
    'Remote',
    'San Francisco, CA',
    'New York, NY',
    'Seattle, WA',
    'Austin, TX',
    'Boston, MA',
    'Chicago, IL'
  ],
  categories: [
    'All Categories',
    'Software Development',
    'Data Science',
    'Product Management',
    'Design',
    'Marketing',
    'Sales',
    'Customer Success'
  ],
  experienceLevels: [
    'All Levels',
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Lead/Principal',
    'Executive'
  ],
  employmentTypes: [
    'All Types',
    'Full-time',
    'Part-time',
    'Contract',
    'Internship'
  ],
  salaryRanges: [
    { label: 'All Ranges', min: 0, max: 1000000 },
    { label: '$40k - $60k', min: 40000, max: 60000 },
    { label: '$60k - $80k', min: 60000, max: 80000 },
    { label: '$80k - $100k', min: 80000, max: 100000 },
    { label: '$100k - $120k', min: 100000, max: 120000 },
    { label: '$120k - $150k', min: 120000, max: 150000 },
    { label: '$150k+', min: 150000, max: 1000000 }
  ]
} as const;

// Utility functions for data manipulation
export class JobSearchDataService {
  static getAllJobs(): readonly JobListing[] {
    return JOB_LISTINGS_DATA;
  }

  static getActiveJobs(): readonly JobListing[] {
    return JOB_LISTINGS_DATA.filter(job => job.isActive);
  }

  static getJobById(id: string): JobListing | undefined {
    return JOB_LISTINGS_DATA.find(job => job.id === id);
  }

  static getJobsByCompany(companyId: string): readonly JobListing[] {
    return JOB_LISTINGS_DATA.filter(job => job.company.id === companyId);
  }

  static getJobsByExperienceLevel(level: JobListing['experienceLevel']): readonly JobListing[] {
    return JOB_LISTINGS_DATA.filter(job => job.experienceLevel === level);
  }

  static getJobsByLocation(locationType: JobLocation['type']): readonly JobListing[] {
    return JOB_LISTINGS_DATA.filter(job => job.location.type === locationType);
  }

  static getJobsBySalaryRange(minSalary: number, maxSalary: number): readonly JobListing[] {
    return JOB_LISTINGS_DATA.filter(job => 
      job.salary.min >= minSalary && job.salary.max <= maxSalary
    );
  }

  static searchJobs(query: string): readonly JobListing[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return JOB_LISTINGS_DATA;

    return JOB_LISTINGS_DATA.filter(job =>
      job.title.toLowerCase().includes(searchTerm) ||
      job.company.name.toLowerCase().includes(searchTerm) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      job.department.toLowerCase().includes(searchTerm)
    );
  }

  static formatSalary(salary: SalaryRange): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    const minFormatted = formatter.format(salary.min);
    const maxFormatted = formatter.format(salary.max);
    
    return `${minFormatted} - ${maxFormatted}`;
  }

  static formatLocation(location: JobLocation): string {
    if (location.type === 'remote') {
      return 'Remote';
    }
    
    const parts = [location.city, location.state].filter(Boolean);
    const locationStr = parts.join(', ');
    
    if (location.type === 'hybrid') {
      return `${locationStr} (Hybrid)`;
    }
    
    return locationStr;
  }

  static getFilterOptions(): FilterOptions {
    return FILTER_OPTIONS_DATA;
  }

  static getLearningResourcesBySkills(skills: readonly string[]): readonly LearningResource[] {
    return LEARNING_RESOURCES_DATA.filter(resource => 
      skills.some(skill => 
        skill.toLowerCase().includes(resource.skill.toLowerCase()) ||
        resource.skill.toLowerCase().includes(skill.toLowerCase())
      )
    );
  }

  static getLearningResourcesBySkill(skill: string): readonly LearningResource[] {
    return LEARNING_RESOURCES_DATA.filter(resource => 
      resource.skill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(resource.skill.toLowerCase())
    );
  }

  static getAllLearningResources(): readonly LearningResource[] {
    return LEARNING_RESOURCES_DATA;
  }

  static getLearningResourcesByLevel(level: LearningResource['level']): readonly LearningResource[] {
    return LEARNING_RESOURCES_DATA.filter(resource => resource.level === level);
  }

  static getYouTubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  // Mock Interview Management Methods
  static getMockInterviewConfig(): MockInterviewConfig {
    return MOCK_INTERVIEW_CONFIG;
  }

  static getInterviewQuestionsForSkill(skill: string): readonly string[] {
    const normalizedSkill = skill.toLowerCase();
    for (const [key, questions] of Object.entries(MOCK_INTERVIEW_QUESTIONS)) {
      if (key.toLowerCase() === normalizedSkill || 
          normalizedSkill.includes(key.toLowerCase()) ||
          key.toLowerCase().includes(normalizedSkill)) {
        return questions;
      }
    }
    return [];
  }

  static canUserTakeInterview(userData: UserMockInterviewData): boolean {
    const config = MOCK_INTERVIEW_CONFIG;
    const now = new Date();
    
    // Check if user has exceeded weekly limit
    if (userData.currentWeekSessions.length >= config.maxSessionsPerWeek) {
      return false;
    }
    
    // Check cooldown period
    if (userData.lastSessionDate) {
      const timeSinceLastSession = now.getTime() - userData.lastSessionDate.getTime();
      const cooldownMs = config.cooldownHours * 60 * 60 * 1000;
      if (timeSinceLastSession < cooldownMs) {
        return false;
      }
    }
    
    return true;
  }

  static getNextAvailableInterviewTime(userData: UserMockInterviewData): Date | null {
    const config = MOCK_INTERVIEW_CONFIG;
    const now = new Date();
    
    // If weekly limit reached, return start of next week
    if (userData.currentWeekSessions.length >= config.maxSessionsPerWeek) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 7); // Next Monday
      startOfWeek.setHours(0, 0, 0, 0);
      return startOfWeek;
    }
    
    // If in cooldown, return when cooldown expires
    if (userData.lastSessionDate) {
      const cooldownMs = config.cooldownHours * 60 * 60 * 1000;
      const nextAvailable = new Date(userData.lastSessionDate.getTime() + cooldownMs);
      if (nextAvailable > now) {
        return nextAvailable;
      }
    }
    
    return null;
  }

  static getCurrentWeekSessions(allSessions: readonly MockInterviewSession[]): readonly MockInterviewSession[] {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    return allSessions.filter(session => session.date >= startOfWeek);
  }

  static generateInterviewQuestions(skill: string, count: number = 8): readonly string[] {
    const allQuestions = this.getInterviewQuestionsForSkill(skill);
    if (allQuestions.length === 0) {
      return [
        `What interests you most about ${skill}?`,
        `How would you approach learning ${skill} from scratch?`,
        `What are the main challenges in ${skill}?`,
        `Can you describe a project where you used ${skill}?`,
        `What are the best practices for ${skill}?`,
        `How do you stay updated with ${skill} trends?`,
        `What tools or frameworks complement ${skill}?`,
        `How would you explain ${skill} to a beginner?`
      ];
    }
    
    // Shuffle and return requested count
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  static formatTimeUntilNextInterview(nextTime: Date): string {
    const now = new Date();
    const diff = nextTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Available now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Subscription Management Methods
  static getSubscriptionPlans(): readonly SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  static getSubscriptionPlanById(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  }

  static getUserSubscriptionLimits(userSubscription?: UserSubscription): SubscriptionLimits {
    const plan = userSubscription 
      ? this.getSubscriptionPlanById(userSubscription.planId)
      : SUBSCRIPTION_PLANS[0]; // Default to free plan

    if (!plan) {
      // Fallback to free plan if subscription plan not found
      const freePlan = SUBSCRIPTION_PLANS[0];
      return {
        mockInterviewsPerWeek: freePlan.mockInterviewsPerWeek,
        cooldownHours: freePlan.cooldownHours,
        canAccessPremiumContent: false,
        canSkipCooldown: false,
        prioritySupport: false
      };
    }

    return {
      mockInterviewsPerWeek: plan.mockInterviewsPerWeek,
      cooldownHours: plan.cooldownHours,
      canAccessPremiumContent: plan.priority !== 'basic',
      canSkipCooldown: plan.priority === 'premium' || plan.priority === 'enterprise',
      prioritySupport: plan.priority !== 'basic'
    };
  }

  static canUserTakeInterviewWithSubscription(
    userData: UserMockInterviewData, 
    userSubscription?: UserSubscription
  ): boolean {
    const limits = this.getUserSubscriptionLimits(userSubscription);
    const now = new Date();
    
    // Check if user has exceeded weekly limit based on their subscription
    if (userData.currentWeekSessions.length >= limits.mockInterviewsPerWeek) {
      return false;
    }
    
    // Check cooldown period based on subscription
    if (userData.lastSessionDate && limits.cooldownHours > 0) {
      const timeSinceLastSession = now.getTime() - userData.lastSessionDate.getTime();
      const cooldownMs = limits.cooldownHours * 60 * 60 * 1000;
      if (timeSinceLastSession < cooldownMs) {
        return false;
      }
    }
    
    return true;
  }

  static getNextAvailableInterviewTimeWithSubscription(
    userData: UserMockInterviewData,
    userSubscription?: UserSubscription
  ): Date | null {
    const limits = this.getUserSubscriptionLimits(userSubscription);
    const now = new Date();
    
    // If weekly limit reached, return start of next week
    if (userData.currentWeekSessions.length >= limits.mockInterviewsPerWeek) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 7); // Next Monday
      startOfWeek.setHours(0, 0, 0, 0);
      return startOfWeek;
    }
    
    // If in cooldown, return when cooldown expires
    if (userData.lastSessionDate && limits.cooldownHours > 0) {
      const cooldownMs = limits.cooldownHours * 60 * 60 * 1000;
      const nextAvailable = new Date(userData.lastSessionDate.getTime() + cooldownMs);
      if (nextAvailable > now) {
        return nextAvailable;
      }
    }
    
    return null;
  }

  static isSubscriptionActive(subscription?: UserSubscription): boolean {
    if (!subscription) return false;
    
    const now = new Date();
    return subscription.status === 'active' && subscription.endDate > now;
  }

  static formatSubscriptionPrice(plan: SubscriptionPlan): string {
    if (plan.price === 0) return 'Free';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: plan.currency,
      minimumFractionDigits: 2
    });
    
    return `${formatter.format(plan.price)}/${plan.period}`;
  }

  static getRecommendedPlan(): SubscriptionPlan {
    return SUBSCRIPTION_PLANS.find(plan => plan.isPopular) || SUBSCRIPTION_PLANS[1];
  }
}
