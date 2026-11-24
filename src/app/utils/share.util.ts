const WA_CHANNELS = [
  `📢 Join our WhatsApp Channels for more jobs:`,
  `👔 Experienced: https://whatsapp.com/channel/0029VbESGTO8F2pHL4NOmt3S`,
  `🎓 Freshers: https://whatsapp.com/channel/0029VbDZLJS3wtb7Zhe2G90h`,
];

export interface ShareJobData {
  title: string;
  company: string;
  location?: { city?: string; state?: string; is_remote?: boolean } | null;
  experience_level?: string;
  employment_type?: string;
  skills_required?: string[];
  responsibilities?: string[];
}

/**
 * Builds the WhatsApp/Telegram share text for a job posting.
 * Single source of truth — used by job-card and refer-hire.
 */
export function buildJobShareText(job: ShareJobData): string {
  const loc = [job.location?.city, job.location?.state].filter(Boolean).join(', ')
    || (job.location?.is_remote ? 'Remote' : '');

  const lines: string[] = [`🚀 *${job.title}* at *${job.company}*`];

  if (loc)                          lines.push(`📍 ${loc}${job.location?.is_remote ? ' (Remote)' : ''}`);
  if (job.experience_level)         lines.push(`🎯 ${job.experience_level}${job.employment_type ? ' · ' + job.employment_type : ''}`);
  if (job.skills_required?.length)  lines.push(`🛠 Skills: ${job.skills_required.slice(0, 5).join(', ')}${job.skills_required.length > 5 ? ' & more' : ''}`);

  if (job.responsibilities?.length) {
    lines.push(``, `📌 *Key Responsibilities:*`);
    job.responsibilities.slice(0, 3).forEach(r => lines.push(`• ${r}`));
  }

  lines.push(
    ``,
    `👉 Apply now on JobMouka:`,
    `🌐 https://www.jobmouka.com`,
    `📱 https://play.google.com/store/apps/details?id=com.jobmouka.app`,
    ``,
    ...WA_CHANNELS,
  );

  return lines.join('\n');
}
