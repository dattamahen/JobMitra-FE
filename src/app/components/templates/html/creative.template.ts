import { ResumeData, skillName, formatDuration, formatYear, formatDescription } from './resume-data.model';

export function creativeTemplate(d: ResumeData): string {
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

	const totalExp = (() => {
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
		return months > 0 ? `${y} Year${y !== 1 ? 's' : ''} ${m} Month${m !== 1 ? 's' : ''}` : '';
	})();

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
	@page { size: A4; margin: 0; }
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body { font-family: 'Segoe UI', Arial, sans-serif; color: #444; font-size: 12px; line-height: 1.6; background: #fff; }

	.layout { display: table; width: 100%; min-height: 297mm; table-layout: fixed; }
	.sidebar { display: table-cell; width: 33%; vertical-align: top; background: #e8ecf1; word-wrap: break-word; overflow-wrap: break-word; }
	.main { display: table-cell; width: 67%; vertical-align: top; padding: 28px 28px 28px 24px; }

	/* Sidebar */
	.photo-area { width: 100%; height: 170px; background: #d5dce6; display: flex; align-items: center; justify-content: center; }
	.photo-placeholder { width: 110px; height: 110px; border-radius: 50%; background: #bcc5d0; border: 4px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 38px; color: #8899aa; }
	.sidebar-content { padding: 22px 18px; }
	.sb-heading { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #222; margin-bottom: 4px; margin-top: 20px; }
	.sb-heading:first-child { margin-top: 0; }
	.sb-line { width: 40px; height: 3px; background: #4a6fa5; margin-bottom: 12px; }
	.sb-list { list-style: none; padding: 0; margin: 0; }
	.sb-list li { font-size: 11px; color: #444; padding: 3px 0; border-bottom: 1px solid rgba(0,0,0,0.08); word-wrap: break-word; }
	.sb-list li:last-child { border-bottom: none; }
	.contact-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
	.contact-icon { font-size: 12px; min-width: 16px; padding-top: 1px; flex-shrink: 0; }
	.contact-label { font-size: 10px; font-weight: 600; color: #555; }
	.contact-value { font-size: 11px; color: #333; word-wrap: break-word; overflow-wrap: break-word; }
	.detail-row { display: flex; gap: 6px; margin-bottom: 6px; }
	.detail-label { font-size: 10px; font-weight: 600; color: #555; min-width: 52px; flex-shrink: 0; }
	.detail-value { font-size: 11px; color: #333; word-wrap: break-word; overflow-wrap: break-word; flex: 1; }

	/* Main */
	.main-name { font-size: 26px; font-weight: 700; color: #1a1a2e; letter-spacing: 0.5px; margin-bottom: 2px; }
	.main-title { font-size: 12px; color: #555; margin-bottom: 14px; }
	.contact-bar { display: flex; gap: 0; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 8px 0; margin-bottom: 20px; }
	.contact-cell { flex: 1; text-align: center; font-size: 10.5px; color: #444; padding: 0 6px; }
	.contact-cell:not(:last-child) { border-right: 1px solid #ccc; }
	.contact-cell-icon { font-size: 14px; display: block; margin-bottom: 2px; color: #4a6fa5; }

	.sec-heading { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a2e; margin-bottom: 4px; margin-top: 20px; page-break-after: avoid; }
	.sec-heading:first-of-type { margin-top: 0; }
	.sec-line { width: 40px; height: 3px; background: #4a6fa5; margin-bottom: 12px; }

	.summary-text { font-size: 11px; line-height: 1.7; color: #444; text-align: justify; }

	.badge { display: inline-block; background: #e2e8f0; padding: 2px 10px; border-radius: 2px; font-size: 10.5px; font-weight: 500; color: #555; margin-bottom: 5px; }

	.exp-item { margin-bottom: 16px; page-break-inside: avoid; }
	.exp-role { font-size: 12px; font-weight: 600; color: #1a1a2e; }
	.exp-company { font-size: 11.5px; font-weight: 500; color: #555; margin-bottom: 4px; }
	.exp-desc { font-size: 11px; line-height: 1.6; color: #555; text-align: justify; }
	.exp-desc ul { margin: 4px 0 0; padding-left: 18px; list-style: disc; }
	.exp-desc li { font-size: 11px; line-height: 1.6; color: #555; margin-bottom: 2px; }

	.edu-item { margin-bottom: 12px; page-break-inside: avoid; }
	.edu-degree { font-size: 12px; font-weight: 600; color: #1a1a2e; }
	.edu-institution { font-size: 11px; color: #555; }

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

			${d.skills.technical.length ? `
			<div class="sb-heading">Key Skills</div>
			<div class="sb-line"></div>
			<ul class="sb-list">
				${d.skills.technical.map(s => `<li>${skillName(s)}</li>`).join('')}
			</ul>` : ''}

			<div class="sb-heading" style="margin-top:20px">Contact</div>
			<div class="sb-line"></div>
			${email ? `<div class="contact-item"><span class="contact-icon">&#9993;</span><div><div class="contact-label">Email</div><div class="contact-value">${email}</div></div></div>` : ''}
			${phone ? `<div class="contact-item"><span class="contact-icon">&#9742;</span><div><div class="contact-label">Mobile</div><div class="contact-value">${phone}</div></div></div>` : ''}
			${totalExp ? `<div class="contact-item"><span class="contact-icon">&#128188;</span><div><div class="contact-label">Experience</div><div class="contact-value">${totalExp}</div></div></div>` : ''}

			<div class="sb-heading" style="margin-top:20px">Other Details</div>
			<div class="sb-line"></div>
			${location ? `<div class="detail-row"><span class="detail-label">City</span><span class="detail-value">${location}</span></div>` : ''}
			${linkedin ? `<div class="detail-row"><span class="detail-label">LinkedIn</span><span class="detail-value">${linkedin}</span></div>` : ''}
			${github ? `<div class="detail-row"><span class="detail-label">GitHub</span><span class="detail-value">${github}</span></div>` : ''}
			${portfolio ? `<div class="detail-row"><span class="detail-label">Portfolio</span><span class="detail-value">${portfolio}</span></div>` : ''}

		</div>
	</div>

	<div class="main">
		<div class="main-name">${name}</div>
		${title ? `<div class="main-title">${title}</div>` : '<div style="margin-bottom:12px"></div>'}

		<div class="contact-bar">
			${totalExp ? `<div class="contact-cell"><span class="contact-cell-icon">&#128188;</span>${totalExp}</div>` : ''}
			${phone ? `<div class="contact-cell"><span class="contact-cell-icon">&#128241;</span>${phone}</div>` : ''}
			${email ? `<div class="contact-cell"><span class="contact-cell-icon">&#9993;</span>${email}</div>` : ''}
		</div>

		${d.summary ? `
		<div class="sec-heading">Profile Summary</div>
		<div class="sec-line"></div>
		<div class="summary-text">${d.summary}</div>` : ''}

		${d.education.length ? `
		<div class="sec-heading">Education</div>
		<div class="sec-line"></div>
		${d.education.map(e => `
		<div class="edu-item">
			<div class="badge">${formatYear(e)}</div>
			<div class="edu-degree">${e.degree || e.education_type || ''}</div>
			<div class="edu-institution">${e.institution}</div>
		</div>`).join('')}` : ''}

		${d.experience.length ? `
		<div class="sec-heading">Work Experience</div>
		<div class="sec-line"></div>
		${d.experience.map(e => `
		<div class="exp-item">
			<div class="badge">${formatDuration(e)}</div>
			<div class="exp-role">${e.position}</div>
			<div class="exp-company">${e.company}</div>
			${e.description ? `<div class="exp-desc">${formatDescription(e.description)}</div>` : ''}
		</div>`).join('')}` : ''}

		${d.projects.length ? `
		<div class="sec-heading">Projects</div>
		<div class="sec-line"></div>
		${d.projects.map(p => `
		<div class="proj-item">
			<div class="proj-name">${p.name}</div>
			${p.description ? `<div class="proj-desc">${p.description}</div>` : ''}
			${p.technologies ? `<div class="proj-tech">Tech: ${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}</div>` : ''}
		</div>`).join('')}` : ''}

		${d.certifications.length ? `
		<div class="sec-heading">Certifications</div>
		<div class="sec-line"></div>
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
