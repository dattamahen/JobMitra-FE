import { ResumeData, skillName, formatDuration, formatYear, formatDescription } from './resume-data.model';

export function modernTemplate(d: ResumeData): string {
	const name = (d.personalInfo?.full_name || 'Your Name')
		.split(' ')
		.map((w: string) => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '')
		.join(' ');

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
	@page { size: A4; margin: 0; }
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; font-size: 12px; line-height: 1.6; background: #fff; }

	.layout { display: table; width: 100%; min-height: 297mm; table-layout: fixed; }
	.sidebar { display: table-cell; width: 30%; vertical-align: top; background: #2c3e50; color: #ecf0f1; padding: 24px 16px 24px 16px; word-wrap: break-word; overflow-wrap: break-word; }
	.main { display: table-cell; width: 70%; vertical-align: top; padding: 24px 20px 24px 24px; }

	/* Sidebar */
	.sidebar-name { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 4px; word-wrap: break-word; line-height: 1.3; }
	.sidebar-role { font-size: 11px; color: #bdc3c7; margin-bottom: 20px; }
	.s-section { margin-bottom: 18px; }
	.s-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #95a5a6; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #3d5166; }
	.s-text { font-size: 11px; color: #ecf0f1; line-height: 1.7; word-wrap: break-word; overflow-wrap: break-word; }
	.s-link { font-size: 11px; color: #5dade2; text-decoration: none; word-wrap: break-word; overflow-wrap: break-word; display: block; margin-bottom: 3px; }
	.s-skill { font-size: 11px; color: #ecf0f1; padding: 2px 0; border-bottom: 1px solid #3d5166; margin-bottom: 4px; word-wrap: break-word; }
	.cert-name { font-size: 11px; font-weight: 600; color: #ecf0f1; word-wrap: break-word; }
	.cert-issuer { font-size: 10px; color: #95a5a6; }

	/* Main */
	.main-name { font-size: 26px; font-weight: 700; color: #2c3e50; letter-spacing: 0.5px; margin-bottom: 2px; }
	.m-section { margin-bottom: 20px; }
	.m-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #2c3e50; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #2c3e50; page-break-after: avoid; }
	.summary { font-size: 11.5px; line-height: 1.7; color: #555; text-align: justify; margin-bottom: 20px; }
	.entry { margin-bottom: 14px; page-break-inside: avoid; }
	.entry-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
	.entry-title { font-size: 12px; font-weight: 600; color: #1a1a2e; }
	.entry-date { font-size: 10.5px; color: #777; white-space: nowrap; }
	.entry-subtitle { font-size: 11.5px; color: #2c3e50; font-weight: 500; margin-bottom: 3px; }
	.entry-desc { font-size: 11px; color: #555; line-height: 1.6; text-align: justify; }
	.entry-desc ul { margin: 4px 0 0; padding-left: 18px; list-style: disc; }
	.entry-desc li { font-size: 11px; color: #555; line-height: 1.6; margin-bottom: 2px; }
	.project-tech { font-size: 10px; color: #777; margin-top: 3px; font-style: italic; }
</style>
</head>
<body>
<div class="layout">

	<!-- Sidebar -->
	<div class="sidebar">
		<div class="sidebar-name">${name}</div>

		<div class="s-section">
			<div class="s-title">Contact</div>
			${d.personalInfo?.email ? `<div class="s-text">${d.personalInfo.email}</div>` : ''}
			${d.personalInfo?.phone ? `<div class="s-text">${d.personalInfo.phone}</div>` : ''}
			${d.personalInfo?.location ? `<div class="s-text">${d.personalInfo.location}</div>` : ''}
			${d.personalInfo?.linkedin ? `<a class="s-link" href="${d.personalInfo.linkedin}">LinkedIn</a>` : ''}
			${d.personalInfo?.github ? `<a class="s-link" href="${d.personalInfo.github}">GitHub</a>` : ''}
			${d.personalInfo?.portfolio ? `<a class="s-link" href="${d.personalInfo.portfolio}">Portfolio</a>` : ''}
		</div>

		${d.skills.technical.length ? `
		<div class="s-section">
			<div class="s-title">Skills</div>
			${d.skills.technical.map(s => `<div class="s-skill">${skillName(s)}</div>`).join('')}
		</div>` : ''}

		${d.skills.soft.length ? `
		<div class="s-section">
			<div class="s-title">Soft Skills</div>
			${d.skills.soft.map(s => `<div class="s-skill">${s}</div>`).join('')}
		</div>` : ''}

		${d.certifications.length ? `
		<div class="s-section">
			<div class="s-title">Certifications</div>
			${d.certifications.map(c => `
			<div style="margin-bottom:8px;page-break-inside:avoid">
				<div class="cert-name">${c.name}</div>
				${c.issuer ? `<div class="cert-issuer">${c.issuer}${c.date ? ' • ' + c.date : ''}</div>` : ''}
			</div>`).join('')}
		</div>` : ''}
	</div>

	<!-- Main -->
	<div class="main">
		${d.summary ? `<div class="summary">${d.summary}</div>` : ''}

		${d.education.length ? `
		<div class="m-section">
			<div class="m-title">Education</div>
			${d.education.map(e => `
			<div class="entry">
				<div class="entry-header">
					<span class="entry-title">${e.institution || ''}</span>
					<span class="entry-date">${formatYear(e)}</span>
				</div>
				<div class="entry-subtitle">${e.degree || e.education_type || ''}</div>
			</div>`).join('')}
		</div>` : ''}

		${d.experience.length ? `
		<div class="m-section">
			<div class="m-title">Work Experience</div>
			${d.experience.map(e => `
			<div class="entry">
				<div class="entry-header">
					<span class="entry-title">${e.position || ''}</span>
					<span class="entry-date">${formatDuration(e)}</span>
				</div>
				<div class="entry-subtitle">${e.company || ''}</div>
				${e.description ? `<div class="entry-desc">${formatDescription(e.description)}</div>` : ''}
			</div>`).join('')}
		</div>` : ''}

		${d.projects.length ? `
		<div class="m-section">
			<div class="m-title">Projects</div>
			${d.projects.map(p => `
			<div class="entry">
				<div class="entry-title">${p.name || ''}</div>
				${p.description ? `<div class="entry-desc">${p.description}</div>` : ''}
				${p.technologies ? `<div class="project-tech">Tech: ${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}</div>` : ''}
			</div>`).join('')}
		</div>` : ''}
	</div>

</div>
</body>
</html>`;
}
