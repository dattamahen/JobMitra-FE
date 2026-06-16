import { ResumeData, skillName, formatDuration, formatYear, formatDescription } from './resume-data.model';

export function classicTemplate(d: ResumeData): string {
	const name = d.personalInfo?.full_name || 'Your Name';
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
			return `${y} Year${y !== 1 ? 's' : ''} ${m} Month${m !== 1 ? 's' : ''}`;
		})()
		: '';

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; font-size: 12px; line-height: 1.5; background: #fff; }
	table { width: 100%; border-collapse: collapse; table-layout: fixed; }
	td { overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; }

	/* Sidebar */
	.sidebar {
		width: 32%; vertical-align: top; background: #f5e6a3; padding: 0;
	}
	.photo-area {
		width: 100%; height: 180px; background: #e0d08a; display: flex;
		align-items: center; justify-content: center; position: relative; overflow: hidden;
	}
	.photo-placeholder {
		width: 120px; height: 120px; border-radius: 50%; background: #ccc;
		border: 4px solid #fff; display: flex; align-items: center; justify-content: center;
		font-size: 36px; color: #999; margin: 30px auto;
	}
	.sidebar-content { padding: 20px; }
	.sidebar h2 {
		font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
		margin: 20px 0 6px; color: #222;
	}
	.sidebar h2:first-child { margin-top: 0; }
	.section-line { width: 40px; height: 3px; background: #2a5298; margin-bottom: 14px; }
	.contact-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 10px; font-size: 11px; }
	.contact-icon { font-size: 13px; min-width: 16px; }
	.contact-label { font-weight: 600; font-size: 11px; }
	.contact-value { font-size: 11px; color: #444; overflow-wrap: break-word; word-break: break-all; }
	.skill-item { font-size: 11px; padding: 4px 0; border-bottom: 1px solid rgba(0,0,0,0.06); }
	.skill-item:last-child { border-bottom: none; }
	.detail-row { display: flex; gap: 12px; margin-bottom: 6px; font-size: 11px; }
	.detail-label { font-weight: 600; min-width: 60px; color: #555; }
	.detail-value { color: #333; overflow-wrap: break-word; word-break: break-all; }

	/* Main */
	.main { width: 68%; vertical-align: top; padding: 30px 30px 30px 24px; }
	.main-name { font-size: 28px; font-weight: 700; color: #222; line-height: 1.2; margin-bottom: 2px; }
	.main-title { font-size: 13px; color: #555; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #ddd; }
	.main h2 {
		font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
		margin: 22px 0 6px; color: #222;
	}
	.main .section-line { width: 40px; height: 3px; background: #2a5298; margin-bottom: 14px; }
	.summary-text { font-size: 11.5px; line-height: 1.6; color: #444; margin-bottom: 8px; text-align: justify; }

	/* Timeline */
	.timeline-item { display: flex; gap: 14px; margin-bottom: 18px; }
	.timeline-date { min-width: 70px; max-width: 70px; font-size: 10.5px; color: #666; padding-top: 2px; text-align: right; word-break: break-word; }
	.timeline-dot { display: flex; flex-direction: column; align-items: center; padding-top: 5px; }
	.dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #2a5298; background: #fff; flex-shrink: 0; }
	.dot-line { width: 1px; flex: 1; background: #ccc; margin-top: 2px; }
	.timeline-content { flex: 1; min-width: 0; overflow-wrap: break-word; }
	.timeline-role { font-size: 12px; font-weight: 600; color: #222; }
	.timeline-company { font-size: 12px; font-weight: 700; color: #333; margin-bottom: 4px; }
	.timeline-desc { font-size: 11px; line-height: 1.55; color: #555; text-align: justify; }
	.timeline-desc ul { margin: 4px 0 0; padding-left: 18px; list-style: disc; }
	.timeline-desc li { font-size: 11px; line-height: 1.55; color: #555; margin-bottom: 2px; }
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

				<!-- Personal Information -->
				<h2>Personal Information</h2>
				<div class="section-line"></div>

				${email ? `<div class="contact-item">
					<span class="contact-icon">&#9993;</span>
					<div><div class="contact-label">Email</div><div class="contact-value">${email}</div></div>
				</div>` : ''}

				${phone ? `<div class="contact-item">
					<span class="contact-icon">&#9742;</span>
					<div><div class="contact-label">Mobile</div><div class="contact-value">${phone}</div></div>
				</div>` : ''}

				${totalExp ? `<div class="contact-item">
					<span class="contact-icon">&#128188;</span>
					<div><div class="contact-label">Total work experience</div><div class="contact-value">${totalExp}</div></div>
				</div>` : ''}

				<!-- Key Skills -->
				${d.skills.technical.length ? `
				<h2>Key Skills</h2>
				<div class="section-line"></div>
				${d.skills.technical.map(s => `<div class="skill-item">${skillName(s)}</div>`).join('')}
				` : ''}

				<!-- Other Personal Details -->
				<h2>Other Personal Details</h2>
				<div class="section-line"></div>
				${location ? `<div class="detail-row"><span class="detail-label">City</span><span class="detail-value">${location}</span></div>` : ''}

				${linkedin ? `<div class="detail-row"><span class="detail-label">LinkedIn</span><span class="detail-value">${linkedin}</span></div>` : ''}
				${github ? `<div class="detail-row"><span class="detail-label">GitHub</span><span class="detail-value">${github}</span></div>` : ''}
				${portfolio ? `<div class="detail-row"><span class="detail-label">Portfolio</span><span class="detail-value">${portfolio}</span></div>` : ''}
			</div>
		</td>

		<!-- RIGHT MAIN -->
		<td class="main">
			<div class="main-name">${name}</div>
			${title ? `<div class="main-title">${title}</div>` : '<div style="margin-bottom:16px"></div>'}

			<!-- Profile Summary -->
			${d.summary ? `
			<h2>Profile Summary</h2>
			<div class="section-line"></div>
			<div class="summary-text">${d.summary}</div>
			` : ''}

			<!-- Education -->
			${d.education.length ? `
			<h2>Education</h2>
			<div class="section-line"></div>
			${d.education.map((e, i) => `
			<div class="timeline-item">
				<div class="timeline-date">${formatYear(e)}</div>
				<div class="timeline-dot">
					<div class="dot"></div>
					${i < d.education.length - 1 ? '<div class="dot-line"></div>' : ''}
				</div>
				<div class="timeline-content">
					<div class="timeline-role">${e.degree || e.education_type || ''}</div>
					<div class="timeline-company">${e.institution}</div>
				</div>
			</div>`).join('')}
			` : ''}

			<!-- Work Experience -->
			${d.experience.length ? `
			<h2>Work Experience</h2>
			<div class="section-line"></div>
			${d.experience.map((e, i) => `
			<div class="timeline-item">
				<div class="timeline-date">${formatDuration(e)}</div>
				<div class="timeline-dot">
					<div class="dot"></div>
					${i < d.experience.length - 1 ? '<div class="dot-line"></div>' : ''}
				</div>
				<div class="timeline-content">
					<div class="timeline-role">${e.position}</div>
					<div class="timeline-company">${e.company}</div>
					${e.description ? `<div class="timeline-desc">${formatDescription(e.description)}</div>` : ''}
				</div>
			</div>`).join('')}
			` : ''}

			<!-- Projects -->
			${d.projects.length ? `
			<h2>Projects</h2>
			<div class="section-line"></div>
			${d.projects.map(p => `
			<div style="margin-bottom:12px">
				<div style="font-weight:600;font-size:12px">${p.name}</div>
				${p.description ? `<div style="font-size:11px;color:#555;margin-top:2px">${p.description}</div>` : ''}
				${p.technologies ? `<div style="font-size:10px;color:#888;margin-top:3px">${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}</div>` : ''}
			</div>`).join('')}
			` : ''}

			<!-- Certifications -->
			${d.certifications.length ? `
			<h2>Certifications</h2>
			<div class="section-line"></div>
			${d.certifications.map(c => `
			<div style="margin-bottom:8px">
				<div style="font-weight:600;font-size:12px">${c.name}</div>
				${c.issuer ? `<div style="font-size:11px;color:#555">${c.issuer}</div>` : ''}
			</div>`).join('')}
			` : ''}
		</td>
	</tr>
</table>
</body>
</html>`;
}
