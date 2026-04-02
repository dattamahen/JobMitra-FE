import { ResumeData, skillName, formatDuration, formatYear } from './resume-data.model';

export function modernTemplate(d: ResumeData): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
	body { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #333; }
	table { width: 100%; border-collapse: collapse; table-layout: fixed; }
	.sidebar { width: 30%; vertical-align: top; background: #2c3e50; color: #fff; padding: 20px; }
	.sidebar h2 { font-size: 18px; border-bottom: 1px solid #fff; padding-bottom: 6px; margin-top: 20px; }
	.sidebar ul { margin: 0; padding-left: 18px; }
	.main { width: 70%; vertical-align: top; padding: 30px; }
	.main h1 { margin: 0; font-size: 28px; color: #2c3e50; }
	.main h2 { margin-top: 20px; color: #2c3e50; }
	.main p { font-size: 13px; line-height: 1.5; }
	.summary { font-size: 14px; color: #7f8c8d; }
</style>
</head>
<body>
<table>
	<tr>
		<td class="sidebar">
			<h2 style="margin-top:0">Contact</h2>
			<p style="margin:0">
				${d.personalInfo?.email || ''}<br>
				${d.personalInfo?.phone || ''}<br>
				${d.personalInfo?.location || ''}
			</p>
			${d.personalInfo?.linkedin ? `<p style="margin:5px 0"><a style="color:#ecf0f1" href="${d.personalInfo.linkedin}">LinkedIn</a></p>` : ''}
			${d.personalInfo?.github ? `<p style="margin:5px 0"><a style="color:#ecf0f1" href="${d.personalInfo.github}">GitHub</a></p>` : ''}

			<h2>Skills</h2>
			<ul>${d.skills.technical.map(s => `<li>${skillName(s)}</li>`).join('')}</ul>
			${d.skills.soft.length ? `
			<h2>Soft Skills</h2>
			<ul>${d.skills.soft.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}

			${d.certifications.length ? `
			<h2>Certifications</h2>
			${d.certifications.map(c => `<p style="margin:5px 0">${c.name}<br><span style="font-size:12px">${c.issuer || ''}</span></p>`).join('')}` : ''}
		</td>

		<td class="main">
			<h1>${d.personalInfo?.full_name || 'Your Name'}</h1>
			${d.summary ? `<p class="summary">${d.summary}</p>` : ''}

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

			${d.projects.length ? `
			<h2>Projects</h2>
			${d.projects.map(p => `
			<p><b>${p.name}</b><br>${p.description || ''}</p>`).join('')}` : ''}
		</td>
	</tr>
</table>
</body>
</html>`;
}
