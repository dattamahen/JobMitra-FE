export interface ProjectItem {
	title: string;
	status: string;
	statusClass: string;
	description: string;
	meta: string[];
}

export const PROJECTS_DATA: ProjectItem[] = [
	{
		title: 'E-commerce Website',
		status: 'Active',
		statusClass: 'active',
		description: 'Building a modern e-commerce platform with Angular and Node.js',
		meta: ['Due: Dec 31, 2025', 'Team: 5 members'],
	},
	{
		title: 'Mobile App',
		status: 'Pending',
		statusClass: 'pending',
		description: 'Cross-platform mobile application using React Native',
		meta: ['Due: Mar 15, 2026', 'Team: 3 members'],
	},
	{
		title: 'Data Analytics Dashboard',
		status: 'Completed',
		statusClass: 'completed',
		description: 'Real-time analytics dashboard for business intelligence',
		meta: ['Completed: Nov 20, 2025', 'Team: 4 members'],
	},
];
