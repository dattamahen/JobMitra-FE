import { ResumeData, skillName, formatDuration, formatYear } from './resume-data.model';

export function creativeTemplate(d: ResumeData): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
	body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #fdfdfd; color: #333; }
	table { width: 100%; border-collapse: collapse; table-layout: fixed; }
	.header { background: #3498db; color: #fff; padding: 30px; text-align: center; }
	.header h1 { margin: 0; font-size: 32px; }
	.header p { margin: 5px 0; font-size: 13px; }
	.left { width: 35%; vertical-align: top; padding: 20px; background: #ecf0f1; }
	.left h2 { color: #3498db; font-size: 16px; }
	.left ul { padding-left: 18px; }
	.right { width: 65%; vertical-align: top; padding: 20px; }
	.right h2 { color: #3498db; font-size: 18px; margin-top: 20px; }
</style>
</head>
<body>
<table>
	<tr>
		<td colspan="2" class="header">
			<h1>${d.personalInfo?.full_name || 'Your Name'}</h1>
			${d.summary ? `<p style="font-size:15px">${d.summary}</p>` : ''}
			<p>${d.personalInfo?.email || ''} | ${d.personalInfo?.phone || ''} | ${d.personalInfo?.location || ''}</p>
		</td>
	</tr>
	<tr>
		<td class="left">
			<h2>Skills</h2>
			<ul>${d.skills.technical.map(s => `<li>${skillName(s)}</li>`).join('')}</ul>
			${d.skills.soft.length ? `<ul>${d.skills.soft.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}

			${d.projects.length ? `
			<h2 style="margin-top:20px">Projects</h2>
			${d.projects.map(p => `<p><b>${p.name}</b><br>${p.description || ''}</p>`).join('')}` : ''}

			${d.certifications.length ? `
			<h2 style="margin-top:20px">Certifications</h2>
			${d.certifications.map(c => `<p>${c.name}${c.issuer ? ` — ${c.issuer}` : ''}</p>`).join('')}` : ''}
		</td>

		<td class="right">
			${d.experience.length ? `
			<h2>Experience</h2>
			${d.experience.map(e => `
			<p>
				<b>${e.company}</b> — ${e.position}<br>
				<i>${formatDuration(e)}</i><br>
				${e.description || ''}
			</p>`).join('')}` : ''}

			${d.education.length ? `
			<h2>Education</h2>
			${d.education.map(e => `
			<p><b>${e.institution}</b> — ${e.degree || e.education_type || ''} (${formatYear(e)})</p>`).join('')}` : ''}
		</td>
	</tr>
</table>
</body>
</html>`;
}
