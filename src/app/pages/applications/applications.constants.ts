export const APPLICATION_STATUS_CLASSES: Record<string, string> = {
	applied: 'status-applied',
	under_review: 'status-pending',
	interview_scheduled: 'status-interview',
	interviewed: 'status-interview',
	offer_received: 'status-offer',
	rejected: 'status-rejected',
	withdrawn: 'status-withdrawn'
} as const;

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
	applied: 'Applied',
	under_review: 'Under Review',
	interview_scheduled: 'Interview Scheduled',
	interviewed: 'Interviewed',
	offer_received: 'Offer Received',
	rejected: 'Not Selected',
	withdrawn: 'Withdrawn'
} as const;

export const APPLICATION_PROGRESS_MAP: Record<string, number> = {
	applied: 25,
	under_review: 50,
	interview_scheduled: 75,
	interviewed: 85,
	offer_received: 100,
	rejected: 100,
	withdrawn: 100
} as const;
