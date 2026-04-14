import { ResumeData, skillName, formatDuration, formatYear } from './resume-data.model';

export function executiveTemplate(d: ResumeData): string {
	const name = d.personalInfo?.full_name || 'Your Name';
	const email = d.personalInfo?.email || '';
	const phone = d.personalInfo?.phone || '';
	const location = d.personalInfo?.location || '';
	const title = d.experience?.[0]?.position || '';

	const totalExp = (() => {
		let months = 0;
		d.experience.forEach(e => {
			const dur = formatDuration(e);
			const parts = dur.split('-').map(s => s.trim());
			if (parts.length === 2) {
				const parseDate = (s: string) => {
					const [m, y] = s.split(' ');
					const mm: Record<string, number> = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
					return new Date(parseInt(y), mm[m] || 0);
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
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body { font-family: 'Segoe UI', Arial, sans-serif; color: #222; font-size: 12px; line-height: 1.5; background: #fff; }
	table { width: 100%; border-collapse: collapse; table-layout: fixed; }
	td { vertical-align: top; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; }

	/* Header */
	.header-table { margin-bottom: 0; }
	.header-left { width: 40%; padding: 36px 24px 24px; }
	.header-right { width: 60%; padding: 20px 24px 24px; }
	.hdr-name {
		font-size: 28px; font-weight: 700; text-transform: uppercase;
		color: #111; line-height: 1.15; letter-spacing: 0.5px;
	}
	.hdr-title { font-size: 13px; font-weight: 600; color: #333; margin-top: 10px; text-transform: uppercase; }

	/* Contact table inside header-right */
	.contact-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
	.contact-table td { padding: 5px 0; font-size: 11.5px; vertical-align: top; }
	.contact-label { font-weight: 700; text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.8px; color: #333; width: 90px; }
	.contact-bar-cell { width: 16px; text-align: center; }
	.contact-bar { display: inline-block; width: 3px; height: 14px; background: #2a5298; border-radius: 1px; }
	.contact-value { color: #444; }

	/* Vertical line above/below contact */
	.vline-cell { text-align: center; }
	.vline { display: inline-block; width: 2px; height: 50px; background: #222; }

	/* Blue divider */
	.blue-divider { height: 6px; background: #2a5298; }

	/* Body */
	.body-left { width: 38%; padding: 22px 20px; }
	.body-right { width: 62%; padding: 22px 24px; }

	/* Sidebar sections */
	.sb-title { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 10px; }
	.sb-list { list-style: disc; padding-left: 20px; margin: 0 0 24px; }
	.sb-list li { font-size: 11.5px; margin-bottom: 5px; color: #333; }

	/* Main sections */
	.sec-title { font-size: 16px; font-weight: 700; color: #111; margin: 0 0 10px; }

	.summary-text { font-size: 11.5px; line-height: 1.7; color: #444; margin-bottom: 20px; }

	/* Work experience card */
	.work-card {
		border-left: 4px solid #2a5298; padding: 8px 0 8px 14px; margin-bottom: 16px;
	}
	.work-role { font-size: 13px; font-weight: 700; color: #111; }
	.work-company { font-size: 12px; color: #333; }
	.work-date { font-size: 11px; color: #666; margin-bottom: 6px; }
	.work-desc { font-size: 11px; line-height: 1.6; color: #555; text-align: justify; margin-top: 6px; }

	/* Education */
	.edu-item { margin-bottom: 12px; }
	.edu-degree { font-size: 12px; font-weight: 600; color: #222; }
	.edu-inst { font-size: 11.5px; color: #444; }
	.edu-year { font-size: 11px; color: #666; }

	/* Projects */
	.proj-item { margin-bottom: 12px; }
	.proj-name { font-size: 12px; font-weight: 600; color: #222; }
	.proj-desc { font-size: 11px; color: #555; margin-top: 2px; }
	.proj-tech { font-size: 10px; color: #888; margin-top: 3px; }
</style>
</head>
<body>

<!-- HEADER -->
<table class="header-table">
	<tr>
		<td class="header-left">
			<div class="hdr-name">${name}</div>
			${title ? `<div class="hdr-title">${title}</div>` : ''}
		</td>
		<td class="header-right">
			<!-- Vertical line above -->
			<div class="vline-cell"><div class="vline"></div></div>
			<table class="contact-table">
				${phone ? `<tr>
					<td class="contact-label">Phone</td>
					<td class="contact-bar-cell"><span class="contact-bar"></span></td>
					<td class="contact-value">${phone}</td>
				</tr>` : ''}
				${email ? `<tr>
					<td class="contact-label">Email</td>
					<td class="contact-bar-cell"><span class="contact-bar"></span></td>
					<td class="contact-value">${email}</td>
				</tr>` : ''}
				${location ? `<tr>
					<td class="contact-label">Location</td>
					<td class="contact-bar-cell"><span class="contact-bar"></span></td>
					<td class="contact-value">${location}</td>
				</tr>` : ''}
				${totalExp ? `<tr>
					<td class="contact-label">Experience</td>
					<td class="contact-bar-cell"><span class="contact-bar"></span></td>
					<td class="contact-value">${totalExp}</td>
				</tr>` : ''}
			</table>
			<!-- Vertical line below -->
			<div class="vline-cell"><div class="vline"></div></div>
		</td>
	</tr>
</table>

<!-- Blue divider -->
<div class="blue-divider"></div>

<!-- BODY -->
<table>
	<tr>
		<td class="body-left">

			<!-- Key Skills -->
			${d.skills.technical.length ? `
			<div class="sb-title">Key Skills</div>
			<ul class="sb-list">
				${d.skills.technical.map(s => `<li>${skillName(s)}</li>`).join('')}
			</ul>` : ''}

			<!-- Certifications -->
			${d.certifications.length ? `
			<div class="sb-title">Certification</div>
			<ul class="sb-list">
				${d.certifications.map(c => `<li>${c.name}${c.issuer ? ` — ${c.issuer}` : ''}</li>`).join('')}
			</ul>` : ''}

			<!-- Languages -->
			<div class="sb-title">Languages</div>
			<ul class="sb-list"><li>English</li></ul>

		</td>

		<td class="body-right">

			<!-- Profile Summary -->
			${d.summary ? `
			<div class="sec-title">Profile Summary</div>
			<div class="summary-text">${d.summary}</div>
			` : ''}

			<!-- Work Experience -->
			${d.experience.length ? `
			<div class="sec-title">Work Experience</div>
			${d.experience.map(e => `
			<div class="work-card">
				<div class="work-role">${e.position}</div>
				<div class="work-company">${e.company}</div>
				<div class="work-date">${formatDuration(e)}</div>
				${e.description ? `<div class="work-desc">${e.description}</div>` : ''}
			</div>`).join('')}
			` : ''}

			<!-- Education -->
			${d.education.length ? `
			<div class="sec-title">Education</div>
			${d.education.map(e => `
			<div class="edu-item">
				<div class="edu-degree">${e.degree || e.education_type || ''}</div>
				<div class="edu-inst">${e.institution}</div>
				<div class="edu-year">${formatYear(e)}</div>
			</div>`).join('')}
			` : ''}

			<!-- Projects -->
			${d.projects.length ? `
			<div class="sec-title" style="margin-top:16px">Projects</div>
			${d.projects.map(p => `
			<div class="proj-item">
				<div class="proj-name">${p.name}</div>
				${p.description ? `<div class="proj-desc">${p.description}</div>` : ''}
				${p.technologies ? `<div class="proj-tech">${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}</div>` : ''}
			</div>`).join('')}
			` : ''}

		</td>
	</tr>
</table>

</body>
</html>`;
}
