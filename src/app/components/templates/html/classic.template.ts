import { ResumeData, skillName, formatDuration, formatYear } from './resume-data.model';

export function classicTemplate(d: ResumeData): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
	body { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #333; font-size: 13px; line-height: 1.5; }
	table { width: 100%; border-collapse: collapse; table-layout: fixed; }
	.sidebar { width: 30%; vertical-align: top; background: #f4f4f4; padding: 20px; font-size: 12px; line-height: 1.4; }
	.sidebar h2 { font-size: 14px; font-weight: bold; margin: 20px 0 10px; text-transform: uppercase; }
	.sidebar ul { margin: 0 0 20px 18px; padding: 0; }
	.main { width: 70%; vertical-align: top; padding: 30px; }
	.main h1 { margin: 0; font-size: 22px; font-weight: bold; }
	.main h2 { font-size: 14px; font-weight: bold; margin: 20px 0 10px; text-transform: uppercase; }
	.contact { margin: 0 0 20px; font-size: 12px; color: #555; }
</style>
</head>
<body>
<table>
	<tr>
		<td class="sidebar">
			<h2>Experience</h2>
			${d.experience.map(e => `
			<p style="margin:0 0 10px">
				<b>${e.company}</b><br>${e.position}<br>
				<i>${formatDuration(e)}</i>
			</p>`).join('')}

			<h2>Education</h2>
			${d.education.map(e => `
			<p style="margin:0 0 10px">
				<b>${e.institution}</b><br>${e.degree || e.education_type || ''}<br>
				<i>${formatYear(e)}</i>
			</p>`).join('')}

			${d.projects.length ? `
			<h2>Projects</h2>
			${d.projects.map(p => `<p style="margin:0 0 20px"><b>${p.name}</b> — ${p.description || ''}</p>`).join('')}` : ''}

			<h2>Skills</h2>
			<ul>${d.skills.technical.map(s => `<li>${skillName(s)}</li>`).join('')}</ul>

			${d.certifications.length ? `
			<h2>Certifications</h2>
			${d.certifications.map(c => `<p style="margin:0 0 10px">${c.name}<br>${c.issuer || ''}</p>`).join('')}` : ''}
		</td>

		<td class="main">
			<h1>${d.personalInfo?.full_name || 'Your Name'}</h1>
			${d.summary ? `<p style="margin:6px 0 12px;font-size:13px">${d.summary}</p>` : ''}
			<p class="contact">${d.personalInfo?.location || ''} | ${d.personalInfo?.phone || ''} | ${d.personalInfo?.email || ''}</p>

			${d.experience.length ? `
			<h2>Experience</h2>
			${d.experience.map(e => `
			<p style="margin:0 0 15px">
				<b>${e.company} — ${e.position}</b><br>
				<i>${formatDuration(e)}</i><br>
				${e.description || ''}
			</p>`).join('')}` : ''}

			${d.education.length ? `
			<h2>Education</h2>
			${d.education.map(e => `
			<p style="margin:0 0 15px">
				<b>${e.institution} — ${e.degree || e.education_type || ''}</b><br>
				<i>${formatYear(e)}</i>
			</p>`).join('')}` : ''}

			${d.projects.length ? `
			<h2>Projects</h2>
			${d.projects.map(p => `<p style="margin:0 0 20px"><b>${p.name}</b><br>${p.description || ''}</p>`).join('')}` : ''}
		</td>
	</tr>
</table>
</body>
</html>`;
}
