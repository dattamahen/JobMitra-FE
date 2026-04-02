import { ResumeData, skillName, formatDuration, formatYear } from './resume-data.model';

export function executiveTemplate(d: ResumeData): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
	body { margin: 0; padding: 0; font-family: Georgia, serif; color: #333; }
	table { width: 100%; border-collapse: collapse; }
	.header { text-align: center; padding: 30px; }
	.header h1 { margin: 0; font-size: 30px; font-weight: bold; }
	.header p { margin: 5px 0; font-size: 14px; }
	.content { padding: 20px; }
	.content h2 { font-size: 16px; border-bottom: 1px solid #000; margin: 30px 0 10px; padding-bottom: 5px; }
	.content p { font-size: 13px; line-height: 1.6; }
</style>
</head>
<body>
<table>
	<tr>
		<td class="header">
			<h1>${d.personalInfo?.full_name || 'Your Name'}</h1>
			<p>${d.personalInfo?.email || ''} | ${d.personalInfo?.phone || ''} | ${d.personalInfo?.location || ''}</p>
		</td>
	</tr>
	<tr>
		<td class="content">
			${d.summary ? `
			<h2>Professional Summary</h2>
			<p>${d.summary}</p>` : ''}

			${d.experience.length ? `
			<h2>Experience</h2>
			${d.experience.map(e => `
			<p>
				<b>${e.position} – ${e.company}</b> (${formatDuration(e)})<br>
				${e.description || ''}
			</p>`).join('')}` : ''}

			${d.education.length ? `
			<h2>Education</h2>
			${d.education.map(e => `
			<p><b>${e.institution}</b> — ${e.degree || e.education_type || ''} (${formatYear(e)})</p>`).join('')}` : ''}

			${d.projects.length ? `
			<h2>Key Projects</h2>
			${d.projects.map(p => `<p><b>${p.name}</b><br>${p.description || ''}</p>`).join('')}` : ''}

			${d.skills.technical.length ? `
			<h2>Core Competencies</h2>
			<p>${d.skills.technical.map(s => skillName(s)).join(', ')}</p>` : ''}

			${d.certifications.length ? `
			<h2>Certifications</h2>
			${d.certifications.map(c => `<p><b>${c.name}</b>${c.issuer ? ` — ${c.issuer}` : ''}${c.date ? ` (${c.date})` : ''}</p>`).join('')}` : ''}
		</td>
	</tr>
</table>
</body>
</html>`;
}
