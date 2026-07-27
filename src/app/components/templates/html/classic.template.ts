import { ResumeData, skillName, formatDuration, formatYear, formatDescription } from './resume-data.model';

export function classicTemplate(d: ResumeData): string {
	const name = (d.personalInfo?.full_name || 'Your Name')
		.split(' ')
		.map((w: string) => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '')
		.join(' ');
	const email = d.personalInfo?.email || '';
	const phone = d.personalInfo?.phone || '';
	const location = d.personalInfo?.location || '';
	const linkedin = d.personalInfo?.linkedin || '';
	const github = d.personalInfo?.github || '';
	const portfolio = d.personalInfo?.portfolio || '';
	const title = d.experience?.[0]?.position || '';

	const totalExp = d.experience.length > 0
		? (() => {
			let months = 0;
			d.experience.forEach(e => {
				const dur = formatDuration(e);
				const parts = dur.split('-').map((s: string) => s.trim());
				if (parts.length === 2) {
					const parseDate = (s: string) => {
						const [m, y] = s.split(' ');
						const monthMap: Record<string, number> = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
						return new Date(parseInt(y), monthMap[m] || 0);
					};
					try {
						const start = parseDate(parts[0]);
						const end = parts[1].toLowerCase() === 'present' ? new Date() : parseDate(parts[1]);
						months += Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth());
					} catch {}
				}
			});
			const y = Math.floor(months / 12);
			const m = months % 12;
			return `${y} Year${y !== 1 ? 's' : ''} ${m} Month${m !== 1 ? 's' : ''}`;
		})()
		: '';

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
	@page { size: A4; margin: 0; }
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; font-size: 12px; line-height: 1.6; background: #fff; }

	.layout { display: table; width: 100%; min-height: 297mm; table-layout: fixed; }
	.sidebar { display: table-cell; width: 32%; vertical-align: top; background: #f5e6a3; word-wrap: break-word; overflow-wrap: break-word; }
	.main { display: table-cell; width: 68%; vertical-align: top; padding: 28px 28px 28px 24px; }

	.photo-area { width: 100%; height: 160px; background: #e0d08a; display: flex; align-items: center; justify-content: center; }
	.photo-placeholder { width: 100px; height: 100px; border-radius: 50%; background: #ccc; border: 4px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #999; }
	.sidebar-content { padding: 20px 16px; }
	.s-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #444; margin-bottom: 4px; margin-top: 18px; }
	.s-title:first-child { margin-top: 0; }
	.s-line { width: 36px; height: 3px; background: #2a5298; margin-bottom: 12px; }
	.contact-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
	.contact-icon { font-size: 12px; min-width: 16px; padding-top: 1px; }
	.contact-label { font-size: 10px; font-weight: 600; color: #555; }
	.contact-value { font-size: 11px; color: #333; word-wrap: break-word; overflow-wrap: break-word; }
	.skill-item { font-size: 11px; color: #333; padding: 3px 0; border-bottom: 1px solid rgba(0,0,0,0.08); word-wrap: break-word; }
	.skill-item:last-child { border-bottom: none; }
	.detail-row { display: flex; gap: 8px; margin-bottom: 6px; }
	.detail-label { font-size: 10px; font-weight: 600; color: #555; min-width: 56px; }
	.detail-value { font-size: 11px; color: #333; word-wrap: break-word; overflow-wrap: break-word; flex: 1; }

	.main-name { font-size: 26px; font-weight: 700; color: #1a1a2e; letter-spacing: 0.5px; margin-bottom: 2px; }
	.main-title { font-size: 12px; color: #555; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid #ddd; }
	.m-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a2e; margin-bottom: 4px; margin-top: 20px; page-break-after: avoid; }
	.m-title:first-of-type { margin-top: 0; }
	.m-line { width: 36px; height: 3px; background: #2a5298; margin-bottom: 12px; }
	.summary-text { font-size: 11.5px; line-height: 1.7; color: #444; text-align: justify; }

	.timeline-item { display: flex; gap: 12px; margin-bottom: 16px; page-break-inside: avoid; }
	.timeline-date { min-width: 68px; max-width: 68px; font-size: 10.5px; color: #666; padding-top: 2px; text-align: right; word-wrap: break-word; line-height: 1.4; }
	.timeline-dot { display: flex; flex-direction: column; align-items: center; padding-top: 4px; }
	.dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #2a5298; background: #fff; flex-shrink: 0; }
	.dot-line { width: 1px; flex: 1; background: #ccc; margin-top: 2px; }
	.timeline-content { flex: 1; min-width: 0; word-wrap: break-word; overflow-wrap: break-word; }
	.timeline-role { font-size: 12px; font-weight: 600; color: #1a1a2e; }
	.timeline-company { font-size: 11.5px; font-weight: 500; color: #555; margin-bottom: 4px; }
	.timeline-desc { font-size: 11px; line-height: 1.6; color: #555; text-align: justify; }
	.timeline-desc ul { margin: 4px 0 0; padding-left: 18px; list-style: disc; }
	.timeline-desc li { font-size: 11px; line-height: 1.6; color: #555; margin-bottom: 2px; }

	.proj-item { margin-bottom: 12px; page-break-inside: avoid; }
	.proj-name { font-size: 12px; font-weight: 600; color: #1a1a2e; }
	.proj-desc { font-size: 11px; color: #555; margin-top: 2px; text-align: justify; }
	.proj-tech { font-size: 10px; color: #777; margin-top: 3px; font-style: italic; }
	.cert-item { margin-bottom: 8px; page-break-inside: avoid; }
	.cert-name { font-size: 11.5px; font-weight: 600; color: #1a1a2e; }
	.cert-issuer { font-size: 10.5px; color: #666; }
</style>
</head>
<body>
<div class="layout">

	<div class="sidebar">
		<div class="photo-area">
			<div class="photo-placeholder">&#128100;</div>
		</div>
		<div class="sidebar-content">

			<div class="s-title">Personal Information</div>
			<div class="s-line"></div>
			${email ? `<div class="contact-item"><span class="contact-icon">&#9993;</span><div><div class="contact-label">Email</div><div class="contact-value">${email}</div></div></div>` : ''}
			${phone ? `<div class="contact-item"><span class="contact-icon">&#9742;</span><div><div class="contact-label">Mobile</div><div class="contact-value">${phone}</div></div></div>` : ''}
			${totalExp ? `<div class="contact-item"><span class="contact-icon">&#128188;</span><div><div class="contact-label">Experience</div><div class="contact-value">${totalExp}</div></div></div>` : ''}

			${d.skills.technical.length ? `
			<div class="s-title" style="margin-top:18px">Key Skills</div>
			<div class="s-line"></div>
			${d.skills.technical.map(s => `<div class="skill-item">${skillName(s)}</div>`).join('')}` : ''}

			<div class="s-title" style="margin-top:18px">Other Details</div>
			<div class="s-line"></div>
			${location ? `<div class="detail-row"><span class="detail-label">City</span><span class="detail-value">${location}</span></div>` : ''}
			${linkedin ? `<div class="detail-row"><span class="detail-label">LinkedIn</span><span class="detail-value">${linkedin}</span></div>` : ''}
			${github ? `<div class="detail-row"><span class="detail-label">GitHub</span><span class="detail-value">${github}</span></div>` : ''}
			${portfolio ? `<div class="detail-row"><span class="detail-label">Portfolio</span><span class="detail-value">${portfolio}</span></div>` : ''}
		</div>
	</div>

	<div class="main">
		<div class="main-name">${name}</div>
		${title ? `<div class="main-title">${title}</div>` : '<div style="margin-bottom:16px"></div>'}

		${d.summary ? `
		<div class="m-title">Profile Summary</div>
		<div class="m-line"></div>
		<div class="summary-text">${d.summary}</div>` : ''}

		${d.education.length ? `
		<div class="m-title">Education</div>
		<div class="m-line"></div>
		${d.education.map((e, i) => `
		<div class="timeline-item">
			<div class="timeline-date">${formatYear(e)}</div>
			<div class="timeline-dot"><div class="dot"></div>${i < d.education.length - 1 ? '<div class="dot-line"></div>' : ''}</div>
			<div class="timeline-content">
				<div class="timeline-role">${e.degree || e.education_type || ''}</div>
				<div class="timeline-company">${e.institution}</div>
			</div>
		</div>`).join('')}` : ''}

		${d.experience.length ? `
		<div class="m-title">Work Experience</div>
		<div class="m-line"></div>
		${d.experience.map((e, i) => `
		<div class="timeline-item">
			<div class="timeline-date">${formatDuration(e)}</div>
			<div class="timeline-dot"><div class="dot"></div>${i < d.experience.length - 1 ? '<div class="dot-line"></div>' : ''}</div>
			<div class="timeline-content">
				<div class="timeline-role">${e.position}</div>
				<div class="timeline-company">${e.company}</div>
				${e.description ? `<div class="timeline-desc">${formatDescription(e.description)}</div>` : ''}
			</div>
		</div>`).join('')}` : ''}

		${d.projects.length ? `
		<div class="m-title">Projects</div>
		<div class="m-line"></div>
		${d.projects.map(p => `
		<div class="proj-item">
			<div class="proj-name">${p.name}</div>
			${p.description ? `<div class="proj-desc">${p.description}</div>` : ''}
			${p.technologies ? `<div class="proj-tech">Tech: ${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}</div>` : ''}
		</div>`).join('')}` : ''}

		${d.certifications.length ? `
		<div class="m-title">Certifications</div>
		<div class="m-line"></div>
		${d.certifications.map(c => `
		<div class="cert-item">
			<div class="cert-name">${c.name}</div>
			${c.issuer ? `<div class="cert-issuer">${c.issuer}${c.date ? ' • ' + c.date : ''}</div>` : ''}
		</div>`).join('')}` : ''}
	</div>

</div>
</body>
</html>`;
}
