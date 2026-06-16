import { ResumeData, skillName, formatDuration, formatYear, formatDescription } from './resume-data.model';

export function creativeTemplate(d: ResumeData): string {
	const name = d.personalInfo?.full_name || 'Your Name';
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
			const parts = dur.split('-').map(s => s.trim());
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
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body { font-family: 'Segoe UI', Arial, sans-serif; color: #444; font-size: 12px; line-height: 1.5; background: #fff; }
	table { width: 100%; border-collapse: collapse; table-layout: fixed; }
	td { vertical-align: top; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; }

	/* Sidebar */
	.sidebar { width: 33%; background: #e8ecf1; padding: 0; }
	.photo-area {
		width: 100%; height: 200px; background: #d5dce6; position: relative;
		border-bottom-right-radius: 50% 40px;
	}
	.photo-placeholder {
		width: 130px; height: 130px; border-radius: 50%; background: #bcc5d0;
		border: 4px solid #fff; display: block; margin: 30px auto 0;
		text-align: center; line-height: 130px; font-size: 48px; color: #8899aa;
	}
	.sidebar-content { padding: 24px 20px; }
	.sb-section { margin-bottom: 24px; }
	.sb-heading {
		display: flex; align-items: center; gap: 8px;
		font-size: 15px; font-weight: 700; color: #222; margin-bottom: 4px;
	}
	.sb-icon { font-size: 16px; }
	.sb-line { width: 60%; height: 2px; background: #222; margin-bottom: 14px; }
	.sb-list { list-style: disc; padding-left: 20px; margin: 0; }
	.sb-list li { font-size: 11.5px; margin-bottom: 4px; color: #444; }
	.detail-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11.5px; }
	.detail-label { color: #666; }
	.detail-value { font-weight: 600; color: #222; text-align: right; max-width: 55%; }

	/* Main */
	.main { width: 67%; padding: 28px 28px 28px 24px; }
	.main-name { font-size: 30px; font-weight: 700; color: #222; line-height: 1.15; }
	.main-title { font-size: 13px; color: #666; margin: 4px 0 16px; }

	/* Contact bar */
	.contact-bar {
		display: flex; justify-content: space-between; align-items: flex-start;
		border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;
		padding: 10px 0; margin-bottom: 22px;
	}
	.contact-cell { flex: 1; text-align: center; font-size: 11px; color: #444; }
	.contact-cell:not(:last-child) { border-right: 1px solid #ccc; }
	.contact-cell-icon { font-size: 16px; display: block; margin-bottom: 3px; color: #222; }

	/* Section heading */
	.sec-heading {
		display: flex; align-items: center; gap: 8px;
		font-size: 16px; font-weight: 700; color: #222; margin: 22px 0 4px;
	}
	.sec-icon { font-size: 18px; color: #222; }
	.sec-line { height: 2px; background: #222; margin-bottom: 14px; }

	.summary-text { font-size: 11.5px; line-height: 1.65; color: #444; text-align: justify; }

	/* Badge */
	.badge {
		display: inline-block; background: #eee; padding: 3px 10px; border-radius: 2px;
		font-size: 11px; font-weight: 500; color: #444; margin-bottom: 6px;
	}

	/* Experience item */
	.exp-item { margin-bottom: 18px; }
	.exp-role { font-size: 12px; font-weight: 500; color: #222; }
	.exp-company { font-size: 12px; font-weight: 700; color: #222; margin-bottom: 4px; }
	.exp-desc { font-size: 11px; line-height: 1.6; color: #444; text-align: justify; }
	.exp-desc ul { margin: 4px 0 0; padding-left: 18px; list-style: disc; }
	.exp-desc li { font-size: 11px; line-height: 1.6; color: #444; margin-bottom: 2px; }

	/* Education item */
	.edu-item { margin-bottom: 14px; }
	.edu-institution { font-size: 11.5px; color: #444; }

	/* Projects */
	.proj-item { margin-bottom: 12px; }
	.proj-name { font-size: 12px; font-weight: 600; color: #222; }
	.proj-desc { font-size: 11px; color: #444; margin-top: 2px; }
	.proj-tech { font-size: 10px; color: #666; margin-top: 3px; }
</style>
</head>
<body>
<table>
	<tr>
		<!-- LEFT SIDEBAR -->
		<td class="sidebar">
			<div class="photo-area">
				<div class="photo-placeholder">&#128100;</div>
			</div>
			<div class="sidebar-content">

				<!-- Key Skills -->
				${d.skills.technical.length ? `
				<div class="sb-section">
					<div class="sb-heading"><span class="sb-icon">&#9998;</span> Key skills</div>
					<div class="sb-line"></div>
					<ul class="sb-list">
						${d.skills.technical.map(s => `<li>${skillName(s)}</li>`).join('')}
					</ul>
				</div>` : ''}

				<!-- Personal Information -->
				<div class="sb-section">
					<div class="sb-heading"><span class="sb-icon">&#128196;</span> Personal Information</div>
					<div class="sb-line"></div>
					${location ? `<div class="detail-row"><span class="detail-label">City</span><span class="detail-value">${location}</span></div>` : ''}
					${linkedin ? `<div class="detail-row"><span class="detail-label">LinkedIn</span><span class="detail-value">${linkedin}</span></div>` : ''}
					${github ? `<div class="detail-row"><span class="detail-label">GitHub</span><span class="detail-value">${github}</span></div>` : ''}
					${portfolio ? `<div class="detail-row"><span class="detail-label">Portfolio</span><span class="detail-value">${portfolio}</span></div>` : ''}
				</div>

				<!-- Languages -->
				<div class="sb-section">
					<div class="sb-heading"><span class="sb-icon">&#128172;</span> Languages</div>
					<div class="sb-line"></div>
					<ul class="sb-list"><li>English</li></ul>
				</div>

			</div>
		</td>

		<!-- RIGHT MAIN -->
		<td class="main">
			<div class="main-name">${name}</div>
			${title ? `<div class="main-title">${title}</div>` : '<div style="margin-bottom:12px"></div>'}

			<!-- Contact bar -->
			<div class="contact-bar">
				${totalExp ? `<div class="contact-cell"><span class="contact-cell-icon">&#128188;</span>${totalExp}</div>` : ''}
				${phone ? `<div class="contact-cell"><span class="contact-cell-icon">&#128241;</span>${phone}</div>` : ''}
				${email ? `<div class="contact-cell"><span class="contact-cell-icon">&#9993;</span>${email}</div>` : ''}
			</div>

			<!-- Profile Summary -->
			${d.summary ? `
			<div class="sec-heading"><span class="sec-icon">&#128196;</span> Profile Summary</div>
			<div class="sec-line"></div>
			<div class="summary-text">${d.summary}</div>
			` : ''}

			<!-- Education -->
			${d.education.length ? `
			<div class="sec-heading"><span class="sec-icon">&#127891;</span> Education</div>
			<div class="sec-line"></div>
			${d.education.map(e => `
			<div class="edu-item">
				<div class="badge">${e.degree || e.education_type || ''}${formatYear(e) ? ', ' + formatYear(e) : ''}</div>
				<div class="edu-institution">${e.institution}</div>
			</div>`).join('')}
			` : ''}

			<!-- Work Experience -->
			${d.experience.length ? `
			<div class="sec-heading"><span class="sec-icon">&#127970;</span> Work Experience</div>
			<div class="sec-line"></div>
			${d.experience.map(e => `
			<div class="exp-item">
				<div class="badge">${formatDuration(e)}</div>
				<div class="exp-role">${e.position}</div>
				<div class="exp-company">${e.company}</div>
				${e.description ? `<div class="exp-desc">${formatDescription(e.description)}</div>` : ''}
			</div>`).join('')}
			` : ''}

			<!-- Projects -->
			${d.projects.length ? `
			<div class="sec-heading"><span class="sec-icon">&#128187;</span> Projects</div>
			<div class="sec-line"></div>
			${d.projects.map(p => `
			<div class="proj-item">
				<div class="proj-name">${p.name}</div>
				${p.description ? `<div class="proj-desc">${p.description}</div>` : ''}
				${p.technologies ? `<div class="proj-tech">${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}</div>` : ''}
			</div>`).join('')}
			` : ''}

			<!-- Certifications -->
			${d.certifications.length ? `
			<div class="sec-heading"><span class="sec-icon">&#9989;</span> Certifications</div>
			<div class="sec-line"></div>
			${d.certifications.map(c => `
			<div style="margin-bottom:8px">
				<div style="font-weight:600;font-size:12px;color:#222">${c.name}</div>
				${c.issuer ? `<div style="font-size:11px;color:#666">${c.issuer}</div>` : ''}
			</div>`).join('')}
			` : ''}
		</td>
	</tr>
</table>
</body>
</html>`;
}
