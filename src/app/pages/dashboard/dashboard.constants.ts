import type { ActivityItem } from '../../types/dashboard.types';

export const ACTIVITY_TYPE_COLOR_MAP: Record<ActivityItem['type'], string> = {
	application: 'primary',
	interview: 'accent',
	assessment: 'warn',
	profile: 'success',
	resume: 'info',
	other: 'primary'
} as const;

export const ACTIVITY_STATUS_ICON_MAP: Record<string, string> = {
	completed: 'check_circle',
	pending: 'schedule',
	'in-progress': 'hourglass_empty',
	cancelled: 'cancel'
} as const;
