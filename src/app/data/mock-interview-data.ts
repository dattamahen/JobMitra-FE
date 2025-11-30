export interface InterviewType {
  id: string;
  title: string;
  icon: string;
  description: string;
  badges?: string[];
  topics?: string[];
  hasCompanySelect?: boolean;
  companies?: string[];
  disabled?: boolean;
  comingSoon?: boolean;
  disabledMessage?: string;
}

export const INTERVIEW_TYPES: InterviewType[] = [
  {
    id: 'technical',
    title: '🎯 Technical Interview',
    icon: 'code',
    description: 'Practice coding problems and system design questions',
    badges: ['Easy', 'Medium']
  },
  {
    id: 'behavioral',
    title: '💼 Behavioral Interview', 
    icon: 'psychology',
    description: 'Practice common behavioral questions and STAR method',
    topics: ['Leadership', 'Teamwork', 'Problem Solving']
  },
  {
    id: 'company',
    title: '🏢 Company-Specific',
    icon: 'business',
    description: 'Tailored questions based on company culture and role',
    hasCompanySelect: true,
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
    disabled: true,
    comingSoon: true,
    disabledMessage: 'Feature to be launched soon'
  }
];