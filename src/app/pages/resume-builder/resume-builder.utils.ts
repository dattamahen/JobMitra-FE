import { processDynamicArrayData } from '../profile/profile.utils';

export function convertExperienceValues(values: Record<string, unknown>): Record<string, unknown>[] {
	return processDynamicArrayData(values, 'experiences');
}

export function convertEducationValues(values: Record<string, unknown>): Record<string, unknown>[] {
	return processDynamicArrayData(values, 'education');
}

export function convertProjectsValues(values: Record<string, unknown>): Record<string, unknown>[] {
	return processDynamicArrayData(values, 'projects');
}

export function convertCertificationsValues(values: Record<string, unknown>): Record<string, unknown>[] {
	return processDynamicArrayData(values, 'certifications');
}

export function convertSkillsValues(values: Record<string, unknown>): { technical: Record<string, unknown>[]; soft: string[] } {
	return { technical: processDynamicArrayData(values, 'technical_skills'), soft: [] };
}
