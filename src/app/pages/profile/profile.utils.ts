import { UserService } from '../../services';

export function processDynamicArrayData(formData: Record<string, unknown>, arrayName: string): Record<string, unknown>[] {
	const itemGroups: Record<string, Record<string, unknown>> = {};
	Object.keys(formData)
		.filter(key => key.startsWith(arrayName + '_item_'))
		.forEach(key => {
			const match = key.match(new RegExp(`^${arrayName}_(item_\\d+)_(.+)$`));
			if (match) {
				const [, itemId, fieldName] = match;
				if (!itemGroups[itemId]) itemGroups[itemId] = {};
				itemGroups[itemId][fieldName] = formData[key];
			}
		});
	return Object.values(itemGroups).filter(item =>
		Object.values(item).some(v => v && String(v).trim() !== '')
	);
}

export function populateSkillsValues(user: Record<string, unknown>): Record<string, unknown> {
	const values: Record<string, unknown> = {};
	UserService.resolveSkills(user).forEach((skill, index) => {
		const id = `item_${index}`;
		values[`technical_skills_${id}_name`] = skill.name;
		values[`technical_skills_${id}_version`] = skill.version;
		values[`technical_skills_${id}_experience`] = skill.experience;
	});
	return values;
}

export function populateExperienceValues(user: Record<string, unknown>): Record<string, unknown> {
	const values: Record<string, unknown> = {};
	const exp = user['work_experience'];
	if (!Array.isArray(exp) || exp.length === 0) return values;
	if (exp.some((item: unknown) => typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, ''))) return values;
	exp.filter((e: unknown) => e && typeof e === 'object' && ((e as Record<string, unknown>)['company'] || (e as Record<string, unknown>)['position'] || (e as Record<string, unknown>)['description']))
		.forEach((e: unknown, i: number) => {
			const item = e as Record<string, unknown>;
			const id = `item_${i}`;
			values[`experiences_${id}_company`] = item['company'] || '';
			values[`experiences_${id}_position`] = item['position'] || '';
			values[`experiences_${id}_start_date`] = item['start_date'] || '';
			values[`experiences_${id}_end_date`] = item['end_date'] || '';
			values[`experiences_${id}_description`] = item['description'] || '';
		});
	return values;
}

export function populateEducationValues(user: Record<string, unknown>): Record<string, unknown> {
	const values: Record<string, unknown> = {};
	const edu = user['education'];
	if (!Array.isArray(edu) || edu.length === 0) return values;
	if (edu.some((item: unknown) => typeof item === 'object' && item !== null && Object.prototype.hasOwnProperty.call(item, ''))) return values;
	edu.filter((e: unknown) => e && typeof e === 'object' && ((e as Record<string, unknown>)['institution'] || (e as Record<string, unknown>)['education_type']))
		.forEach((e: unknown, i: number) => {
			const item = e as Record<string, unknown>;
			const id = `item_${i}`;
			values[`education_${id}_institution`] = item['institution'] || '';
			values[`education_${id}_education_type`] = item['education_type'] || '';
			values[`education_${id}_start_date`] = item['start_date'] || '';
			values[`education_${id}_end_date`] = item['end_date'] || '';
		});
	return values;
}

export function populateProjectsValues(user: Record<string, unknown>): Record<string, unknown> {
	const values: Record<string, unknown> = {};
	const projects = user['projects'];
	if (!Array.isArray(projects)) return values;
	projects.forEach((p: unknown, i: number) => {
		const item = p as Record<string, unknown>;
		const id = `item_${i}`;
		values[`projects_${id}_name`] = item['name'] || '';
		values[`projects_${id}_url`] = item['url'] || '';
		values[`projects_${id}_description`] = item['description'] || '';
		values[`projects_${id}_technologies`] = item['technologies'] || '';
	});
	return values;
}

export function populateCertificationsValues(user: Record<string, unknown>): Record<string, unknown> {
	const values: Record<string, unknown> = {};
	const certs = user['certifications'];
	if (!Array.isArray(certs) || certs.length === 0) return values;
	certs.filter((c: unknown) => (typeof c === 'object' && c !== null && (c as Record<string, unknown>)['name']) || (typeof c === 'string' && (c as string).trim()))
		.forEach((c: unknown, i: number) => {
			const id = `item_${i}`;
			if (typeof c === 'string') {
				values[`certifications_${id}_name`] = c;
				values[`certifications_${id}_issuer`] = '';
				values[`certifications_${id}_issue_date`] = '';
				values[`certifications_${id}_credential_id`] = '';
			} else {
				const item = c as Record<string, unknown>;
				values[`certifications_${id}_name`] = item['name'] || '';
				values[`certifications_${id}_issuer`] = item['issuer'] || item['issuing_organization'] || '';
				values[`certifications_${id}_issue_date`] = item['issue_date'] || item['date'] || '';
				values[`certifications_${id}_credential_id`] = item['credential_id'] || '';
			}
		});
	return values;
}
