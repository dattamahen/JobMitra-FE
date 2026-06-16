import { ResumeData, skillName, formatDuration, formatYear, formatDescription } from './resume-data.model';

export function standardTemplate(d: ResumeData): string {
	const name = d.personalInfo?.full_name || 'Your Name';
	const email = d.personalInfo?.email || '';
	const phone = d.personalInfo?.phone || '';
	const location = d.personalInfo?.location || '';
	const linkedin = d.personalInfo?.linkedin || '';
	const github = d.personalInfo?.github || '';
	const portfolio = d.personalInfo?.portfolio || '';

	const contactParts = [email, phone, location].filter(Boolean);
	const linkParts = [
		linkedin ? `<a href="${linkedin}" style="color:#4831af;text-decoration:none">LinkedIn</a>` : '',
		github ? `<a href="${github}" style="color:#4831af;text-decoration:none">GitHub</a>` : '',
		portfolio ? `<a href="${portfolio}" style="color:#4831af;text-decoration:none">Portfolio</a>` : ''
	].filter(Boolean);

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; font-size: 12px; line-height: 1.6; background: #fff; }
	.page-wrapper { padding: 50px 60px; }

	.header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #4831af; }
	.header h1 { font-size: 26px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; letter-spacing: 0.5px; }
	.header .contact-line { font-size: 11px; color: #555; margin-bottom: 4px; }
	.header .contact-line a { color: #4831af; text-decoration: none; }
	.header .links-line { font-size: 11px; }

	.section { margin-bottom: 20px; }
	.section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #4831af; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e0e0e0; }

	.summary { font-size: 11.5px; line-height: 1.7; color: #444; text-align: justify; }

	.entry { margin-bottom: 14px; }
	.entry-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; }
	.entry-title { font-size: 12px; font-weight: 600; color: #1a1a2e; }
	.entry-date { font-size: 10.5px; color: #777; white-space: nowrap; }
	.entry-subtitle { font-size: 11.5px; color: #555; font-weight: 500; margin-bottom: 3px; }
	.entry-desc { font-size: 11px; color: #555; line-height: 1.6; text-align: justify; white-space: pre-line; }
	.entry-desc ul, .desc-list { margin: 4px 0 0 0; padding-left: 18px; list-style: disc; }
	.entry-desc li, .desc-list li { font-size: 11px; color: #555; line-height: 1.6; margin-bottom: 2px; }

	.skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
	.skill-tag { font-size: 10.5px; background: #f3f0ff; color: #4831af; padding: 3px 10px; border-radius: 12px; border: 1px solid #e8e0ff; }

	.project-tech { font-size: 10px; color: #777; margin-top: 3px; font-style: italic; }

	.cert-item { margin-bottom: 8px; }
	.cert-name { font-size: 11.5px; font-weight: 600; color: #333; }
	.cert-issuer { font-size: 10.5px; color: #666; }
</style>
</head>
<body>
<div class="page-wrapper">

<!-- Header -->
<div class="header">
	<h1>${name}</h1>
	${contactParts.length ? `<div class="contact-line">${contactParts.join('  •  ')}</div>` : ''}
	${linkParts.length ? `<div class="links-line">${linkParts.join('  |  ')}</div>` : ''}
</div>

<!-- Summary -->
${d.summary ? `
<div class="section">
	<div class="section-title">Professional Summary</div>
	<div class="summary">${d.summary}</div>
</div>
` : ''}

<!-- Experience -->
${d.experience.length ? `
<div class="section">
	<div class="section-title">Work Experience</div>
	${d.experience.map(e => `
	<div class="entry">
		<div class="entry-header">
			<span class="entry-title">${e.position || ''}</span>
			<span class="entry-date">${formatDuration(e)}</span>
		</div>
		<div class="entry-subtitle">${e.company || ''}</div>
		${e.description ? `<div class="entry-desc">${formatDescription(e.description)}</div>` : ''}
	</div>`).join('')}
</div>
` : ''}

<!-- Education -->
${d.education.length ? `
<div class="section">
	<div class="section-title">Education</div>
	${d.education.map(e => `
	<div class="entry">
		<div class="entry-header">
			<span class="entry-title">${e.institution || ''}</span>
			<span class="entry-date">${formatYear(e)}</span>
		</div>
		<div class="entry-subtitle">${e.degree || e.education_type || ''}</div>
	</div>`).join('')}
</div>
` : ''}

<!-- Skills -->
${d.skills.technical.length ? `
<div class="section">
	<div class="section-title">Skills</div>
	<div class="skills-grid">
		${d.skills.technical.map(s => `<span class="skill-tag">${skillName(s)}</span>`).join('')}
	</div>
</div>
` : ''}

<!-- Projects -->
${d.projects.length ? `
<div class="section">
	<div class="section-title">Projects</div>
	${d.projects.map(p => `
	<div class="entry">
		<div class="entry-title">${p.name || ''}</div>
		${p.description ? `<div class="entry-desc">${p.description}</div>` : ''}
		${p.technologies ? `<div class="project-tech">Tech: ${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}</div>` : ''}
	</div>`).join('')}
</div>
` : ''}

<!-- Certifications -->
${d.certifications.length ? `
<div class="section">
	<div class="section-title">Certifications</div>
	${d.certifications.map(c => `
	<div class="cert-item">
		<div class="cert-name">${c.name || ''}</div>
		${c.issuer ? `<div class="cert-issuer">${c.issuer}${c.date ? ` • ${c.date}` : ''}</div>` : ''}
	</div>`).join('')}
</div>
` : ''}

</div>
</body>
</html>`;
}
